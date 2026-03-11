import type { PortalLayer } from '../../types'

interface PortalItemResponse {
  url?: string
  error?: { code: number; message: string }
}

interface FeatureServerResponse {
  layers?: Array<{ id: number; name: string }>
  error?: { code: number; message: string }
}

/**
 * Resolves the Feature Service URL for an ArcGIS Portal item.
 *
 * Calls: GET {portalUrl}/sharing/rest/content/items/{itemId}?f=pjson
 *
 * @param portalUrl  Portal base URL, e.g. https://www.arcgis.com
 * @param itemId     ArcGIS Portal item ID
 * @returns          The Feature Service URL stored on the portal item
 */
export async function resolveFeatureServiceUrl(
  portalUrl: string,
  itemId: string
): Promise<string> {
  const base = portalUrl.replace(/\/$/, '')
  const params = new URLSearchParams({ f: 'pjson' })
  const res = await fetch(
    `${base}/sharing/rest/content/items/${itemId}?${params}`,
    { headers: { Accept: 'application/json' } }
  )

  if (!res.ok) {
    throw new Error(`Portal request failed with status ${res.status}.`)
  }

  const data: PortalItemResponse = await res.json()

  if (data.error) {
    throw new Error(`Portal API error ${data.error.code}: ${data.error.message}`)
  }

  if (!data.url) {
    throw new Error('The selected portal item does not have an associated service URL.')
  }

  return data.url
}

/**
 * Fetches the layer list from a FeatureServer.
 *
 * Calls: GET {serviceUrl}?f=pjson
 *
 * @param serviceUrl  Full FeatureServer URL, e.g. https://server/arcgis/rest/services/.../FeatureServer
 * @returns           Array of { id, name } for each layer
 */
export async function fetchFeatureLayers(serviceUrl: string): Promise<PortalLayer[]> {
  const base = serviceUrl.replace(/\/$/, '')
  const params = new URLSearchParams({ f: 'pjson' })
  const res = await fetch(
    `${base}?${params}`,
    { headers: { Accept: 'application/json' } }
  )

  if (!res.ok) {
    throw new Error(`FeatureServer request failed with status ${res.status}.`)
  }

  const data: FeatureServerResponse = await res.json()

  if (data.error) {
    throw new Error(`FeatureServer error ${data.error.code}: ${data.error.message}`)
  }

  return (data.layers ?? []).map(l => ({ id: l.id, name: l.name }))
}
