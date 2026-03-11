import { React } from 'jimu-core'
import { Button, Label, Select, Option, TextInput, Alert } from 'jimu-ui'
import { DatePicker } from 'jimu-ui/basic/date-picker'
import type { IMConfig } from '../../config'
import type { VolumeFormData } from '../../types'
import { useFormValidation } from '../hooks/useFormValidation'
import { getCurrentTimeString, addMinutesToTime } from '../utils/timeUtils'

const { useState } = React

interface Props {
  config: IMConfig
  onSubmit: (formData: VolumeFormData) => void
  isProcessing: boolean
  errorMessage: string | null
}

export const VolumeForm = ({ config, onSubmit, isProcessing, errorMessage }: Props) => {
  const now = getCurrentTimeString()

  const [formData, setFormData] = useState<VolumeFormData>({
    mineSite: '',
    acquisitionDate: new Date(),
    captureFrom: now,
    captureTo: addMinutesToTime(now, 1)
  })

  const { errors, isValid } = useFormValidation(formData)
  const mineSites = config.mineSites ? Array.from(config.mineSites) : []

  const setField = <K extends keyof VolumeFormData>(key: K, value: VolumeFormData[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (isValid && !isProcessing) onSubmit(formData)
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {errorMessage && (
        <Alert
          type="error"
          text={errorMessage}
          closable
          onClose={() => {}}
          style={{ marginBottom: '4px' }}
        />
      )}

      {/* Mine Site */}
      <div>
        <Label style={styles.label}>
          <strong>Select Mine Site<span style={styles.required}>*</span></strong>
        </Label>
        <Select
          value={formData.mineSite}
          onChange={e => setField('mineSite', e.target.value)}
          disabled={isProcessing}
          style={{ width: '100%' }}
        >
          <Option value=''>-- Select Mine Site --</Option>
          {mineSites.map(site => (
            <Option key={site} value={site}>{site}</Option>
          ))}
        </Select>
        {errors.mineSite && <div style={styles.error}>{errors.mineSite}</div>}
      </div>

      {/* Acquisition Date */}
      <div>
        <Label style={styles.label}>
          <strong>Select Acquisition Date<span style={styles.required}>*</span></strong>
        </Label>
        <DatePicker
          style={{ width: '100%' }}
          selectedDate={formData.acquisitionDate}
          onChange={date => setField('acquisitionDate', date)}
          disabled={isProcessing}
          format='shortDate'
          runtime={false}
        />
        {errors.acquisitionDate && <div style={styles.error}>{errors.acquisitionDate}</div>}
      </div>

      {/* Capture From */}
      <div>
        <Label style={styles.label}>
          <strong>Capture From<span style={styles.required}>*</span></strong>
        </Label>
        <TextInput
          type='time'
          className='w-100'
          value={formData.captureFrom}
          onChange={evt => setField('captureFrom', evt.currentTarget.value)}
          disabled={isProcessing}
          required
        />
        {errors.captureFrom && <div style={styles.error}>{errors.captureFrom}</div>}
      </div>

      {/* Capture To */}
      <div>
        <Label style={styles.label}>
          <strong>Capture To<span style={styles.required}>*</span></strong>
        </Label>
        <TextInput
          type='time'
          className='w-100'
          value={formData.captureTo}
          onChange={evt => setField('captureTo', evt.currentTarget.value)}
          disabled={isProcessing}
          required
        />
        {errors.captureTo && <div style={styles.error}>{errors.captureTo}</div>}
      </div>

      {/* Submit */}
      <Button
        style={{
          marginTop: '8px',
          backgroundColor: isValid && !isProcessing ? '#4CAF50' : undefined,
          color: isValid && !isProcessing ? 'white' : undefined,
          border: 'none',
          width: '100%',
          padding: '10px'
        }}
        disabled={!isValid || isProcessing}
        onClick={handleSubmit}
      >
        {isProcessing ? 'Submitting...' : 'Calculate Volume'}
      </Button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px'
  },
  required: {
    color: '#d32f2f',
    marginLeft: '2px'
  },
  error: {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '4px'
  }
}
