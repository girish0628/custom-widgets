import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Button, TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import type { IMConfig, Config } from '../config'
import { resolveGPTaskUrl } from '../config'

const supportedUtilityTypes = ['GPTask']

const rowGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  width: '100%',
  marginBottom: 6
}

const urlPreviewStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  color: '#555',
  wordBreak: 'break-all',
  backgroundColor: '#eef0f3',
  padding: '5px 8px',
  borderRadius: 3,
  border: '1px solid #dde0e5'
}

const Setting = (props: AllWidgetSettingProps<IMConfig>): React.ReactElement => {
  const { config, id, onSettingChange } = props

  const update = (partial: Partial<Config>): void => {
    onSettingChange({ id, config: config.merge(partial) })
  }

  // ── Mine Sites ──────────────────────────────────────────────────────────────
  const getSites = (): string[] =>
    config.mineSites ? Array.from(config.mineSites) : []

  const addSite = (): void => update({ mineSites: [...getSites(), ''] })

  const updateSite = (i: number, val: string): void =>
    update({ mineSites: getSites().map((s, idx) => (idx === i ? val : s)) })

  const removeSite = (i: number): void =>
    update({ mineSites: getSites().filter((_, idx) => idx !== i) })

  // ── Resolved GP URL preview ─────────────────────────────────────────────────
  const gpUrl = resolveGPTaskUrl((config.gpUtility as any)?.[0]) || config.gpUrl || ''

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* ── Mine Sites ──────────────────────────────────────────────────── */}
      <SettingSection title="Mine Sites">
        <SettingRow flow="wrap">
          <div style={{ width: '100%' }}>
            {getSites().map((site, i) => (
              <div key={i} style={rowGroupStyle}>
                <TextInput
                  value={site}
                  onChange={e => updateSite(i, e.target.value)}
                  placeholder="e.g. South Flank"
                  style={{ flex: 1 }}
                />
                <Button
                  size="sm"
                  type="secondary"
                  onClick={() => removeSite(i)}
                  style={{ width: 68, flexShrink: 0 }}
                >
                  Remove
                </Button>
              </div>
            ))}
            {getSites().length === 0 && (
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: '0 0 8px' }}>
                No mine sites added yet.
              </p>
            )}
            <Button size="sm" type="primary" onClick={addSite}>
              + Add site
            </Button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Location GP Service ─────────────────────────────────────────── */}
      <SettingSection title="Location GP Service">
        <SettingRow flow="wrap">
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 12, color: '#6e6e6e', margin: '0 0 8px' }}>
              Select a GP Task that accepts a <code>mineSite</code> parameter and
              returns location names.
            </p>
            <UtilitySelector
              onChange={utilities => {
                const resolved = resolveGPTaskUrl((utilities as any)?.[0]) || ''
                onSettingChange({
                  id,
                  config: config.merge({ gpUtility: utilities as any, gpUrl: resolved }),
                  useUtilities: utilities as any
                })
              }}
              useUtilities={config.gpUtility as any}
              types={supportedUtilityTypes}
              showRemove
              closePopupOnSelect
            />
            {gpUrl && <div style={urlPreviewStyle}>{gpUrl}</div>}
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Jenkins Configuration ───────────────────────────────────────── */}
      <SettingSection title="Jenkins Configuration">

        <SettingRow flow="wrap" label="Jenkins Base URL">
          <TextInput
            value={config.jenkinsBaseUrl ?? ''}
            onChange={e => update({ jenkinsBaseUrl: e.target.value })}
            placeholder="https://jenkins.company.com"
            style={{ width: '100%' }}
          />
        </SettingRow>

        <SettingRow flow="wrap" label="Job Name">
          <TextInput
            value={config.jobName ?? ''}
            onChange={e => update({ jobName: e.target.value })}
            placeholder="weekly-volume"
            style={{ width: '100%' }}
          />
        </SettingRow>

        <SettingRow flow="wrap" label="API Token (optional)">
          <TextInput
            type="password"
            value={config.apiToken ?? ''}
            onChange={e => update({ apiToken: e.target.value })}
            placeholder="Leave blank to use a server-side proxy"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: '#6e6e6e', margin: '4px 0 0' }}>
            For production, point the Jenkins URL at a server-side proxy that
            injects credentials rather than storing the token here.
          </p>
        </SettingRow>

      </SettingSection>

    </div>
  )
}

export default Setting
