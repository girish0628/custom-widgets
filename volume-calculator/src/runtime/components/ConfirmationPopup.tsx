import { React } from 'jimu-core'
import { Button, Checkbox, Label } from 'jimu-ui'

const { useState } = React

interface Confirmations {
  surfaceDEM: boolean
  baseSurface: boolean
  stockpile: boolean
}

interface Props {
  isOpen: boolean
  onProceed: () => void
  onCancel: () => void
}

const ITEMS: Array<{ key: keyof Confirmations; label: string }> = [
  { key: 'surfaceDEM', label: 'Is Surface DEM uptodate?' },
  { key: 'baseSurface', label: 'Is Base Surface uptodate?' },
  { key: 'stockpile', label: 'Are stockpile footprints uptodate?' }
]

const RESET: Confirmations = { surfaceDEM: false, baseSurface: false, stockpile: false }

export const ConfirmationPopup = ({ isOpen, onProceed, onCancel }: Props) => {
  const [confirmations, setConfirmations] = useState<Confirmations>(RESET)

  if (!isOpen) return null

  const allConfirmed = confirmations.surfaceDEM && confirmations.baseSurface && confirmations.stockpile

  const toggle = (key: keyof Confirmations) =>
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }))

  const handleProceed = () => {
    if (!allConfirmed) return
    setConfirmations(RESET)
    onProceed()
  }

  const handleCancel = () => {
    setConfirmations(RESET)
    onCancel()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerText}>Please confirm following are up to date?</span>
          <button style={styles.closeBtn} onClick={handleCancel} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {ITEMS.map(({ key, label }) => (
            <Label key={key} style={styles.checkRow}>
              <Checkbox
                checked={confirmations[key]}
                onChange={(_evt, checked) => toggle(key)}
                style={{ marginRight: '12px', flexShrink: 0 }}
              />
              <span>{label}</span>
            </Label>
          ))}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <Button
            disabled={!allConfirmed}
            onClick={handleProceed}
            style={{
              marginRight: '8px',
              backgroundColor: allConfirmed ? '#1a73e8' : undefined,
              color: allConfirmed ? 'white' : undefined,
              opacity: allConfirmed ? 1 : 0.5
            }}
          >
            Proceed
          </Button>
          <Button
            onClick={handleCancel}
            style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none' }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    width: '420px',
    maxWidth: '90vw',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0'
  },
  headerText: {
    fontSize: '15px',
    fontWeight: 600
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    padding: '0 4px',
    lineHeight: 1
  },
  body: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    margin: 0,
    fontSize: '14px'
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  }
}
