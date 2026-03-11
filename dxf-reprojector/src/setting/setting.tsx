import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import type { IMConfig, Config } from '../config'
import { resolveGPTaskUrl } from '../config'

const urlPreviewStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 11,
  fontFamily: 'monospace',
  color: '#555',
  wordBreak: 'break-all',
  backgroundColor: '#eef0f3',
  padding: '4px 8px',
  borderRadius: 3,
  border: '1px solid #dde0e5'
}

const Setting = (props: AllWidgetSettingProps<IMConfig>): React.ReactElement => {
  const { config, id, onSettingChange } = props

  const update = (partial: Partial<Config>): void => {
    onSettingChange({ id, config: config.merge(partial) })
  }

  const resolvedUrl = resolveGPTaskUrl(config.gpUtility?.[0]) || (config as any).gpTaskUrl || ''

  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* ── Transfer Folder ──────────────────────────────────────── */}
      <SettingSection title="Transfer Folder">
        <SettingRow flow="wrap" label="Transfer folder path (shown in instructions)">
          <TextInput
            value={config.transferFolderPath ?? ''}
            onChange={e => update({ transferFolderPath: e.target.value })}
            placeholder="\\\\server\\share\\Transfer"
            style={{ width: '100%' }}
          />
        </SettingRow>
      </SettingSection>

      {/* ── Geoprocessing Service ────────────────────────────────── */}
      <SettingSection title="Projection GP Service">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 12, color: '#6e6e6e', margin: '0 0 8px' }}>
              Select the Geoprocessing service task that returns the list of available
              coordinate systems (e.g. <em>GetProjections</em>).
            </p>
            <UtilitySelector
              onChange={utilities => {
                const url = resolveGPTaskUrl((utilities as any)?.[0]) || ''
                onSettingChange({
                  id,
                  config: config.merge({
                    gpUtility: utilities as any,
                    gpTaskUrl: url
                  }),
                  useUtilities: utilities as any
                })
              }}
              useUtilities={config.gpUtility as any}
              types={['GPTask']}
              showRemove
              closePopupOnSelect
            />
            {resolvedUrl && (
              <div style={urlPreviewStyle}>{resolvedUrl}</div>
            )}
          </div>
        </SettingRow>

        <SettingRow flow="wrap" label="GP Output Field">
          <TextInput
            value={config.gpOutputField ?? 'projection'}
            onChange={e => update({ gpOutputField: e.target.value })}
            placeholder="projection"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: '#6e6e6e', margin: '4px 0 0' }}>
            The parameter name in the GP task response whose <em>choiceList</em>{' '}
            contains the projection names (default: <em>projection</em>).
          </p>
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
            placeholder="dxf-reproject"
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
