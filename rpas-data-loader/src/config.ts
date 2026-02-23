import { ImmutableObject } from 'jimu-core';

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
 * Build the full GP task URL from a utility object returned by UtilitySelector.
 * Mirrors the pattern: task ? `${utility.url}/${task}` : utility.url
 */
export function getGPTaskUrl(utility: any): string | null {
  if (!utility?.url) return null;
  return utility.task ? `${utility.url}/${utility.task}` : utility.url;
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
