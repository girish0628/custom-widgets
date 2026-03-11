export enum WidgetState {
  CONFIRMING = 'CONFIRMING',
  FORM = 'FORM',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  IDLE = 'IDLE'
}

export interface VolumeFormData {
  mineSite: string
  acquisitionDate: Date | null
  captureFrom: string  // HH:mm
  captureTo: string    // HH:mm
}

export interface ValidationErrors {
  mineSite?: string
  acquisitionDate?: string
  captureFrom?: string
  captureTo?: string
}
