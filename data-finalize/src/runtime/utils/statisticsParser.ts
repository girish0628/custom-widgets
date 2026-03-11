import type { FeatureLayerConfig } from '../../config'
import type { FeatureStatus, LayerStatRow } from '../../types'

const EMPTY_STATUS: Readonly<FeatureStatus> = {
  Edited: 0,
  ReEdited: 0,
  New: 0,
  Deleted: 0
}

/**
 * Pairs each layer config with its resolved statistics result.
 * The two arrays must be the same length and in the same order —
 * i.e. results[i] corresponds to layers[i].
 */
export function buildLayerStatRows(
  layers: readonly FeatureLayerConfig[],
  results: FeatureStatus[]
): LayerStatRow[] {
  return layers.map((layer, index) => ({
    featureName: layer.name,
    statuses: results[index] ?? { ...EMPTY_STATUS }
  }))
}

/**
 * Sums every status count across all rows.
 * Total = Σ (Edited + ReEdited + New + Deleted) per row
 */
export function calcTotalEdits(rows: LayerStatRow[]): number {
  return rows.reduce((total, row) => {
    const { Edited, ReEdited, New, Deleted } = row.statuses
    return total + Edited + ReEdited + New + Deleted
  }, 0)
}
