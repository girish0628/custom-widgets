import { React } from 'jimu-core'

interface Props {
  acquisitionDate: string
  captureFrom: string
  captureTo: string
  onDateChange: (val: string) => void
  onFromChange: (val: string) => void
  onToChange: (val: string) => void
  captureToError: boolean
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 6,
  color: '#333'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 13,
  backgroundColor: '#fff',
  boxSizing: 'border-box'
}

/**
 * Date and time inputs for acquisition date, capture from, and capture to.
 * Defaults: today / current time / current time + 1 minute (set by widget.tsx).
 */
const DateTimeSelector = ({
  acquisitionDate,
  captureFrom,
  captureTo,
  onDateChange,
  onFromChange,
  onToChange,
  captureToError
}: Props): React.ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div>
      <label style={labelStyle}>
        Acquisition Date <span style={{ color: '#c0392b' }}>*</span>
      </label>
      <input
        type="date"
        value={acquisitionDate}
        onChange={e => onDateChange(e.target.value)}
        style={inputStyle}
      />
    </div>

    <div>
      <label style={labelStyle}>
        Capture From <span style={{ color: '#c0392b' }}>*</span>
      </label>
      <input
        type="time"
        value={captureFrom}
        onChange={e => onFromChange(e.target.value)}
        style={inputStyle}
      />
    </div>

    <div>
      <label style={{ ...labelStyle, color: captureToError ? '#c0392b' : '#333' }}>
        Capture To <span style={{ color: '#c0392b' }}>*</span>
      </label>
      <input
        type="time"
        value={captureTo}
        onChange={e => onToChange(e.target.value)}
        style={{ ...inputStyle, borderColor: captureToError ? '#c0392b' : '#ccc' }}
      />
      {captureToError && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: '4px 0 0' }}>
          Capture To must be after Capture From.
        </p>
      )}
    </div>
  </div>
)

export default DateTimeSelector
