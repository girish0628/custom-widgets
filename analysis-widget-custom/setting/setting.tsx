/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, NumericInput, Select, Option, Switch, Label } from 'jimu-ui'
import type { Config } from '../src/runtime/types'

export default function Setting (props: AllWidgetSettingProps<Config>) {
  const config = props.config || {}

  const updateConfig = (key: string, value: any) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set(key, value)
    })
  }

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({ id: props.id, useMapWidgetIds })
  }

  return (
    <div>
      <SettingSection title='Map'>
        <SettingRow>
          <MapWidgetSelector
            useMapWidgetIds={props.useMapWidgetIds}
            onSelect={onMapWidgetSelected}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title='Buffer Settings'>
        <SettingRow>
          <Label>Default Distance</Label>
          <NumericInput
            size='sm'
            min={0}
            step={1}
            value={config.defaultDistance ?? 100}
            onChange={(v) => updateConfig('defaultDistance', Number(v) || 0)}
          />
        </SettingRow>

        <SettingRow>
          <Label>Default Unit</Label>
          <Select
            size='sm'
            value={config.defaultUnit ?? 'meters'}
            onChange={(e) => updateConfig('defaultUnit', e.target.value)}
          >
            <Option value='meters'>Meters</Option>
            <Option value='kilometers'>Kilometers</Option>
            <Option value='feet'>Feet</Option>
            <Option value='yards'>Yards</Option>
            <Option value='miles'>Miles</Option>
            <Option value='nautical-miles'>Nautical Miles</Option>
          </Select>
        </SettingRow>
      </SettingSection>

      <SettingSection title='Output Settings'>
        <SettingRow>
          <Label>Default Output Layer Name</Label>
          <TextInput
            size='sm'
            value={config.defaultOutputLayerName ?? 'Analysis Result'}
            onChange={(e) => updateConfig('defaultOutputLayerName', e.target.value)}
          />
        </SettingRow>

        <SettingRow>
          <Label className='d-flex w-100 justify-content-between align-items-center'>
            <span>Auto Zoom to Result</span>
            <Switch
              checked={config.autoZoomToResult ?? true}
              onChange={(e) => updateConfig('autoZoomToResult', e.target.checked)}
            />
          </Label>
        </SettingRow>

        <SettingRow>
          <Label className='d-flex w-100 justify-content-between align-items-center'>
            <span>Enable GeoJSON Export</span>
            <Switch
              checked={config.enableExport ?? true}
              onChange={(e) => updateConfig('enableExport', e.target.checked)}
            />
          </Label>
        </SettingRow>
      </SettingSection>

      <SettingSection title='Intersect Settings'>
        <SettingRow>
          <Label>Max Features to Intersect</Label>
          <NumericInput
            size='sm'
            min={1}
            max={10000}
            step={100}
            value={config.maxIntersectFeatures ?? 2000}
            onChange={(v) => updateConfig('maxIntersectFeatures', Number(v) || 2000)}
          />
        </SettingRow>

        <SettingRow>
          <Label className='d-flex w-100 justify-content-between align-items-center'>
            <span>Polygon Layers Only</span>
            <Switch
              checked={config.showOnlyPolygonLayersForIntersect ?? false}
              onChange={(e) => updateConfig('showOnlyPolygonLayersForIntersect', e.target.checked)}
            />
          </Label>
        </SettingRow>
      </SettingSection>
    </div>
  )
}
