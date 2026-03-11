import { React } from 'jimu-core'

interface TotalCounterProps {
  total: number
}

const TotalCounter = ({ total }: TotalCounterProps): React.ReactElement => {
  const hasEdits = total > 0

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderRadius: 6,
        border: `1px solid ${hasEdits ? 'var(--sys-color-warning-main, #ff9800)' : 'var(--sys-color-divider-temporary, #e0e0e0)'}`,
        backgroundColor: hasEdits
          ? 'var(--sys-color-warning-light, #fff3e0)'
          : 'var(--sys-color-surface-paper, #fafafa)'
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500 }}>Total edits:</span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: hasEdits
            ? 'var(--sys-color-warning-dark, #e65100)'
            : 'var(--sys-color-primary-main, #007AC2)'
        }}
      >
        {total}
      </span>
    </div>
  )
}

export default TotalCounter
