import type { ImmutableObject } from 'seamless-immutable'

/**
 * A single feature layer entry configured in the settings panel.
 * layerIndex maps to the numeric index on the FeatureServer.
 */
export interface FeatureLayerConfig {
  /** Unique client-side id (used as React key). */
  id: string
  /** Display name shown in the table (e.g. "Gates"). */
  name: string
  /** Numeric layer index appended to the service URL. */
  layerIndex: number
}

export interface Config {
  /**
   * ArcGIS Portal Item ID for the Feature Service.
   * The runtime resolves this to a service URL via the Portal API.
   */
  featureServiceItemId: string
  /** Ordered list of feature layers to query. */
  featureLayers: FeatureLayerConfig[]
  /** Jenkins server base URL, e.g. https://jenkins.company.com */
  jenkinsBaseUrl: string
  /** Jenkins job name, e.g. data-finalise */
  jobName: string
  /**
   * Loader identifier, e.g. "pathgi@APAC".
   * Used as WHERE Loader='...' in the statistics query and
   * forwarded as the `loader` parameter to Jenkins.
   */
  loader: string
  /** Mine site identifier forwarded as the `mineSite` parameter to Jenkins. */
  mineSite: string
}

export type IMConfig = ImmutableObject<Config>
