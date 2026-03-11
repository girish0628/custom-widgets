export type AnalysisType = 'buffer' | 'intersect'

export type DistanceUnit =
  | 'meters'
  | 'kilometers'
  | 'feet'
  | 'yards'
  | 'miles'
  | 'nautical-miles'

export interface Config {
  defaultDistance?: number
  defaultUnit?: DistanceUnit
  defaultOutputLayerName?: string
  enableExport?: boolean
  maxIntersectFeatures?: number
  autoZoomToResult?: boolean
  showOnlyPolygonLayersForIntersect?: boolean
}

export interface LayerOption {
  id: string
  title: string
  geometryType?: string
  url?: string
}

export interface AnalysisMessage {
  type: 'info' | 'success' | 'warning' | 'error'
  text: string
}