import { React } from 'jimu-core'
import { Button, Checkbox, Label } from 'jimu-ui'

interface Props {
  onProceed: () => void
}

const { useState } = React

const CHECKS = [
  'Surface DEM updated',
  'Base Surface updated',
  'Stockpile footprints updated'
] as const

/**
 * Full-widget overlay that requires the user to confirm three data-readiness
 * checkboxes before the form is shown. The Proceed button is disabled until
 * all three boxes are ticked.
 */
const ConfirmationModal = ({ onProceed }: Props): React.ReactElement => {
  const [checked, setChecked] = useState<boolean[]>([false, false, false])

  const toggle = (i: number): void => {
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  const allChecked = checked.every(Boolean)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          padding: '28px 32px',
          width: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.20)'
        }}
      >
        <h3
          style={{
            margin: '0 0 4px',
            fontSize: 18,
            fontWeight: 700,
            color: '#1a1a1a'
          }}
        >
          Weekly Volume Calculator
        </h3>
        <p
          style={{
            margin: '0 0 22px',
            fontSize: 13,
            color: '#666',
            lineHeight: 1.5
          }}
        >
          Please confirm the following are up to date before proceeding:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {CHECKS.map((checkLabel, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Checkbox
                id={`wvc-confirm-${i}`}
                checked={checked[i]}
                onChange={() => toggle(i)}
              />
              <Label
                for={`wvc-confirm-${i}`}
                style={{ margin: 0, fontSize: 14, cursor: 'pointer', color: '#333' }}
              >
                {checkLabel}
              </Label>
            </div>
          ))}
        </div>

        <Button
          type="primary"
          disabled={!allChecked}
          onClick={onProceed}
          style={{ width: '100%', height: 40 }}
        >
          Proceed
        </Button>
      </div>
    </div>
  )
}

export default ConfirmationModal
