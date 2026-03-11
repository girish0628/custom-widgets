import { React } from 'jimu-core'
import { Button, Loading, LoadingType } from 'jimu-ui'

export type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'

interface Props {
  status: ProcessingStatus
  onClick: () => void
}

const GenerateButton = ({ status, onClick }: Props): React.ReactElement => {
  const isProcessing = status === 'PROCESSING'

  return (
    <Button
      type="primary"
      size="lg"
      disabled={isProcessing}
      onClick={onClick}
      style={{
        backgroundColor: '#76b900',
        borderColor: '#76b900',
        color: '#ffffff',
        fontWeight: 600,
        minWidth: 160,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center'
      }}
    >
      {isProcessing && (
        <Loading type={LoadingType.Donut} width={16} height={16} />
      )}
      {isProcessing ? 'Processing...' : 'Generate XYZ(s)'}
    </Button>
  )
}

export default GenerateButton
