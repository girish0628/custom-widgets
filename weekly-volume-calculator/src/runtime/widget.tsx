import { React, type AllWidgetProps } from 'jimu-core'
import { Alert } from 'jimu-ui'
import type { IMConfig } from '../config'
import { resolveGPTaskUrl } from '../config'
import type { FormValues, WidgetStep, SubmitStatus } from '../types'
import ConfirmationModal from './components/ConfirmationModal'
import MineSiteSelector from './components/MineSiteSelector'
import LocationSelector from './components/LocationSelector'
import DateTimeSelector from './components/DateTimeSelector'
import CalculateButton from './components/CalculateButton'
import { useLocations } from './hooks/useLocations'
import { useFormValidation } from './hooks/useFormValidation'
import { triggerJenkins, JenkinsError } from './services/JenkinsService'

const { useState, useMemo, useCallback } = React

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowHHmm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ── Widget ───────────────────────────────────────────────────────────────────

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { config, user } = props

  // ── View step ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<WidgetStep>('CONFIRMATION')

  // ── Submission state ───────────────────────────────────────────────────────
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('IDLE')
  const [errorMessage, setErrorMessage] = useState('')

  // ── Form state ─────────────────────────────────────────────────────────────
  const now = nowHHmm()
  const [form, setForm] = useState<FormValues>({
    mineSite: '',
    locations: [],
    acquisitionDate: todayISO(),
    captureFrom: now,
    captureTo: addMinutes(now, 1)
  })

  // ── Derived values ─────────────────────────────────────────────────────────
  const mineSites = useMemo(
    () => (config.mineSites ? Array.from(config.mineSites) : []),
    [config.mineSites]
  )

  const gpUrl = useMemo(
    () => config.gpUrl || resolveGPTaskUrl((config.gpUtility as any)?.[0]) || null,
    [config.gpUrl, config.gpUtility]
  )

  const { locations, loading: locLoading, error: locError } = useLocations(gpUrl, form.mineSite)

  const captureToError =
    Boolean(form.captureFrom && form.captureTo && form.captureTo <= form.captureFrom)

  const isValid = useFormValidation(form)

  const notConfigured = !config.jenkinsBaseUrl || !config.jobName

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMineSiteChange = useCallback((site: string) => {
    setForm(prev => ({ ...prev, mineSite: site, locations: [] }))
  }, [])

  const handleLocationsChange = useCallback((locs: string[]) => {
    setForm(prev => ({ ...prev, locations: locs }))
  }, [])

  const handleCalculate = async (): Promise<void> => {
    if (!isValid || notConfigured) return
    setSubmitStatus('PROCESSING')
    setErrorMessage('')

    try {
      await triggerJenkins(
        config.jenkinsBaseUrl,
        config.jobName,
        {
          mineSite: form.mineSite,
          locations: form.locations.join(','),
          acquisitionDate: form.acquisitionDate,
          captureFrom: form.captureFrom,
          captureTo: form.captureTo,
          username: user?.username ?? 'unknown',
          timestamp: new Date().toISOString()
        },
        config.apiToken
      )
      setSubmitStatus('SUCCESS')
    } catch (err) {
      setErrorMessage(
        err instanceof JenkinsError ? err.message : 'An unexpected error occurred. Please try again.'
      )
      setSubmitStatus('ERROR')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="jimu-widget"
      style={{ position: 'relative', height: '100%', overflow: 'hidden' }}
    >
      {/* Confirmation overlay — shown first, disappears after Proceed */}
      {step === 'CONFIRMATION' && (
        <ConfirmationModal onProceed={() => setStep('FORM')} />
      )}

      {/* Main form panel — always rendered so the modal can overlay it */}
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          padding: '20px 24px 24px',
          backgroundColor: '#f7f8f9',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          boxSizing: 'border-box'
        }}
      >
        {/* Widget not configured warning */}
        {notConfigured && step === 'FORM' && (
          <Alert
            type="warning"
            text="Jenkins Base URL and Job Name must be configured in the widget settings."
            style={{ width: '100%' }}
          />
        )}

        {/* Two-column form layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            flex: 1
          }}
        >
          {/* Left column — mine site + locations */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 6,
              padding: 20,
              border: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              gap: 20
            }}
          >
            <MineSiteSelector
              options={mineSites}
              value={form.mineSite}
              onChange={handleMineSiteChange}
            />

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <LocationSelector
                locations={locations}
                selected={form.locations}
                loading={locLoading}
                error={locError}
                onChange={handleLocationsChange}
              />
            </div>
          </div>

          {/* Right column — date / time */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 6,
              padding: 20,
              border: '1px solid #e0e0e0'
            }}
          >
            <DateTimeSelector
              acquisitionDate={form.acquisitionDate}
              captureFrom={form.captureFrom}
              captureTo={form.captureTo}
              onDateChange={val => setForm(prev => ({ ...prev, acquisitionDate: val }))}
              onFromChange={val => setForm(prev => ({ ...prev, captureFrom: val }))}
              onToChange={val => setForm(prev => ({ ...prev, captureTo: val }))}
              captureToError={captureToError}
            />
          </div>
        </div>

        {/* Status alerts */}
        {submitStatus === 'SUCCESS' && (
          <Alert
            type="success"
            text="Weekly volume calculation job submitted successfully."
            closable
            onClose={() => setSubmitStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}
        {submitStatus === 'ERROR' && (
          <Alert
            type="error"
            text={errorMessage}
            closable
            onClose={() => setSubmitStatus('IDLE')}
            style={{ width: '100%' }}
          />
        )}

        <CalculateButton
          disabled={!isValid || notConfigured}
          status={submitStatus}
          onClick={handleCalculate}
        />
      </div>
    </div>
  )
}

export default Widget
