import { React } from 'jimu-core'

interface Props {
  options: string[]
  value: string
  onChange: (value: string) => void
}

/**
 * Single-select dropdown for choosing a mine site.
 * Populated from config.mineSites (managed in the settings panel).
 */
const MineSiteSelector = ({ options, value, onChange }: Props): React.ReactElement => (
  <div>
    <label
      style={{
        display: 'block',
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 6,
        color: '#333'
      }}
    >
      Mine Site <span style={{ color: '#c0392b' }}>*</span>
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        height: 36,
        padding: '0 10px',
        border: '1px solid #ccc',
        borderRadius: 4,
        fontSize: 13,
        backgroundColor: '#fff',
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      <option value="">— Select Mine Site —</option>
      {options.map(site => (
        <option key={site} value={site}>
          {site}
        </option>
      ))}
    </select>
  </div>
)

export default MineSiteSelector
