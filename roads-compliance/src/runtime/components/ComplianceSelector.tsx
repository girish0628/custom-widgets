import { React } from 'jimu-core'
import { Checkbox, Label } from 'jimu-ui'

interface Props {
  options: string[]
  selected: string[]
  onChange: (updated: string[]) => void
}

const ComplianceSelector = ({ options, selected, onChange }: Props): React.ReactElement => {
  const toggle = React.useCallback(
    (item: string) => {
      onChange(
        selected.includes(item)
          ? selected.filter(s => s !== item)
          : [...selected, item]
      )
    },
    [selected, onChange]
  )

  return (
    <div>
      <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 10px' }}>
        Select Compliance Type(s)*
      </p>
      {options.map(option => (
        <div
          key={option}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}
        >
          <Checkbox
            id={`compliance-${option}`}
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          <Label
            for={`compliance-${option}`}
            style={{ margin: 0, fontSize: 14, cursor: 'pointer' }}
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  )
}

export default ComplianceSelector
