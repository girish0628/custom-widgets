import { React } from 'jimu-core'
import type { VolumeFormData, ValidationErrors } from '../../types'

const { useMemo } = React

export function useFormValidation(form: VolumeFormData) {
  const errors = useMemo<ValidationErrors>(() => {
    const e: ValidationErrors = {}

    if (!form.mineSite) {
      e.mineSite = 'Mine Site is required'
    }
    if (!form.acquisitionDate) {
      e.acquisitionDate = 'Acquisition Date is required'
    }
    if (!form.captureFrom) {
      e.captureFrom = 'Capture From is required'
    }
    if (!form.captureTo) {
      e.captureTo = 'Capture To is required'
    } else if (form.captureFrom && form.captureTo <= form.captureFrom) {
      e.captureTo = 'Capture To must be after Capture From'
    }

    return e
  }, [form])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  return { errors, isValid }
}
