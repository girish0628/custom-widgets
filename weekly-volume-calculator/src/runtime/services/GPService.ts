/**
 * Typed error thrown when the GP service returns a non-success response.
 */
export class GPError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'GPError'
  }
}

/**
 * Calls a synchronous ArcGIS GP service to retrieve location names for a mine site.
 *
 * The task must accept a `mineSite` input parameter and return location names
 * in one of the following formats:
 *   - A comma-separated string (GPString)
 *   - A JSON array of strings
 *   - A GPFeatureRecordSetLayer with a string attribute (LocationName / Name / etc.)
 *
 * @param gpUrl    Full GP task URL, e.g. https://server/arcgis/rest/services/Svc/GPServer/TaskName
 * @param mineSite Mine site identifier to pass as the `mineSite` input parameter
 * @returns        Array of location name strings (empty array if none found)
 */
export async function fetchLocations(gpUrl: string, mineSite: string): Promise<string[]> {
  if (!gpUrl?.trim()) {
    throw new GPError('GP Service URL is not configured.')
  }

  const url = `${gpUrl.trim().replace(/\/$/, '')}/execute`

  const body = new URLSearchParams({ mineSite, f: 'json' })

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })

  if (!response.ok) {
    throw new GPError(
      `GP Service error: ${response.status} ${response.statusText}`,
      response.status
    )
  }

  const data = await response.json()

  if (data?.error) {
    throw new GPError(
      `GP Service returned error: ${data.error.message ?? JSON.stringify(data.error)}`
    )
  }

  const results: any[] = data?.results ?? []
  if (results.length === 0) return []

  const value = results[0]?.value

  // Shape 1: plain string (comma-separated)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
    } catch (_e) {}
    return value.split(',').map((s: string) => s.trim()).filter(Boolean)
  }

  // Shape 2: array of strings
  if (Array.isArray(value) && value.every((v: any) => typeof v === 'string')) {
    return value.filter(Boolean)
  }

  // Shape 3: GPFeatureRecordSetLayer
  if (value?.features && Array.isArray(value.features)) {
    const attrs: any[] = value.features.map((f: any) => f.attributes)
    const candidateFields = ['LocationName', 'location_name', 'Name', 'name', 'LOCATION', 'Location']
    for (const field of candidateFields) {
      const vals = attrs.map((a: any) => a[field]).filter(Boolean)
      if (vals.length > 0) return vals
    }
    // Fall back to first string-typed attribute
    if (attrs.length > 0) {
      const firstStringKey = Object.keys(attrs[0]).find(k => typeof attrs[0][k] === 'string')
      if (firstStringKey) return attrs.map((a: any) => a[firstStringKey]).filter(Boolean)
    }
  }

  return []
}
