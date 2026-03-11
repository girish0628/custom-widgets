import type { ImmutableObject } from 'seamless-immutable'
import { UtilityManager, getAppStore } from 'jimu-core'

export interface Config {
  gpUtility?: any[]        // Utility object stored by UtilitySelector (contains utilityId + task)
  gpTaskUrl?: string       // Resolved URL cached at settings-save time (fallback for runtime)
  gpOutputField: string    // GP parameter name whose choiceList holds the projection names
  transferFolderPath: string
  jenkinsBaseUrl: string
  jobName: string
  apiToken: string
}

export type IMConfig = ImmutableObject<Config>

/**
 * Resolves the full GP task URL from a utility object returned by UtilitySelector.
 *
 * Resolution order:
 *  1. UtilityManager (official jimu API, works in runtime)
 *  2. Redux app-store state fallback (works in builder preview)
 *  3. Direct .url property cached on the utility object at settings-save time
 */
export function resolveGPTaskUrl(utility: any): string | null {
  if (!utility) return null

  const utilityId: string = utility.utilityId || ''
  const task: string = utility.task || utility.taskName || ''

  if (utilityId) {
    // 1. UtilityManager
    try {
      const uJson = UtilityManager.getInstance().getUtilityJson(utilityId)
      const baseUrl: string = (uJson as any)?.url || ''
      if (baseUrl) {
        return `${baseUrl.replace(/\/$/, '')}${task ? '/' + task : ''}`
      }
    } catch (_) { /* fall through */ }

    // 2. Redux state fallback
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
    } catch (_) { /* fall through */ }
  }

  // 3. Direct URL cached on the object
  const directUrl: string = utility.url || utility.serviceUrl || ''
  if (directUrl) {
    return `${directUrl.replace(/\/$/, '')}${task ? '/' + task : ''}`
  }

  return null
}
