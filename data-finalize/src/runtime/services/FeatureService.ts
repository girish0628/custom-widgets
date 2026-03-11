import type { FeatureStatus } from '../../types'

/** Shape of one record returned by the ArcGIS statistics query. */
interface StatRecord {
  attributes: {
    FeatureStatus: string
    FeatureCount: number
  }
}

/** Minimal type for the ArcGIS REST query JSON response. */
interface ArcGISStatResponse {
  features?: StatRecord[]
  error?: { code: number; message: string }
}

const STATUS_KEYS: ReadonlyArray<keyof FeatureStatus> = ['Edited', 'ReEdited', 'New', 'Deleted']

/**
 * Queries a single feature layer using the ArcGIS REST statistics API.
 *
 * Equivalent REST call:
 *   GET {layerUrl}/query
 *     ?where=1=1  (or  Loader='...'  when loaderFilter is supplied)
 *     &groupByFieldsForStatistics=FeatureStatus
 *     &outStatistics=[{"statisticType":"count","onStatisticField":"FeatureStatus","outStatisticFieldName":"FeatureCount"}]
 *     &f=json
 *
 * @param layerUrl   Full URL to the layer, e.g. .../FeatureServer/0
 * @param loaderFilter  Optional value used in WHERE Loader='{loaderFilter}'
 * @returns  Counts for each of the four statuses (zero when not present).
 * @throws   Error when the network request fails or ArcGIS returns an error object.
 */
export async function queryLayerStatistics(
  layerUrl: string,
  loaderFilter?: string
): Promise<FeatureStatus> {
  const where = loaderFilter?.trim() ? `Loader='${loaderFilter.trim()}'` : '1=1'

  const outStatistics = JSON.stringify([
    {
      statisticType: 'count',
      onStatisticField: 'FeatureStatus',
      outStatisticFieldName: 'FeatureCount'
    }
  ])

  const params = new URLSearchParams({
    where,
    groupByFieldsForStatistics: 'FeatureStatus',
    outStatistics,
    f: 'json'
  })

  const response = await fetch(`${layerUrl}/query?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`Network error ${response.status} querying ${layerUrl}`)
  }

  const data: ArcGISStatResponse = await response.json()

  if (data.error) {
    throw new Error(`ArcGIS error ${data.error.code}: ${data.error.message}`)
  }

  const result: FeatureStatus = { Edited: 0, ReEdited: 0, New: 0, Deleted: 0 }

  for (const record of data.features ?? []) {
    const status = record.attributes.FeatureStatus as keyof FeatureStatus
    if (STATUS_KEYS.includes(status)) {
      result[status] = record.attributes.FeatureCount ?? 0
    }
  }

  return result
}
