import { React } from 'jimu-core'
import type { LayerStatRow } from '../../types'

interface DataTableProps {
  rows: LayerStatRow[]
}

const HEADER_CELLS = ['Feature', 'Edited', 'Re-Edited', 'New', 'Deleted'] as const

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: 'nowrap'
}

const tdStyle: React.CSSProperties = {
  padding: '9px 16px',
  fontSize: 13,
  borderBottom: '1px solid var(--sys-color-divider-temporary, #e0e0e0)'
}

function highlightIfNonZero (count: number): React.CSSProperties {
  return count > 0
    ? { color: 'var(--sys-color-warning-dark, #e65100)', fontWeight: 600 }
    : {}
}

const DataTable = ({ rows }: DataTableProps): React.ReactElement => {
  if (rows.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--sys-color-secondary-main, #6e6e6e)', margin: 16 }}>
        No feature layers configured.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 6, border: '1px solid var(--sys-color-divider-temporary, #e0e0e0)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--sys-color-primary-main, #007AC2)', color: '#fff' }}>
            {HEADER_CELLS.map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.featureName}
              style={{
                backgroundColor: i % 2 === 0
                  ? 'transparent'
                  : 'var(--sys-color-surface-paper, #fafafa)'
              }}
            >
              <td style={tdStyle}>{row.featureName}</td>
              <td style={{ ...tdStyle, ...highlightIfNonZero(row.statuses.Edited) }}>
                {row.statuses.Edited}
              </td>
              <td style={{ ...tdStyle, ...highlightIfNonZero(row.statuses.ReEdited) }}>
                {row.statuses.ReEdited}
              </td>
              <td style={{ ...tdStyle, ...highlightIfNonZero(row.statuses.New) }}>
                {row.statuses.New}
              </td>
              <td style={{ ...tdStyle, ...highlightIfNonZero(row.statuses.Deleted) }}>
                {row.statuses.Deleted}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
