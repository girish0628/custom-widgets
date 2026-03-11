import { React } from 'jimu-core'
import { Checkbox, Label } from 'jimu-ui'

interface Props {
  locations: string[]
  selected: string[]
  loading: boolean
  error: string | null
  onChange: (updated: string[]) => void
}

/**
 * Checkbox list of location names returned by the GP service.
 * Shows a loading indicator or error message when appropriate.
 */
const LocationSelector = ({
  locations,
  selected,
  loading,
  error,
  onChange
}: Props): React.ReactElement => {
  const toggle = (loc: string): void => {
    onChange(
      selected.includes(loc)
        ? selected.filter(s => s !== loc)
        : [...selected, loc]
    )
  }

  return (
    <div>
      <p
        style={{
          fontWeight: 600,
          fontSize: 13,
          margin: '0 0 8px',
          color: '#333'
        }}
      >
        Location Name <span style={{ color: '#c0392b' }}>*</span>
      </p>

      {loading && (
        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>Loading locations…</p>
      )}

      {!loading && error && (
        <p style={{ fontSize: 13, color: '#c0392b', margin: 0 }}>{error}</p>
      )}

      {!loading && !error && locations.length === 0 && (
        <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
          Select a mine site to load locations.
        </p>
      )}

      {!loading && !error && locations.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: 200,
            overflowY: 'auto',
            paddingRight: 4
          }}
        >
          {locations.map(loc => (
            <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox
                id={`wvc-loc-${loc}`}
                checked={selected.includes(loc)}
                onChange={() => toggle(loc)}
              />
              <Label
                for={`wvc-loc-${loc}`}
                style={{ margin: 0, fontSize: 13, cursor: 'pointer', color: '#333' }}
              >
                {loc}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocationSelector
