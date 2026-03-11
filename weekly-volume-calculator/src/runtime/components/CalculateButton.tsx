import { React } from 'jimu-core'
import { Button } from 'jimu-ui'
import type { SubmitStatus } from '../../types'

interface Props {
  disabled: boolean
  status: SubmitStatus
  onClick: () => void
}

const LABEL: Record<SubmitStatus, string> = {
  IDLE: 'Calculate Weekly Volume',
  PROCESSING: 'Submitting…',
  SUCCESS: 'Submitted Successfully',
  ERROR: 'Retry'
}

/**
 * Primary action button that triggers the Jenkins pipeline.
 * Automatically disabled while processing or after a successful submission.
 */
const CalculateButton = ({ disabled, status, onClick }: Props): React.ReactElement => (
  <Button
    type="primary"
    disabled={disabled || status === 'PROCESSING' || status === 'SUCCESS'}
    onClick={onClick}
    style={{
      width: '100%',
      height: 44,
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: 0.3
    }}
  >
    {LABEL[status]}
  </Button>
)

export default CalculateButton
