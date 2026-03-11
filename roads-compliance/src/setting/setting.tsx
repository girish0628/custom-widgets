import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Button, TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { IMConfig, Config } from '../config'

const rowGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  width: '100%',
  marginBottom: 6
}

const Setting = (props: AllWidgetSettingProps<IMConfig>): React.ReactElement => {
  const { config, id, onSettingChange } = props

  const update = (partial: Partial<Config>): void => {
    onSettingChange({ id, config: config.merge(partial) })
  }

  // ── Mine Sites ──────────────────────────────────────────────────────────────
  const getSites = (): string[] =>
    config.mineSites ? Array.from(config.mineSites) : []

  const addSite = (): void => {
    update({ mineSites: [...getSites(), ''] })
  }

  const updateSite = (index: number, value: string): void => {
    update({ mineSites: getSites().map((s, i) => (i === index ? value : s)) })
  }

  const removeSite = (index: number): void => {
    update({ mineSites: getSites().filter((_, i) => i !== index) })
  }

  // ── Compliance Types ────────────────────────────────────────────────────────
  const getTypes = (): string[] =>
    config.complianceTypes ? Array.from(config.complianceTypes) : []

  const addType = (): void => {
    update({ complianceTypes: [...getTypes(), ''] })
  }

  const updateType = (index: number, value: string): void => {
    update({ complianceTypes: getTypes().map((t, i) => (i === index ? value : t)) })
  }

  const removeType = (index: number): void => {
    update({ complianceTypes: getTypes().filter((_, i) => i !== index) })
  }

  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* ── Compliance Types ──────────────────────────────────────── */}
      <SettingSection title="Compliance Types">
        <SettingRow flow="wrap">
          <div style={{ width: '100%' }}>
            {getTypes().map((type, i) => (
              <div key={i} style={rowGroupStyle}>
                <TextInput
                  value={type}
                  onChange={e => updateType(i, e.target.value)}
                  placeholder="e.g. Gradient (SME)"
                  style={{ flex: 1 }}
                />
                <Button
                  size="sm"
                  type="secondary"
                  onClick={() => removeType(i)}
                  style={{ width: 68, flexShrink: 0 }}
                >
                  Remove
                </Button>
              </div>
            ))}
            {getTypes().length === 0 && (
              <p style={{ fontSize: 12, color: '#6e6e6e', margin: '0 0 8px' }}>
                No compliance types added yet.
              </p>
            )}
            <Button size="sm" type="primary" onClick={addType}>
              + Add type
            </Button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Mine Sites ────────────────────────────────────────────── */}
      <SettingSection title="Mine Sites">
        <SettingRow flow="wrap">
          <div style={{ width: '100%' }}>
            {getSites().map((site, i) => (
              <div key={i} style={rowGroupStyle}>
                <TextInput
                  value={site}
                  onChange={e => updateSite(i, e.target.value)}
                  placeholder="e.g. Eastern Ridge"
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

      {/* ── Jenkins ───────────────────────────────────────────────── */}
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
            placeholder="road-compliance"
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
            For production, use a server-side proxy to inject credentials
            rather than storing them here.
          </p>
        </SettingRow>

      </SettingSection>

    </div>
  )
}

export default Setting
