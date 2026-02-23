import { ImmutableObject, getAppStore } from 'jimu-core';

/**
 * Main widget configuration interface
 */
export interface Config {
  rpasGPUtility?: any[];         // GP utility for RPAS Data Loader (used by RPAS Elevation & TLS Elevation)
  smallProjectGPUtility?: any[]; // GP utility for Small Project Imagery
  projectionGPUtility?: any[];   // GP utility for fetching the projection list
  selectedProjections?: { [key: string]: string }; // Admin-selected projections from the GP task
  maxFileSizeMB: number;
  allowedExtensions: string[];
  style?: StyleConfig;
}

/**
 * Style configuration interface
 */
export interface StyleConfig {
  primaryColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  infoColor?: string;
  padding?: number;
  formGroupSpacing?: number;
  labelFontSize?: number;
  inputFontSize?: number;
  borderRadius?: number;
  inputBorderWidth?: number;
}

/**
 * Validation result structure for form validation
 */
export interface ValidationResult {
  isValid: boolean;
  error: string;
  field?: string;
}

export type IMStyleConfig = ImmutableObject<StyleConfig>;

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  primaryColor: '#0079c1',
  borderColor: '#d3d3d3',
  backgroundColor: '#ffffff',
  successColor: '#35ac46',
  errorColor: '#d32f2f',
  warningColor: '#ffc107',
  infoColor: '#00bcd4',
  padding: 20,
  formGroupSpacing: 20,
  labelFontSize: 0.95,
  inputFontSize: 0.95,
  borderRadius: 4,
  inputBorderWidth: 1
};

/**
 * Resolve the full GP task URL from a utility object returned by UtilitySelector.
 *
 * UtilitySelector stores { utilityId, task } — the actual service URL lives in
 * appConfig.utilities[utilityId].  We look it up from the app store first, and
 * fall back to a direct .url property in case a future jimu version embeds it.
 */
export function resolveGPTaskUrl(utility: any): string | null {
  if (!utility) return null;

  // ── 1. Look up the service URL from the app config by utilityId ───────────
  const utilityId: string = utility.utilityId || '';
  if (utilityId) {
    try {
      const state = getAppStore().getState() as any;
      // The utilities dict lives at appConfig.utilities in both runtime and builder
      const appConfig =
        state?.appConfig ||
        state?.builder?.appStateInBuilder?.appConfig;
      const def = appConfig?.utilities?.[utilityId];
      if (def?.url) {
        const task: string = def.task || utility.task || '';
        const url = `${(def.url as string).replace(/\/$/, '')}${task ? '/' + task : ''}`;
        console.log('[resolveGPTaskUrl] resolved from appConfig:', url);
        return url;
      }
    } catch (e) {
      console.warn('[resolveGPTaskUrl] appConfig lookup failed:', e);
    }
  }

  // ── 2. Fall back: URL embedded directly on the utility object ────────────
  const directUrl: string = utility.url || utility.serviceUrl || '';
  if (directUrl) {
    const task: string = utility.task || utility.taskName || '';
    const url = `${directUrl.replace(/\/$/, '')}${task ? '/' + task : ''}`;
    console.log('[resolveGPTaskUrl] resolved from direct url:', url);
    return url;
  }

  console.warn('[resolveGPTaskUrl] Could not resolve URL. utility:', utility);
  return null;
}

/** @deprecated use resolveGPTaskUrl */
export function getGPTaskUrl(utility: any): string | null {
  return resolveGPTaskUrl(utility);
}

/**
 * Returns the projection options for runtime dropdowns.
 * If the admin has selected projections via the GP task, those are used.
 * Otherwise falls back to the hardcoded list.
 */
export function getProjectionOptions(config: Config): Array<{ label: string; value: string }> {
  const selected = config?.selectedProjections as any;
  if (selected && Object.keys(selected).length > 0) {
    return Object.keys(selected).map(key => ({ label: key, value: selected[key] || key }));
  }
  return PROJECTIONS;
}

export const PROJECTIONS = [
  { label: 'GDA 94 Latitude| \\Longitude (GDA94 Lat Long)', value: 'GDA94 Lat Long' },
  { label: 'GDA 94 MGA Zone 50 (MGA50)', value: 'MGA50' },
  { label: 'GDA 94 MGA Zone 50 (MGA51)', value: 'MGA51' },
  { label: 'Central Project Grid (CPG94)', value: 'CPG94' },
  { label: 'Eastern Project Grid (EPG94)', value: 'EPG94' },
  { label: 'Eastern Ridge Project Grid (ER94)', value: 'ER94' },
  { label: 'HBI Project Grid (HBI94)', value: 'HBI94' },
  { label: 'Jimblebar Project Grid (JIM94)', value: 'JIM94' },
  { label: 'Port Hedland (PHG94)', value: 'PHG94' },
  { label: 'Whaleback Project Grid (WB94)', value: 'WB94' },
  { label: 'Yand1 Project Grid (YAN94)', value: 'YAN94' },
  { label: 'Yarrie Project Grid (YAR94)', value: 'YAR94' },
  { label: 'Geocentric Datum Of Australia (GDA2020)', value: 'GDA2020' }
];
