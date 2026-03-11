/**
 * The four edit statuses tracked per feature layer.
 */
export interface FeatureStatus {
  Edited: number
  ReEdited: number
  New: number
  Deleted: number
}

/**
 * One row in the statistics table — a named feature layer + its status counts.
 */
export interface LayerStatRow {
  featureName: string
  statuses: FeatureStatus
}

/**
 * A layer returned from the ArcGIS FeatureServer metadata endpoint.
 */
export interface PortalLayer {
  id: number
  name: string
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error'
export type FinalizeStatus = 'idle' | 'loading' | 'success' | 'error'
