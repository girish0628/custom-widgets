export class GPServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GPServiceError'
  }
}

/**
 * Fetches the projection list from a GP task metadata endpoint.
 *
 * The gpTaskUrl is the fully-resolved URL including the task name
 * (e.g. https://server/arcgis/rest/services/Foo/GPServer/GetProjections),
 * resolved at runtime via resolveGPTaskUrl() from config.ts.
 *
 * Handles two response shapes:
 *  1. ESRI GP task info (f=pjson): parameters[].choiceList where name === gpOutputField
 *  2. Custom flat format: data.projections (string array)
 *
 * @param gpTaskUrl     Full GP task URL (base + task name)
 * @param gpOutputField Parameter name whose choiceList contains the projections
 */
export async function fetchProjections(
  gpTaskUrl: string,
  gpOutputField: string = 'projection'
): Promise<string[]> {
  if (!gpTaskUrl?.trim()) {
    throw new GPServiceError('GP task URL could not be resolved. Check the GP service is configured in Settings.')
  }

  const url = `${gpTaskUrl.trim().replace(/\/$/, '')}?f=pjson`
  const response = await fetch(url)

  if (!response.ok) {
    throw new GPServiceError(
      `GP service returned ${response.status}: ${response.statusText}`
    )
  }

  const data = await response.json()

  if (data.error) {
    throw new GPServiceError(
      `GP service error: ${data.error.message ?? JSON.stringify(data.error)}`
    )
  }

  // Shape 1: custom flat response — { "projections": ["GDA1994 MGA Zone 50", ...] }
  if (Array.isArray(data.projections) && data.projections.length > 0) {
    return data.projections as string[]
  }

  // Shape 2: ESRI GP task metadata — parameters[].choiceList
  if (Array.isArray(data.parameters)) {
    const field = gpOutputField.trim().toLowerCase()
    const param = data.parameters.find(
      (p: { name?: string }) => p.name?.toLowerCase() === field
    )
    if (Array.isArray(param?.choiceList) && param.choiceList.length > 0) {
      return param.choiceList as string[]
    }

    // Fallback: return choiceList from the first parameter that has one
    for (const p of data.parameters) {
      if (Array.isArray(p.choiceList) && p.choiceList.length > 0) {
        return p.choiceList as string[]
      }
    }
  }

  throw new GPServiceError(
    `No projection list found in GP task response. ` +
    `Ensure the task has a parameter named "${gpOutputField}" with a choiceList.`
  )
}
