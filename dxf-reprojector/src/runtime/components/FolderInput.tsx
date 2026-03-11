import { React } from 'jimu-core'
import { Label, TextInput } from 'jimu-ui'

const FOLDER_REGEX = /^[a-zA-Z0-9_-]+$/

interface Props {
  value: string
  onChange: (value: string, isValid: boolean) => void
}

const FolderInput = ({ value, onChange }: Props): React.ReactElement => {
  const hasInput = value.length > 0
  const isInvalid = hasInput && !FOLDER_REGEX.test(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value
    onChange(raw, FOLDER_REGEX.test(raw))
  }

  return (
    <div>
      <Label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6 }}>
        Source DXF Folder
      </Label>
      <TextInput
        value={value}
        onChange={handleChange}
        placeholder="e.g. survey_2026_03_10"
        style={{ width: '100%' }}
        status={isInvalid ? 'error' : undefined}
      />
      {isInvalid && (
        <p style={{ fontSize: 12, color: '#d83020', margin: '4px 0 0' }}>
          Only letters, numbers, underscores and hyphens are allowed. No paths or spaces.
        </p>
      )}
    </div>
  )
}

export default FolderInput
