import { type ImmutableObject, getAppStore, UtilityManager } from 'jimu-core'

export interface Config {
  /** Mine site names shown in the runtime dropdown. Managed in settings. */
  mineSites: string[]
  /** GP utility object stored by UtilitySelector (contains utilityId + task). */
  gpUtility?: any[]
  /** Resolved GP task URL cached at settings-save time. */
  gpUrl?: string
  /** Jenkins server base URL, e.g. https://jenkins.company.com */
  jenkinsBaseUrl: string
  /** Jenkins job name, e.g. weekly-volume */
  jobName: string
  /**
   * Optional API token forwarded as a Bearer header.
   * For production, use a server-side proxy to inject credentials instead.
   */
  apiToken: string
}

export type IMConfig = ImmutableObject<Config>

/**
 * Resolves the full GP task URL from a utility object returned by UtilitySelector.
 * Tries UtilityManager → Redux state → direct .url property, in that order.
 */
export function resolveGPTaskUrl(utility: any): string | null {
  if (!utility) return null

  const utilityId: string = utility.utilityId || ''
  const task: string = utility.task || utility.taskName || ''

  if (utilityId) {
    // 1. UtilityManager (official jimu API)
    try {
      const uJson = UtilityManager.getInstance().getUtilityJson(utilityId)
      const baseUrl: string = (uJson as any)?.url || ''
      if (baseUrl) {
        return `${baseUrl.replace(/\/$/, '')}${task ? '/' + task : ''}`
      }
    } catch (_e) {}

    // 2. Fallback: walk the Redux state
    try {
      const state = getAppStore().getState() as any
      const stateAppConfig = state?.appConfig
      const builderAppConfig = state?.builder?.appStateInBuilder?.appConfig
      const appConfig =
        (stateAppConfig?.utilities?.[utilityId] ? stateAppConfig : null) ||
        (builderAppConfig?.utilities?.[utilityId] ? builderAppConfig : null) ||
        stateAppConfig ||
        builderAppConfig
      const def = appConfig?.utilities?.[utilityId]
      if (def?.url) {
        return `${(def.url as string).replace(/\/$/, '')}${task ? '/' + task : ''}`
      }
    } catch (_e) {}
  }

  // 3. Direct URL on the object
  const directUrl: string = utility.url || utility.serviceUrl || ''
  if (directUrl) {
    return `${directUrl.replace(/\/$/, '')}${task ? '/' + task : ''}`
  }

  return null
}
