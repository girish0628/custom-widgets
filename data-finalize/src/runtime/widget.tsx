import { React, type AllWidgetProps } from 'jimu-core'
import { Button, Loading } from 'jimu-ui'

import type { IMConfig } from '../config'
import type { FinalizeStatus } from '../types'
import { useFeatureStats } from './hooks/useFeatureStats'
import { triggerJenkins, JenkinsError, type JenkinsTriggerParams } from './services/JenkinsService'
import DataTable from './components/DataTable'
import TotalCounter from './components/TotalCounter'
import FinalizeButton from './components/FinalizeButton'

const { useState, useCallback, useRef } = React

// ---------------------------------------------------------------------------
// Inline status banner — keeps the widget self-contained
// ---------------------------------------------------------------------------
interface BannerProps {
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  onClose?: () => void
}

const BANNER_COLORS: Record<BannerProps['type'], { bg: string; border: string; text: string }> = {
  error:   { bg: '#fdecea', border: '#f44336', text: '#b71c1c' },
  warning: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
  info:    { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' },
  success: { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' }
}

const Banner = ({ type, message, onClose }: BannerProps): React.ReactElement => {
  const c = BANNER_COLORS[type]
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 14px',
        borderRadius: 6,
        border: `1px solid ${c.border}`,
        backgroundColor: c.bg,
        color: c.text,
        fontSize: 13
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            marginLeft: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: c.text,
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------
const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, portalUrl } = props

  const { rows, totalEdits, queryStatus, queryError, refresh } = useFeatureStats(
    config,
    portalUrl
  )

  const [finalizeStatus, setFinalizeStatus] = useState<FinalizeStatus>('idle')
  const [finalizeError, setFinalizeError] = useState<string | null>(null)

  // Stable ref so handleFinalize always reads the latest totalEdits
  const totalEditsRef = useRef(totalEdits)
  totalEditsRef.current = totalEdits

  // -------------------------------------------------------------------------
  // Finalize handler — POST to Jenkins buildWithParameters
  // -------------------------------------------------------------------------
  const handleFinalize = useCallback(async (): Promise<void> => {
    setFinalizeStatus('loading')
    setFinalizeError(null)

    const params: JenkinsTriggerParams = {
      loader: config.loader?.trim() || 'unknown',
      mineSite: config.mineSite?.trim() || 'unknown',
      timestamp: new Date().toISOString()
    }

    try {
      await triggerJenkins(config.jenkinsBaseUrl, config.jobName, params)
      setFinalizeStatus('success')
    } catch (err) {
      setFinalizeStatus('error')
      setFinalizeError(
        err instanceof JenkinsError
          ? err.message
          : 'Failed to trigger Jenkins job. Check the console for details.'
      )
      console.error('[DataFinaliseWidget] Jenkins error:', err)
    }
  }, [config])

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const isNotConfigured = !config.featureServiceItemId?.trim()

  return (
    <div
      style={{
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Data Finalise</h3>
        {!isNotConfigured && (
          <Button
            type="secondary"
            size="sm"
            onClick={refresh}
            disabled={queryStatus === 'loading'}
          >
            Refresh
          </Button>
        )}
      </div>

      {/* Config warning */}
      {isNotConfigured && (
        <Banner
          type="warning"
          message="Select a Feature Service and configure layers in the widget settings panel."
        />
      )}

      {/* Loading spinner */}
      {queryStatus === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loading />
          <span style={{ fontSize: 13 }}>Loading statistics…</span>
        </div>
      )}

      {/* Query error */}
      {queryStatus === 'error' && queryError && (
        <Banner type="error" message={queryError} />
      )}

      {/* Statistics table */}
      {(queryStatus === 'success' || rows.length > 0) && (
        <>
          <TotalCounter total={totalEdits} />
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <DataTable rows={rows} />
          </div>
        </>
      )}

      {/* Empty state after a successful query with zero rows */}
      {queryStatus === 'success' && rows.length === 0 && !isNotConfigured && (
        <Banner type="info" message="No feature layers returned data." />
      )}

      {/* Finalize feedback */}
      {finalizeStatus === 'success' && (
        <Banner
          type="success"
          message="Finalise job triggered successfully."
          onClose={() => setFinalizeStatus('idle')}
        />
      )}
      {finalizeStatus === 'error' && finalizeError && (
        <Banner
          type="error"
          message={finalizeError}
          onClose={() => { setFinalizeStatus('idle'); setFinalizeError(null) }}
        />
      )}

      {/* Footer — Finalize button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: 4,
          borderTop: '1px solid var(--sys-color-divider-temporary, #e0e0e0)'
        }}
      >
        <FinalizeButton
          totalEdits={totalEdits}
          loading={finalizeStatus === 'loading'}
          onClick={handleFinalize}
        />
      </div>
    </div>
  )
}

export default Widget
