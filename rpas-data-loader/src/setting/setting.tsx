import {
  React
} from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import {
  TextInput,
  Label,
  AdvancedSelect,
  type AdvancedSelectItem
} from 'jimu-ui';
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector';
import { Config, resolveGPTaskUrl, PROJECTIONS } from '../config';

const supportedUtilityTypes = ['GPTask'];

// ── Component ─────────────────────────────────────────────────────────────────

const Setting = (props: AllWidgetSettingProps<Config>) => {
  const { id, config, onSettingChange } = props;

  // ── Derived display URL helper ───────────────────────────────────────────────

  const getDisplayUrl = (utilities: any[]): string => {
    return resolveGPTaskUrl(utilities?.[0]) || '';
  };

  const urlPreviewStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#555',
    wordBreak: 'break-all',
    backgroundColor: '#eef0f3',
    padding: '5px 8px',
    borderRadius: '3px',
    border: '1px solid #dde0e5'
  };

  // Currently selected projections → AdvancedSelectItem array for selectedValues
  const currentSelectedProjections: AdvancedSelectItem[] =
    config?.selectedProjections
      ? Object.keys(config.selectedProjections as any).map(key => ({ label: key, value: key }))
      : [];

  // ── File settings handlers ───────────────────────────────────────────────────

  const onMaxFileSizeChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const value = parseInt(evt.currentTarget.value, 10);
    if (!isNaN(value) && value > 0) {
      onSettingChange({ id, config: config.set('maxFileSizeMB', value) });
    }
  };

  const onAllowedExtensionsChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const extensions = evt.currentTarget.value
      .split(',')
      .map(ext => ext.trim())
      .filter(ext => ext.length > 0);
    onSettingChange({ id, config: config.set('allowedExtensions', extensions as any) });
  };

  const rpasUrl = getDisplayUrl(config?.rpasGPUtility as any);
  const smallProjectUrl = getDisplayUrl(config?.smallProjectGPUtility as any);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="widget-setting jimu-widget-setting">

      {/* ── RPAS Data Loader GP Service ─────────────────────────────────── */}
      <SettingSection title="RPAS Data Loader GP Service">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <Label style={{ marginBottom: '6px', display: 'block' }}>
              Used for: <strong>RPAS Elevation</strong> and <strong>TLS Elevation</strong>
            </Label>
            <UtilitySelector
              onChange={utilities => {
                console.log('[Setting] RPAS UtilitySelector onChange:', utilities);
                const url = resolveGPTaskUrl((utilities as any)?.[0]) || '';
                onSettingChange({
                  id,
                  config: config.set('rpasGPUtility', utilities as any).set('rpasGPUrl', url),
                  useUtilities: utilities as any
                });
              }}
              useUtilities={config?.rpasGPUtility as any}
              types={supportedUtilityTypes}
              showRemove
              closePopupOnSelect
            />
            {rpasUrl && <div style={urlPreviewStyle}>{rpasUrl}</div>}
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Small Project Imagery GP Service ────────────────────────────── */}
      <SettingSection title="Small Project Imagery GP Service">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <Label style={{ marginBottom: '6px', display: 'block' }}>
              Used for: <strong>Small Project Imagery</strong> (passes filename only)
            </Label>
            <UtilitySelector
              onChange={utilities => {
                console.log('[Setting] SmallProject UtilitySelector onChange:', utilities);
                const url = resolveGPTaskUrl((utilities as any)?.[0]) || '';
                onSettingChange({
                  id,
                  config: config.set('smallProjectGPUtility', utilities as any).set('smallProjectGPUrl', url),
                  useUtilities: utilities as any
                });
              }}
              useUtilities={config?.smallProjectGPUtility as any}
              types={supportedUtilityTypes}
              showRemove
              closePopupOnSelect
            />
            {smallProjectUrl && <div style={urlPreviewStyle}>{smallProjectUrl}</div>}
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Available Projections ────────────────────────────────────────── */}
      <SettingSection title="Available Projections">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <AdvancedSelect
              isMultiple
              staticValues={PROJECTIONS.map(p => ({ label: p.label, value: p.label }))}
              selectedValues={currentSelectedProjections}
              onChange={items =>
                onSettingChange({
                  id,
                  config: config.set(
                    'selectedProjections',
                    items.reduce((acc, cur) => {
                      const proj = PROJECTIONS.find(p => p.label === cur.label);
                      return { ...acc, [cur.label]: proj?.value || cur.label };
                    }, {}) as any
                  )
                })
              }
            />
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── File Settings ───────────────────────────────────────────────── */}
      <SettingSection title="File Settings">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <Label>Max File Size (MB)</Label>
            <TextInput
              type="number"
              className="w-100"
              placeholder="500"
              value={config?.maxFileSizeMB?.toString() || '500'}
              onChange={onMaxFileSizeChange}
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div style={{ width: '100%' }}>
            <Label>Allowed Extensions (comma-separated)</Label>
            <TextInput
              className="w-100"
              placeholder=".las, .laz, .xyz, .txt"
              value={config?.allowedExtensions?.join(', ') || '.las, .laz, .xyz, .txt'}
              onChange={onAllowedExtensionsChange}
            />
          </div>
        </SettingRow>
      </SettingSection>

    </div>
  );
};

export default Setting;
