import { React, getAppStore, type AllWidgetProps } from 'jimu-core'
import { Button, Loading } from 'jimu-ui'
import type { IMConfig } from '../config'
import { WidgetState } from '../types'
import type { VolumeFormData } from '../types'
import { ConfirmationPopup } from './components/ConfirmationPopup'
import { VolumeForm } from './components/VolumeForm'
import { JenkinsService } from './services/JenkinsService'
import { formatDateForJenkins } from './utils/timeUtils'

const { useState, useCallback } = React

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const { config } = props
  const [state, setState] = useState<WidgetState>(WidgetState.CONFIRMING)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirmProceed = useCallback(() => {
    setState(WidgetState.FORM)
    setErrorMessage(null)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    setState(WidgetState.IDLE)
  }, [])

  const handleRestart = useCallback(() => {
    setState(WidgetState.CONFIRMING)
    setErrorMessage(null)
  }, [])

  const handleCalculate = useCallback(async (formData: VolumeFormData) => {
    setState(WidgetState.PROCESSING)
    setErrorMessage(null)

    const userState = getAppStore().getState() as any
    const username =
      userState?.user?.username ||
      userState?.portalSelf?.user?.username ||
      'guest'

    try {
      await JenkinsService.triggerJob(
        {
          baseUrl: config.jenkinsBaseUrl || '',
          jobName: config.jenkinsJobName || '',
          apiToken: config.jenkinsApiToken || ''
        },
        {
          mineSite: formData.mineSite,
          acquisitionDate: formData.acquisitionDate ? formatDateForJenkins(formData.acquisitionDate) : '',
          captureFrom: formData.captureFrom,
          captureTo: formData.captureTo,
          username
        }
      )
      setState(WidgetState.SUCCESS)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit job. Please try again.')
      setState(WidgetState.FORM)
    }
  }, [config])

  return (
    <div className='jimu-widget' style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

      {/* Header */}
      {/* <div style={headerStyle}>
        <span style={{ fontWeight: 600, fontSize: '15px' }}>Volume Calculator</span>
      </div> */}

      {/* Confirmation modal — renders as a fixed overlay */}
      <ConfirmationPopup
        isOpen={state === WidgetState.CONFIRMING}
        onProceed={handleConfirmProceed}
        onCancel={handleConfirmCancel}
      />

      {/* IDLE: user cancelled the confirmation */}
      {state === WidgetState.IDLE && (
        <div style={centeredStyle}>
          <p style={{ color: '#666', marginBottom: '16px', textAlign: 'center' }}>
            Please confirm prerequisites before calculating volume.
          </p>
          <Button
            onClick={handleRestart}
            style={{ backgroundColor: '#F57C00', color: 'white', border: 'none', padding: '8px 24px' }}
          >
            Begin
          </Button>
        </div>
      )}

      {/* FORM */}
      {state === WidgetState.FORM && (
        <VolumeForm
          config={config}
          onSubmit={handleCalculate}
          isProcessing={false}
          errorMessage={errorMessage}
        />
      )}

      {/* PROCESSING */}
      {state === WidgetState.PROCESSING && (
        <div style={centeredStyle}>
          <Loading />
          <p style={{ marginTop: '16px', color: '#555' }}>Submitting volume calculation job…</p>
        </div>
      )}

      {/* SUCCESS */}
      {state === WidgetState.SUCCESS && (
        <div style={centeredStyle}>
          <div style={{ fontSize: '48px', color: '#4CAF50', lineHeight: 1 }}>✓</div>
          <p style={{ fontWeight: 600, fontSize: '16px', color: '#2e7d32', margin: '12px 0 4px' }}>
            Volume job submitted successfully!
          </p>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
            Jenkins will process the calculation shortly.
          </p>
          <Button
            onClick={handleRestart}
            style={{ backgroundColor: '#F57C00', color: 'white', border: 'none', padding: '8px 24px' }}
          >
            Calculate Another
          </Button>
        </div>
      )}
    </div>
  )
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#F57C00',
  color: 'white',
  padding: '12px 16px',
  flexShrink: 0
}

const centeredStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 24px'
}

export default Widget
