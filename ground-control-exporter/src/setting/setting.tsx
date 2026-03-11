import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { IMConfig, Config } from '../config'

const Setting = (props: AllWidgetSettingProps<IMConfig>): React.ReactElement => {
  const { config, id, onSettingChange } = props

  const update = (partial: Partial<Config>): void => {
    onSettingChange({ id, config: config.merge(partial) })
  }

  return (
    <div style={{ padding: '0 0 16px' }}>

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
            placeholder="ground-control-export"
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
