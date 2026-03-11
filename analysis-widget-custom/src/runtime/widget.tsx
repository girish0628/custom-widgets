/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  type IMState,
  ReactRedux,
  Immutable,
  DataSourceManager
} from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import {
  Button,
  Select,
  Option,
  NumericInput,
  TextInput,
  Label,
  Radio,
  Alert,
  Switch,
  Loading,
  Checkbox
} from 'jimu-ui'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import FeatureLayer from 'esri/layers/FeatureLayer'
import GeoJSONLayer from 'esri/layers/GeoJSONLayer'
import Graphic from 'esri/Graphic'
import type Geometry from 'esri/geometry/Geometry'
import type MapView from 'esri/views/MapView'
import type SceneView from 'esri/views/SceneView'
import { getStyle } from './style'
import { DISTANCE_UNITS } from './constants'
import type { AnalysisType, AnalysisMessage, Config, DistanceUnit, LayerOption } from './types'
import {
  waitForViewReady,
  ensureOperationalLayers,
  clearGraphicsLayer,
  getQueryableFeatureLayers,
  getLayerById,
  createSketchGraphic,
  createResultGraphic,
  bufferGeometry,
  intersectGeometries,
  queryIntersectingFeatures,
  zoomToGeometries,
  exportGraphicsToGeoJSON
} from './utils'

type Props = AllWidgetProps<Config>

export default function Widget (props: Props) {
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView | null>(null)
  const [layerOptions, setLayerOptions] = React.useState<LayerOption[]>([])
  const [analysisType, setAnalysisType] = React.useState<AnalysisType>('buffer')
  const [selectedLayerId, setSelectedLayerId] = React.useState<string>('')
  const [distance, setDistance] = React.useState<number>(props.config?.defaultDistance ?? 100)
  const [unit, setUnit] = React.useState<DistanceUnit>(props.config?.defaultUnit ?? 'meters')
  const [outputLayerName, setOutputLayerName] = React.useState<string>(props.config?.defaultOutputLayerName ?? 'Analysis Result')
  const [drawType, setDrawType] = React.useState<'point' | 'polyline' | 'polygon'>('polygon')
  const [useSelectedFeaturesOnly, setUseSelectedFeaturesOnly] = React.useState<boolean>(false)
  const [autoZoomToResult, setAutoZoomToResult] = React.useState<boolean>(props.config?.autoZoomToResult ?? true)
  const [message, setMessage] = React.useState<AnalysisMessage | null>(null)
  const [isRunning, setIsRunning] = React.useState<boolean>(false)
  const [inputGeometry, setInputGeometry] = React.useState<Geometry | null>(null)
  const [resultCount, setResultCount] = React.useState<number>(0)
  const [lastRunAt, setLastRunAt] = React.useState<string>('')
  const sketchVMRef = React.useRef<SketchViewModel | null>(null)
  const resultGraphicsRef = React.useRef<Graphic[]>([])

  const mapView = jimuMapView?.view as MapView | SceneView | undefined

  const refreshLayers = React.useCallback(async () => {
    if (!mapView) return
    await waitForViewReady(mapView)
    const layers = getQueryableFeatureLayers(mapView)
      .filter((l) => analysisType !== 'intersect' || !(props.config?.showOnlyPolygonLayersForIntersect) || l.geometryType === 'polygon')
    setLayerOptions(layers)
    if (!selectedLayerId && layers.length) {
      setSelectedLayerId(layers[0].id)
    }
  }, [mapView, selectedLayerId, analysisType, props.config?.showOnlyPolygonLayersForIntersect])

  React.useEffect(() => {
    refreshLayers()
  }, [refreshLayers])

  React.useEffect(() => {
    if (!mapView) return
    let active = true

    const setup = async () => {
      await waitForViewReady(mapView)
      const { sketchLayer } = ensureOperationalLayers(mapView)

      if (!active) return

      sketchVMRef.current?.destroy()
      sketchVMRef.current = new SketchViewModel({
        view: mapView,
        layer: sketchLayer,
        updateOnGraphicClick: true,
        defaultUpdateOptions: {
          enableRotation: false,
          enableScaling: true,
          toggleToolOnClick: false
        },
        polygonSymbol: {
          type: 'simple-fill',
          color: [0, 121, 193, 0.08],
          outline: { color: [0, 121, 193, 1], width: 2 }
        } as any,
        polylineSymbol: {
          type: 'simple-line',
          color: [0, 121, 193, 1],
          width: 2
        } as any,
        pointSymbol: {
          type: 'simple-marker',
          color: [0, 121, 193, 1],
          size: 8,
          outline: { color: [255, 255, 255, 1], width: 1 }
        } as any
      })

      sketchVMRef.current.on('create', (event: any) => {
        if (event.state === 'complete') {
          setInputGeometry(event.graphic.geometry)
          setMessage({ type: 'success', text: 'Input geometry captured successfully.' })
        }
      })

      sketchVMRef.current.on('update', (event: any) => {
        if (event.state === 'complete' && event.graphics?.length) {
          setInputGeometry(event.graphics[0].geometry)
          setMessage({ type: 'success', text: 'Input geometry updated successfully.' })
        }
      })
    }

    setup()

    return () => {
      active = false
      sketchVMRef.current?.destroy()
      sketchVMRef.current = null
    }
  }, [mapView])

  const beginSketch = React.useCallback(() => {
    if (!mapView || !sketchVMRef.current) return
    const { sketchLayer } = ensureOperationalLayers(mapView)
    clearGraphicsLayer(sketchLayer)
    setInputGeometry(null)
    sketchVMRef.current.create(drawType)
    setMessage({ type: 'info', text: `Draw a ${drawType} on the map.` })
  }, [mapView, drawType])

  const clearInput = React.useCallback(() => {
    if (!mapView) return
    const { sketchLayer } = ensureOperationalLayers(mapView)
    clearGraphicsLayer(sketchLayer)
    setInputGeometry(null)
    setMessage({ type: 'info', text: 'Input geometry cleared.' })
  }, [mapView])

  const clearResults = React.useCallback(() => {
    if (!mapView) return
    const { resultLayer } = ensureOperationalLayers(mapView)
    clearGraphicsLayer(resultLayer)
    resultGraphicsRef.current = []
    setResultCount(0)
    setMessage({ type: 'info', text: 'Analysis results cleared.' })
  }, [mapView])

  const getSelectedFeaturesFromDataSource = React.useCallback(() => {
    if (!selectedLayerId) return [] as Graphic[]
    try {
      const ds = DataSourceManager.getInstance().getDataSource(selectedLayerId)
      if (!ds) return [] as Graphic[]
      const records = ds.getSelectedRecords?.() || []
      return records.map((r: any) => r.feature).filter(Boolean)
    } catch {
      return [] as Graphic[]
    }
  }, [selectedLayerId])

  const runBuffer = React.useCallback(async () => {
    if (!mapView || !inputGeometry) {
      setMessage({ type: 'warning', text: 'Please draw an input geometry first.' })
      return
    }

    setIsRunning(true)
    try {
      const { resultLayer } = ensureOperationalLayers(mapView)
      clearGraphicsLayer(resultLayer)

      const buffered = await bufferGeometry(inputGeometry, distance, unit as __esri.LinearUnits)
      if (!buffered) {
        setMessage({ type: 'warning', text: 'Buffer operation returned no geometry.' })
        setResultCount(0)
        return
      }

      const graphic = createResultGraphic(buffered, {
        analysisType: 'buffer',
        distance,
        unit,
        createdAt: new Date().toISOString()
      })

      resultLayer.title = outputLayerName || 'Analysis Result'
      resultLayer.add(graphic)
      resultGraphicsRef.current = [graphic]
      setResultCount(1)
      setLastRunAt(new Date().toLocaleString())
      setMessage({ type: 'success', text: 'Buffer analysis completed successfully.' })

      if (autoZoomToResult) {
        await zoomToGeometries(mapView, [graphic])
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Buffer analysis failed.' })
    } finally {
      setIsRunning(false)
    }
  }, [mapView, inputGeometry, distance, unit, outputLayerName, autoZoomToResult])

  const runIntersect = React.useCallback(async () => {
    if (!mapView || !inputGeometry) {
      setMessage({ type: 'warning', text: 'Please draw an input geometry first.' })
      return
    }

    if (!selectedLayerId) {
      setMessage({ type: 'warning', text: 'Please choose a layer for intersection.' })
      return
    }

    setIsRunning(true)
    try {
      const { resultLayer } = ensureOperationalLayers(mapView)
      clearGraphicsLayer(resultLayer)
      resultLayer.title = outputLayerName || 'Analysis Result'

      const layer = getLayerById(mapView, selectedLayerId) as FeatureLayer | GeoJSONLayer | null
      if (!layer) {
        setMessage({ type: 'error', text: 'Selected layer could not be found on the map.' })
        return
      }

      let sourceFeatures: Graphic[] = []

      if (useSelectedFeaturesOnly) {
        sourceFeatures = getSelectedFeaturesFromDataSource()
        if (!sourceFeatures.length) {
          setMessage({ type: 'warning', text: 'No selected features were found. Falling back to spatial query.' })
        }
      }

      if (!sourceFeatures.length) {
        sourceFeatures = await queryIntersectingFeatures(
          layer,
          inputGeometry,
          props.config?.maxIntersectFeatures ?? 2000
        )
      }

      const resultGraphics: Graphic[] = []
      for (const feature of sourceFeatures) {
        if (!feature.geometry) continue
        const intersection = await intersectGeometries(feature.geometry, inputGeometry)
        if (intersection) {
          resultGraphics.push(createResultGraphic(intersection, {
            ...feature.attributes,
            analysisType: 'intersect',
            sourceLayerId: selectedLayerId,
            createdAt: new Date().toISOString()
          }))
        }
      }

      if (!resultGraphics.length) {
        setResultCount(0)
        resultGraphicsRef.current = []
        setMessage({ type: 'warning', text: 'No intersected features were found.' })
        return
      }

      resultLayer.addMany(resultGraphics)
      resultGraphicsRef.current = resultGraphics
      setResultCount(resultGraphics.length)
      setLastRunAt(new Date().toLocaleString())
      setMessage({ type: 'success', text: `Intersection completed. ${resultGraphics.length} result feature(s) created.` })

      if (autoZoomToResult) {
        await zoomToGeometries(mapView, resultGraphics)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Intersection analysis failed.' })
    } finally {
      setIsRunning(false)
    }
  }, [
    mapView,
    inputGeometry,
    selectedLayerId,
    outputLayerName,
    autoZoomToResult,
    useSelectedFeaturesOnly,
    getSelectedFeaturesFromDataSource,
    props.config?.maxIntersectFeatures
  ])

  const handleRun = React.useCallback(async () => {
    if (analysisType === 'buffer') {
      await runBuffer()
    } else {
      await runIntersect()
    }
  }, [analysisType, runBuffer, runIntersect])

  const handleExport = React.useCallback(() => {
    if (!resultGraphicsRef.current.length) {
      setMessage({ type: 'warning', text: 'No result is available to export.' })
      return
    }
    exportGraphicsToGeoJSON(resultGraphicsRef.current, outputLayerName || 'analysis-result')
    setMessage({ type: 'success', text: 'Result exported successfully.' })
  }, [outputLayerName])

  const renderMessage = () => {
    if (!message) return null
    return <div className={`analysis-message ${message.type}`}>{message.text}</div>
  }

  const hasMap = !!props.useMapWidgetIds?.length

  return (
    <div className='analysis-widget' css={getStyle()}>
      {hasMap && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={(jmv: JimuMapView) => setJimuMapView(jmv)}
        />
      )}

      {!hasMap && (
        <div className='analysis-empty'>Please connect this widget to a Map widget in the widget settings.</div>
      )}

      {hasMap && (
        <div className='analysis-scroll'>
          <div className='analysis-section'>
            <div className='analysis-title'>Analysis type</div>
            <div className='analysis-row'>
              <Label className='d-flex align-items-center'>
                <Radio checked={analysisType === 'buffer'} onChange={() => setAnalysisType('buffer')} />
                <span className='ml-2'>Buffer</span>
              </Label>
              <Label className='d-flex align-items-center'>
                <Radio checked={analysisType === 'intersect'} onChange={() => setAnalysisType('intersect')} />
                <span className='ml-2'>Intersect</span>
              </Label>
            </div>
          </div>

          <div className='analysis-section'>
            <div className='analysis-title'>Input</div>
            <div className='analysis-row'>
              <Label>Draw type</Label>
              <Select value={drawType} onChange={(evt) => setDrawType(evt.target.value as any)}>
                <Option value='point'>Point</Option>
                <Option value='polyline'>Line</Option>
                <Option value='polygon'>Polygon</Option>
              </Select>
            </div>
            <div className='analysis-actions'>
              <Button type='primary' onClick={beginSketch}>Draw on map</Button>
              <Button onClick={clearInput}>Clear input</Button>
            </div>
            <div className='analysis-row mt-2'>
              <div className='analysis-pill'>
                Input geometry: <strong>{inputGeometry ? inputGeometry.type : 'Not drawn yet'}</strong>
              </div>
            </div>
          </div>

          {analysisType === 'buffer' && (
            <div className='analysis-section'>
              <div className='analysis-title'>Buffer parameters</div>
              <div className='analysis-inline'>
                <div>
                  <Label>Distance</Label>
                  <NumericInput
                    size='sm'
                    min={0}
                    step={1}
                    value={distance}
                    onChange={(value) => setDistance(Number(value) || 0)}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select value={unit} onChange={(evt) => setUnit(evt.target.value as DistanceUnit)}>
                    {DISTANCE_UNITS.map((u) => <Option key={u} value={u}>{u}</Option>)}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {analysisType === 'intersect' && (
            <div className='analysis-section'>
              <div className='analysis-title'>Intersect parameters</div>
              <div className='analysis-row'>
                <Label>Overlay layer</Label>
                <Select value={selectedLayerId} onChange={(evt) => setSelectedLayerId(evt.target.value)}>
                  {layerOptions.map((layer) => (
                    <Option key={layer.id} value={layer.id}>{layer.title}</Option>
                  ))}
                </Select>
              </div>
              <div className='analysis-row'>
                <Label className='d-flex align-items-center justify-content-between'>
                  <span>Use selected features only</span>
                  <Checkbox checked={useSelectedFeaturesOnly} onChange={(evt, checked) => setUseSelectedFeaturesOnly(checked)} />
                </Label>
              </div>
            </div>
          )}

          <div className='analysis-section'>
            <div className='analysis-title'>Output</div>
            <div className='analysis-row'>
              <Label>Output layer name</Label>
              <TextInput value={outputLayerName} onChange={(evt) => setOutputLayerName(evt.target.value)} />
            </div>
            <div className='analysis-row'>
              <Label className='d-flex align-items-center justify-content-between'>
                <span>Auto zoom to result</span>
                <Switch checked={autoZoomToResult} onChange={(evt) => setAutoZoomToResult(evt.target.checked)} />
              </Label>
            </div>
          </div>

          <div className='analysis-section'>
            <div className='analysis-title'>Run</div>
            <div className='analysis-actions'>
              <Button type='primary' disabled={isRunning} onClick={handleRun}>
                {isRunning ? 'Running...' : 'Run analysis'}
              </Button>
              <Button disabled={isRunning} onClick={clearResults}>Clear result</Button>
              {!!props.config?.enableExport && (
                <Button disabled={!resultGraphicsRef.current.length} onClick={handleExport}>Export GeoJSON</Button>
              )}
            </div>
            {isRunning && <div className='mt-2'><Loading /></div>}
          </div>

          <div className='analysis-section'>
            <div className='analysis-title'>Results</div>
            <div className='analysis-kpi'>
              <div className='analysis-pill'>Result count: <strong>{resultCount}</strong></div>
              <div className='analysis-pill'>Last run: <strong>{lastRunAt || 'Not run yet'}</strong></div>
            </div>
          </div>

          <div className='analysis-section'>
            <div className='analysis-title'>Status</div>
            {renderMessage() || <div className='analysis-pill'>Ready</div>}
          </div>
        </div>
      )}
    </div>
  )
}