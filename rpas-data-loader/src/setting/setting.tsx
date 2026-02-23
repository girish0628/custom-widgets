import {
  React,
  loadArcGISJSAPIModule,
  ServiceManager,
  SessionManager,
  SignInErrorCode
} from 'jimu-core';
import { AllWidgetSettingProps } from 'jimu-for-builder';
import {
  TextInput,
  Label,
  Loading,
  AdvancedSelect,
  type AdvancedSelectItem
} from 'jimu-ui';
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector';
import { Config, resolveGPTaskUrl } from '../config';

const { useState, useRef, useEffect, useCallback } = React;

type ProjectionList = { [key: string]: string };

const supportedUtilityTypes = ['GPTask'];

// ── Helpers (same pattern as export widget) ───────────────────────────────────

const getCustomToolUrlWithToken = (url: string) => {
  const isHosted = !!ServiceManager.getInstance().getServerInfoByServiceUrl(url);
  if (!isHosted) {
    const token = SessionManager.getInstance().getSessionByUrl(url)?.token;
    return token ? `${url}?token=${token}` : url;
  }
  return url;
};

// ── Component ─────────────────────────────────────────────────────────────────

const Setting = (props: AllWidgetSettingProps<Config>) => {
  const { id, config, onSettingChange } = props;

  const [availableProjections, setAvailableProjections] = useState<AdvancedSelectItem[]>([]);
  const [isLoadingProjections, setIsLoadingProjections] = useState(false);

  const esriRequest = useRef<any>();
  const geoprocessor = useRef<any>();
  const projectionList = useRef<ProjectionList>({});

  // Dynamically load ESRI modules — static imports of esri/* are not allowed in setting files
  useEffect(() => {
    loadArcGISJSAPIModule('esri/request').then(mod => {
      esriRequest.current = mod;
    });
    loadArcGISJSAPIModule('esri/rest/geoprocessor').then(mod => {
      geoprocessor.current = mod;
    });
  }, []);

  // ── GP helpers (same as export widget) ──────────────────────────────────────

  const getWebToolJSON = async (toolUrl: string, needToken = true): Promise<any> => {
    const options = { query: { f: 'json' }, responseType: 'json' };
    const url = needToken ? getCustomToolUrlWithToken(toolUrl) : toolUrl;
    try {
      const res = await esriRequest.current(url, options);
      return res.data;
    } catch (error: any) {
      const code = SessionManager.getInstance().getSignInErrorCodeByAuthError(error);
      if (code === SignInErrorCode.InvalidToken) return getWebToolJSON(toolUrl, false);
      throw error;
    }
  };

  const submitProjectionJob = async (toolUrl: string, needToken = true): Promise<any> => {
    const url = needToken ? getCustomToolUrlWithToken(toolUrl) : toolUrl;
    const jobInfo = await geoprocessor.current.submitJob(url, {});
    await jobInfo.waitForJobCompletion({
      interval: 1500,
      statusCallback: (j: any) => { console.log('Projection job status:', j.jobStatus); }
    });
    return jobInfo.fetchResultData('Projection_List');
  };

  // ── Projection setup (same pattern as export widget) ────────────────────────

  const setupProjection = useCallback(() => {
    const selectedUtility = (config?.projectionGPUtility as any)?.[0];
    if (!selectedUtility) return;

    // resolveGPTaskUrl looks up the actual service URL from appConfig.utilities[utilityId]
    // because UtilitySelector only stores { utilityId, task } — not the URL directly
    const projectionListUrl = resolveGPTaskUrl(selectedUtility);

    setIsLoadingProjections(true);
    submitProjectionJob(projectionListUrl)
      .then(res => {
        projectionList.current = res.value['projections'];
        setAvailableProjections(
          Object.keys(projectionList.current).map(key => ({ label: key, value: key }))
        );
        setIsLoadingProjections(false);
      })
      .catch(err => {
        console.error('Failed to load projections:', err);
        setIsLoadingProjections(false);
      });
  }, [config?.projectionGPUtility]);

  useEffect(() => {
    if (config?.projectionGPUtility) {
      setupProjection();
    }
  }, [config?.projectionGPUtility]);

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

  // Currently selected projections → AdvancedSelectItem map for selectedValues
  const currentSelectedProjections: { [value: string]: AdvancedSelectItem } =
    config?.selectedProjections
      ? Object.keys(config.selectedProjections as any).reduce((acc, key) => {
          acc[key] = { label: key, value: key };
          return acc;
        }, {} as any)
      : {};

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
  const projectionUrl = getDisplayUrl(config?.projectionGPUtility as any);

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
                onSettingChange({
                  id,
                  config: config.set('rpasGPUtility', utilities as any),
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
                onSettingChange({
                  id,
                  config: config.set('smallProjectGPUtility', utilities as any),
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

      {/* ── Projection GP Service ───────────────────────────────────────── */}
      <SettingSection title="Projection GP Service">
        <SettingRow>
          <div style={{ width: '100%' }}>
            <UtilitySelector
              onChange={utilities =>
                onSettingChange({ id, config: config.set('projectionGPUtility', utilities as any) })
              }
              useUtilities={config?.projectionGPUtility as any}
              types={supportedUtilityTypes}
              showRemove
              closePopupOnSelect
            />
            {projectionUrl && <div style={urlPreviewStyle}>{projectionUrl}</div>}
          </div>
        </SettingRow>
      </SettingSection>

      {/* ── Available Projections ────────────────────────────────────────── */}
      <SettingSection title="Available Projections">
        <SettingRow>
          <div style={{ width: '100%' }}>
            {isLoadingProjections ? (
              <Loading />
            ) : availableProjections.length > 0 ? (
              <AdvancedSelect
                isMultiple
                staticValues={availableProjections}
                selectedValues={currentSelectedProjections}
                onChange={items =>
                  onSettingChange({
                    id,
                    config: config.set(
                      'selectedProjections',
                      items.reduce(
                        (acc, cur) => ({ ...acc, [cur.value]: projectionList.current[cur.value] }),
                        {}
                      ) as any
                    )
                  })
                }
              />
            ) : (
              <div style={{ color: '#999', fontSize: '0.82rem', fontStyle: 'italic' }}>
                {config?.projectionGPUtility
                  ? 'Loading projections from GP service...'
                  : 'Select a Projection GP service above to load available projections.'}
              </div>
            )}
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
