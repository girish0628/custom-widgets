import { React, type AllWidgetProps } from 'jimu-core'
import { Alert } from 'jimu-ui'
import type { IMConfig } from '../config'
import GenerateButton, { type ProcessingStatus } from './components/GenerateButton'
import { triggerJenkins, JenkinsError } from './services/JenkinsService'

const { useState } = React

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, user } = props
  const [status, setStatus] = useState<ProcessingStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleGenerate = async (): Promise<void> => {
    setStatus('PROCESSING')
    setErrorMessage('')

    try {
      await triggerJenkins(
        config.jenkinsBaseUrl,
        config.jobName,
        {
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

  const statusLabel: Record<ProcessingStatus, string> = {
    IDLE: 'Ready',
    PROCESSING: 'Running...',
    SUCCESS: 'Completed',
    ERROR: 'Failed'
  }

  return (
    <div
      className="jimu-widget"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
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
          fontSize: 15
        }}
      >
        Ground Control Exporter
      </div>*/}

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '20px 16px',
          gap: 16,
          backgroundColor: '#f5f5f5'
        }}
      >
        <GenerateButton status={status} onClick={handleGenerate} />

        {/* Success notification */}
        {status === 'SUCCESS' && (
          <Alert
            type="success"
            text="XYZ export job submitted successfully."
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

        {/* Not configured warning */}
        {status === 'IDLE' && (!config.jenkinsBaseUrl || !config.jobName) && (
          <Alert
            type="warning"
            text="Jenkins Base URL and Job Name must be configured in the widget settings."
            style={{ width: '100%' }}
          />
        )}

        {/* Status line */}
        <span style={{ fontSize: 12, color: '#6e6e6e' }}>
          Status: {statusLabel[status]}
        </span>
      </div>
    </div>
  )
}

export default Widget
