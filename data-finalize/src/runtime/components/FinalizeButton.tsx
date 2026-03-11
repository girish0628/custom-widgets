import { React } from 'jimu-core'
import { Button } from 'jimu-ui'

interface FinalizeButtonProps {
  totalEdits: number
  loading: boolean
  onClick: () => void
}

const FinalizeButton = ({ totalEdits, loading, onClick }: FinalizeButtonProps): React.ReactElement => {
  const disabled = totalEdits === 0 || loading

  return (
    <Button
      type="primary"
      disabled={disabled}
      onClick={onClick}
      style={{ minWidth: 160 }}
      title={
        totalEdits === 0
          ? 'No edits to finalise'
          : `Finalise ${totalEdits} edit${totalEdits !== 1 ? 's' : ''}`
      }
    >
      {loading ? 'Finalising…' : 'Finalise'}
    </Button>
  )
}

export default FinalizeButton
