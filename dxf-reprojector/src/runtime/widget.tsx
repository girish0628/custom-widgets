import { React, type AllWidgetProps } from 'jimu-core'
import { Alert, Loading, LoadingType } from 'jimu-ui'
import type { IMConfig } from '../config'
import { resolveGPTaskUrl } from '../config'
import FolderInput from './components/FolderInput'
import ProjectionSelector from './components/ProjectionSelector'
import RunButton, { type ProcessingStatus } from './components/RunButton'
import { triggerJenkins, JenkinsError } from './services/JenkinsService'
import { useProjections } from './hooks/useProjections'

const { useState, useMemo } = React

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, user } = props

  const [folderName, setFolderName] = useState<string>('')
  const [folderValid, setFolderValid] = useState<boolean>(false)
  const [sourceCRS, setSourceCRS] = useState<string>('')
  const [destCRS, setDestCRS] = useState<string>('')
  const [status, setStatus] = useState<ProcessingStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Resolve the GP task URL — UtilityManager first, then cached URL fallback
  const gpTaskUrl = useMemo(() => {
    const utility = config.gpUtility?.[0]
    return resolveGPTaskUrl(utility) || (config as any).gpTaskUrl || ''
  }, [config.gpUtility, (config as any).gpTaskUrl])

  const { projections, loading: projectionsLoading, error: projectionsError } = useProjections(
    gpTaskUrl,
    config.gpOutputField || 'projection'
  )

  const transferPath = config.transferFolderPath || '\\\\server\\share\\Transfer'
  const notConfigured = !config.jenkinsBaseUrl || !config.jobName
  const gpNotConfigured = !gpTaskUrl

  const isValid =
    folderValid &&
    folderName.length > 0 &&
    sourceCRS !== '' &&
    destCRS !== '' &&
    !projectionsLoading

  const handleFolderChange = (value: string, valid: boolean): void => {
    setFolderName(value)
    setFolderValid(valid)
  }

  const handleRun = async (): Promise<void> => {
    if (!isValid) return
    setStatus('PROCESSING')
    setErrorMessage('')

    try {
      await triggerJenkins(
        config.jenkinsBaseUrl,
        config.jobName,
        {
          folderName,
          sourceCRS,
          destinationCRS: destCRS,
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

  return (
    <div
      className="jimu-widget"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#e07b00',
          color: '#ffffff',
          padding: '10px 14px',
          fontWeight: 700,
          fontSize: 15,
          flexShrink: 0
        }}
      >
        DXF Re-Projector
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 20px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        {/* Instruction panel */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #ddd',
            borderRadius: 4,
            padding: '12px 14px',
            fontSize: 13
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Please do the following:</p>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>
              Create a folder under{' '}
              <strong style={{ fontFamily: 'monospace' }}>&quot;{transferPath}&quot;</strong>
            </li>
            <li>Place DXF(s) in the created folder</li>
            <li>
              Add <strong>JUST</strong> the folder name in the &quot;Source DXF Folder&quot; box
            </li>
          </ol>
        </div>

        {/* Configuration warnings */}
        {gpNotConfigured && (
          <Alert
            type="warning"
            text="No GP service configured. Select a Geoprocessing service in widget settings."
            style={{ width: '100%' }}
          />
        )}
        {notConfigured && (
          <Alert
            type="warning"
            text="Jenkins Base URL and Job Name must be configured in widget settings."
            style={{ width: '100%' }}
          />
        )}

        {/* Projections loading */}
        {projectionsLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6e6e6e' }}>
            <Loading type={LoadingType.Donut} width={16} height={16} />
            Loading coordinate systems...
          </div>
        )}

        {/* Projections error */}
        {projectionsError && (
          <Alert
            type="error"
            text={`Could not load projections: ${projectionsError}`}
            style={{ width: '100%' }}
          />
        )}

        <FolderInput value={folderName} onChange={handleFolderChange} />

        <ProjectionSelector
          label="Source Coordinate System*"
          options={projections}
          value={sourceCRS}
          disabled={projectionsLoading || projections.length === 0}
          onChange={setSourceCRS}
        />

        <ProjectionSelector
          label="Destination Coordinate System*"
          options={projections}
          value={destCRS}
          disabled={projectionsLoading || projections.length === 0}
          onChange={setDestCRS}
        />

        {status === 'SUCCESS' && (
          <Alert
            type="success"
            text="DXF reprojection job submitted successfully."
            closable
            onClose={() => setStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}

        {status === 'ERROR' && (
          <Alert
            type="error"
            text={errorMessage}
            closable
            onClose={() => setStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}

        <RunButton
          status={status}
          disabled={!isValid || notConfigured}
          onClick={handleRun}
        />
      </div>
    </div>
  )
}

export default Widget
