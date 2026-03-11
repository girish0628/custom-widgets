/** Controls which view is shown inside the widget. */
export type WidgetStep = 'CONFIRMATION' | 'FORM'

/** Tracks the Jenkins submission lifecycle. */
export type SubmitStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'

/** All user-editable form fields. */
export interface FormValues {
  /** Selected mine site name. */
  mineSite: string
  /** Selected location names returned from the GP service. */
  locations: string[]
  /** Acquisition date in YYYY-MM-DD format. */
  acquisitionDate: string
  /** Survey capture start time in HH:mm format. */
  captureFrom: string
  /** Survey capture end time in HH:mm format. Must be > captureFrom. */
  captureTo: string
}
