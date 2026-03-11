import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Button, Label, TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { Config, IMConfig } from '../config'

const { useState } = React

type Props = AllWidgetSettingProps<IMConfig>

const Setting = ({ id, config, onSettingChange }: Props) => {
  const update = (partial: Partial<Config>) =>
    onSettingChange({ id, config: config.merge(partial) })

  // Mine Sites editor — stored as newline-separated text for easy editing
  const currentSites = config.mineSites ? Array.from(config.mineSites) : []
  const [sitesText, setSitesText] = useState<string>(currentSites.join('\n'))

  const handleSitesBlur = () => {
    const sites = sitesText.split('\n').map(s => s.trim()).filter(Boolean)
    update({ mineSites: sites })
  }

  return (
    <div>
      {/* Mine Sites */}
      <SettingSection title='Mine Sites'>
        <SettingRow flow='wrap' label='One site per line'>
          <textarea
            value={sitesText}
            onChange={e => setSitesText(e.target.value)}
            onBlur={handleSitesBlur}
            rows={6}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder={'Eastern Ridge\nJimblebar\nYandi'}
          />
        </SettingRow>
      </SettingSection>

      {/* Jenkins */}
      <SettingSection title='Jenkins Configuration'>
        <SettingRow flow='wrap' label='Base URL'>
          <TextInput
            value={config.jenkinsBaseUrl || ''}
            onChange={e => update({ jenkinsBaseUrl: e.target.value })}
            placeholder='https://jenkins.company.com'
            style={{ width: '100%' }}
          />
        </SettingRow>

        <SettingRow flow='wrap' label='Job Name'>
          <TextInput
            value={config.jenkinsJobName || ''}
            onChange={e => update({ jenkinsJobName: e.target.value })}
            placeholder='volume-calculator'
            style={{ width: '100%' }}
          />
        </SettingRow>

        <SettingRow flow='wrap' label='API Token'>
          <TextInput
            type='password'
            value={config.jenkinsApiToken || ''}
            onChange={e => update({ jenkinsApiToken: e.target.value })}
            placeholder='Jenkins API token'
            style={{ width: '100%' }}
          />
          <Label style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
            For production, use a server-side proxy that injects credentials instead of storing a token here.
          </Label>
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default Setting
