import { React, type AllWidgetProps } from 'jimu-core'
import { Alert } from 'jimu-ui'
import type { IMConfig } from '../config'
import ComplianceSelector from './components/ComplianceSelector'
import MineSiteSelector from './components/MineSiteSelector'
import RunComplianceButton, { type ProcessingStatus } from './components/RunComplianceButton'
import { triggerJenkins, JenkinsError } from './services/JenkinsService'

const { useState, useMemo, useCallback } = React

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, user } = props

  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([])
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [status, setStatus] = useState<ProcessingStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const mineSites = useMemo(
    () => (config.mineSites ? Array.from(config.mineSites) : []),
    [config.mineSites]
  )
  const complianceTypes = useMemo(
    () => (config.complianceTypes ? Array.from(config.complianceTypes) : []),
    [config.complianceTypes]
  )

  const isValid = useMemo(
    () => selectedSites.length > 0 && selectedCompliance.length > 0,
    [selectedSites, selectedCompliance]
  )

  const handleComplianceChange = useCallback((updated: string[]) => {
    setSelectedCompliance(updated)
  }, [])

  const handleSiteChange = useCallback((updated: string[]) => {
    setSelectedSites(updated)
  }, [])

  const handleRun = async (): Promise<void> => {
    if (!isValid) return
    setStatus('PROCESSING')
    setErrorMessage('')

    try {
      await triggerJenkins(
        config.jenkinsBaseUrl,
        config.jobName,
        {
          mineSites: selectedSites.join(','),
          complianceTypes: selectedCompliance.join(','),
          username: user?.username ?? 'unknown',
          timestamp: new Date().toISOString()
        },
        config.apiToken
      )
      setStatus('SUCCESS')
    } catch (err) {
      const message =
        err instanceof JenkinsError
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      setErrorMessage(message)
      setStatus('ERROR')
    }
  }

  const notConfigured = !config.jenkinsBaseUrl || !config.jobName

  return (
    <div
      className="jimu-widget"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
        {/* <div
        style={{
          backgroundColor: '#e07b00',
          color: '#ffffff',
          padding: '10px 14px',
          fontWeight: 700,
          fontSize: 15,
          flexShrink: 0
        }}
      >
        Roads Compliance
      </div>*/}

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 20px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {/* Not configured warning */}
        {notConfigured && status === 'IDLE' && (
          <Alert
            type="warning"
            text="Jenkins Base URL and Job Name must be configured in the widget settings."
            style={{ width: '100%' }}
          />
        )}

        {complianceTypes.length > 0 ? (
          <ComplianceSelector
            options={complianceTypes}
            selected={selectedCompliance}
            onChange={handleComplianceChange}
          />
        ) : (
          <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>
            No compliance types configured. Add them in widget settings.
          </p>
        )}

        <div style={{ borderTop: '1px solid #ddd' }} />

        {mineSites.length > 0 ? (
          <MineSiteSelector
            options={mineSites}
            selected={selectedSites}
            onChange={handleSiteChange}
          />
        ) : (
          <p style={{ fontSize: 13, color: '#6e6e6e', margin: 0 }}>
            No mine sites configured. Add them in widget settings.
          </p>
        )}

        {/* Success notification */}
        {status === 'SUCCESS' && (
          <Alert
            type="success"
            text="Compliance job submitted successfully."
            closable
            onClose={() => setStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}

        {/* Error notification */}
        {status === 'ERROR' && (
          <Alert
            type="error"
            text={errorMessage}
            closable
            onClose={() => setStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}

        <RunComplianceButton
          status={status}
          disabled={!isValid || notConfigured}
          onClick={handleRun}
        />
      </div>
    </div>
  )
}

export default Widget
