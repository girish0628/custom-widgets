import { React } from 'jimu-core'
import type { IMConfig } from '../../config'
import type { LayerStatRow, QueryStatus } from '../../types'
import { resolveFeatureServiceUrl } from '../services/PortalService'
import { queryLayerStatistics } from '../services/FeatureService'
import { buildLayerStatRows, calcTotalEdits } from '../utils/statisticsParser'

const { useState, useEffect, useCallback } = React

export interface UseFeatureStatsResult {
  rows: LayerStatRow[]
  totalEdits: number
  queryStatus: QueryStatus
  queryError: string | null
  refresh: () => void
}

/**
 * Fetches edit statistics for all configured feature layers.
 *
 * Flow:
 *  1. Resolve Feature Service URL from Portal Item ID
 *  2. Query each layer concurrently using statistics API
 *  3. Parse and return results
 *
 * Runs automatically when config or portalUrl changes.
 *
 * @param config     Immutable widget config
 * @param portalUrl  ArcGIS Portal base URL from widget props
 */
export function useFeatureStats(
  config: IMConfig,
  portalUrl: string | undefined
): UseFeatureStatsResult {
  const [rows, setRows] = useState<LayerStatRow[]>([])
  const [totalEdits, setTotalEdits] = useState(0)
  const [queryStatus, setQueryStatus] = useState<QueryStatus>('idle')
  const [queryError, setQueryError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    const itemId = config.featureServiceItemId?.trim()
    const layers = config.featureLayers

    if (!itemId || !layers?.length || !portalUrl) {
      setQueryStatus('idle')
      setRows([])
      setTotalEdits(0)
      return
    }

    setQueryStatus('loading')
    setQueryError(null)

    try {
      const serviceUrl = await resolveFeatureServiceUrl(portalUrl, itemId)
      const loaderFilter = config.loader?.trim() || undefined

      const results = await Promise.all(
        Array.from(layers).map(layer =>
          queryLayerStatistics(`${serviceUrl}/${layer.layerIndex}`, loaderFilter)
        )
      )

      const newRows = buildLayerStatRows(Array.from(layers), results)
      setRows(newRows)
      setTotalEdits(calcTotalEdits(newRows))
      setQueryStatus('success')
    } catch (err) {
      setQueryStatus('error')
      setQueryError(err instanceof Error ? err.message : 'Failed to fetch statistics.')
      setRows([])
      setTotalEdits(0)
    }
  }, [config, portalUrl])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { rows, totalEdits, queryStatus, queryError, refresh: fetchStats }
}
