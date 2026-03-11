import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { TextInput, Label, Checkbox, Loading } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { ItemSelector, ItemTypes, type IItemWithPortalUrl } from 'jimu-ui/basic/item-selector'

import type { IMConfig, FeatureLayerConfig, Config } from '../config'
import type { PortalLayer } from '../types'
import { resolveFeatureServiceUrl, fetchFeatureLayers } from '../runtime/services/PortalService'

const { useState, useEffect } = React

/** Generates a simple unique id — avoids a dependency on uuid. */
const uid = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

// ---------------------------------------------------------------------------
// Setting component
// ---------------------------------------------------------------------------
const Setting = (props: AllWidgetSettingProps<IMConfig>): React.ReactElement => {
  const { config, id, onSettingChange, portalUrl } = props

  /** Helper — shallow merge partial config and push via onSettingChange. */
  const update = (partial: Partial<Config>): void => {
    onSettingChange({ id, config: config.merge(partial) })
  }

  // ---- Available layers (local UI state, not persisted) -------------------
  const [availableLayers, setAvailableLayers] = useState<PortalLayer[]>([])
  const [layersLoading, setLayersLoading] = useState(false)
  const [layersError, setLayersError] = useState<string | null>(null)

  // Fetch layers from the Feature Service whenever the selected item changes
  useEffect(() => {
    const itemId = config.featureServiceItemId?.trim()
    if (!itemId || !portalUrl) {
      setAvailableLayers([])
      return
    }

    let cancelled = false
    setLayersLoading(true)
    setLayersError(null)

    resolveFeatureServiceUrl(portalUrl, itemId)
      .then(serviceUrl => fetchFeatureLayers(serviceUrl))
      .then(layers => {
        if (!cancelled) {
          setAvailableLayers(layers)
          setLayersLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setLayersError(err instanceof Error ? err.message : 'Failed to load layers.')
          setLayersLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [config.featureServiceItemId, portalUrl])

  // ---- Feature Service item selection -------------------------------------
  const handleItemSelect = async (allSelected: IItemWithPortalUrl[]): Promise<void> => {
    const item = allSelected[0]
    if (!item) return
    // Clear previous layer selection when a new service is picked
    update({ featureServiceItemId: item.id, featureLayers: [] })
  }

  const handleItemRemove = (): void => {
    update({ featureServiceItemId: '', featureLayers: [] })
    setAvailableLayers([])
  }

  // ---- Feature layer checkbox toggling ------------------------------------
  const getLayers = (): FeatureLayerConfig[] =>
    config.featureLayers ? Array.from(config.featureLayers) : []

  const isLayerSelected = (layerId: number): boolean =>
    getLayers().some(l => l.layerIndex === layerId)

  const toggleLayer = (layer: PortalLayer): void => {
    const current = getLayers()
    if (isLayerSelected(layer.id)) {
      update({ featureLayers: current.filter(l => l.layerIndex !== layer.id) })
    } else {
      const newLayer: FeatureLayerConfig = {
        id: uid(),
        name: layer.name,
        layerIndex: layer.id
      }
      update({ featureLayers: [...current, newLayer] })
    }
  }

  // ItemSelector expects an array of item IDs for the currently selected item
  const selectedItemIds: string[] = config.featureServiceItemId
    ? [config.featureServiceItemId]
    : []

  const showLayersSection =
    !!(config.featureServiceItemId?.trim()) || availableLayers.length > 0

  // ---- Render -------------------------------------------------------------
  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* ── Feature Service ──────────────────────────────────────── */}
      <SettingSection title="Feature Service">
        <SettingRow flow="wrap">
          <div style={{ width: '100%' }}>
            <Label style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>
              Select a Feature Service from ArcGIS Portal
            </Label>
            <ItemSelector
              itemType={ItemTypes.FeatureService}
              portalUrl={portalUrl}
              selectedItems={selectedItemIds as any}
              onSelect={handleItemSelect}
              onRemove={handleItemRemove}
            />
            {config.featureServiceItemId && (
              <p style={{ fontSize: 11, color: '#6e6e6e', margin: '6px 0 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                Item ID: {config.featureServiceItemId}
              </p>
            )}
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Feature Layers ───────────────────────────────────────── */}
      {showLayersSection && (
        <SettingSection title="Feature Layers">
          <SettingRow flow="wrap">
            <div style={{ width: '100%' }}>
              {layersLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <Loading type="donut" />
                  <span style={{ fontSize: 12 }}>Loading layers…</span>
                </div>
              )}

              {layersError && (
                <p style={{ fontSize: 12, color: '#b71c1c', margin: '4px 0 8px' }}>
                  {layersError}
                </p>
              )}

              {!layersLoading && !layersError && availableLayers.length === 0 && (
                <p style={{ fontSize: 12, color: '#6e6e6e', margin: '4px 0 8px' }}>
                  No layers found in this Feature Service.
                </p>
              )}

              {availableLayers.map(layer => (
                <div
                  key={layer.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleLayer(layer)}
                >
                  <Checkbox
                    checked={isLayerSelected(layer.id)}
                    onChange={() => toggleLayer(layer)}
                  />
                  <span style={{ fontSize: 13 }}>{layer.name}</span>
                  <span style={{ fontSize: 11, color: '#6e6e6e' }}>(id: {layer.id})</span>
                </div>
              ))}

              {!layersLoading && availableLayers.length > 0 && (
                <p style={{ fontSize: 11, color: '#6e6e6e', margin: '8px 0 0' }}>
                  {getLayers().length} of {availableLayers.length} layer{availableLayers.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </SettingRow>
        </SettingSection>
      )}

      {/* ── Jenkins Configuration ────────────────────────────────── */}
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
            placeholder="data-finalise"
            style={{ width: '100%' }}
          />
        </SettingRow>

        <SettingRow flow="wrap" label="Loader">
          <TextInput
            value={config.loader ?? ''}
            onChange={e => update({ loader: e.target.value })}
            placeholder="e.g. pathgi@APAC"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: '#6e6e6e', margin: '4px 0 0', width: '100%' }}>
            Used as the WHERE clause filter (Loader='…') and forwarded to Jenkins as the <em>loader</em> parameter.
          </p>
        </SettingRow>

        <SettingRow flow="wrap" label="Mine Site">
          <TextInput
            value={config.mineSite ?? ''}
            onChange={e => update({ mineSite: e.target.value })}
            placeholder="e.g. SDMA"
            style={{ width: '100%' }}
          />
          <p style={{ fontSize: 11, color: '#6e6e6e', margin: '4px 0 0', width: '100%' }}>
            Forwarded to Jenkins as the <em>mineSite</em> parameter.
          </p>
        </SettingRow>

      </SettingSection>

    </div>
  )
}

export default Setting
