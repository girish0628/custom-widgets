import { React } from 'jimu-core'
import { Label, Select, Option } from 'jimu-ui'

interface Props {
  label: string
  options: string[]
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

const ProjectionSelector = ({ label, options, value, disabled, onChange }: Props): React.ReactElement => {
  return (
    <div>
      <Label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 6 }}>
        {label}
      </Label>
      <Select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Option value="">-- Select --</Option>
        {options.map(name => (
          <Option key={name} value={name}>
            {name}
          </Option>
        ))}
      </Select>
    </div>
  )
}

export default ProjectionSelector
