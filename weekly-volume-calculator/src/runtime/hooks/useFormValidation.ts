import type { FormValues } from '../../types'

/**
 * Returns true only when every required field is filled in and
 * Capture To is strictly after Capture From.
 *
 * Both captureFrom and captureTo are HH:mm strings; lexicographic
 * comparison works correctly because they are zero-padded.
 */
export function useFormValidation(values: FormValues): boolean {
  const { mineSite, locations, acquisitionDate, captureFrom, captureTo } = values

  if (!mineSite) return false
  if (locations.length === 0) return false
  if (!acquisitionDate) return false
  if (!captureFrom) return false
  if (!captureTo) return false
  if (captureTo <= captureFrom) return false

  return true
}
