import { React } from 'jimu-core'
import { Button, Loading, LoadingType } from 'jimu-ui'

export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'

interface Props {
  status: ProcessingStatus
  disabled: boolean
  onClick: () => void
}

const RunButton = ({ status, disabled, onClick }: Props): React.ReactElement => {
  const isProcessing = status === 'PROCESSING'

  return (
    <Button
      type="primary"
      size="lg"
      disabled={disabled || isProcessing}
      onClick={onClick}
      style={{
        backgroundColor: disabled || isProcessing ? undefined : '#76b900',
        borderColor: disabled || isProcessing ? undefined : '#76b900',
        color: '#ffffff',
        fontWeight: 600,
        minWidth: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center'
      }}
    >
      {isProcessing && (
        <Loading type={LoadingType.Donut} width={16} height={16} />
      )}
      {isProcessing ? 'Processing...' : 'Get Re-Projected DXF(s)'}
    </Button>
  )
}

export default RunButton
