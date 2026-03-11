import Graphic from 'esri/Graphic'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import GeoJSONLayer from 'esri/layers/GeoJSONLayer'
import FeatureLayer from 'esri/layers/FeatureLayer'
import type MapView from 'esri/views/MapView'
import type SceneView from 'esri/views/SceneView'
import type Geometry from 'esri/geometry/Geometry'
import type Polygon from 'esri/geometry/Polygon'
import type Polyline from 'esri/geometry/Polyline'
import type Point from 'esri/geometry/Point'
import geometryEngineAsync from 'esri/geometry/geometryEngineAsync'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { RESULT_LAYER_ID, SKETCH_LAYER_ID } from './constants'
import type { LayerOption } from './types'

export async function waitForViewReady(view: MapView | SceneView): Promise<void> {
  if (view.ready) return
  await reactiveUtils.whenOnce(() => view.ready)
}

export function getOrCreateGraphicsLayer(map: __esri.Map, id: string, title: string): GraphicsLayer {
  let layer = map.findLayerById(id) as GraphicsLayer
  if (!layer) {
    layer = new GraphicsLayer({ id, title, listMode: 'show' })
    map.add(layer)
  }
  return layer
}

export function ensureOperationalLayers(view: MapView | SceneView): { resultLayer: GraphicsLayer; sketchLayer: GraphicsLayer } {
  const resultLayer = getOrCreateGraphicsLayer(view.map, RESULT_LAYER_ID, 'Analysis Results')
  const sketchLayer = getOrCreateGraphicsLayer(view.map, SKETCH_LAYER_ID, 'Analysis Sketch')
  return { resultLayer, sketchLayer }
}

export function clearGraphicsLayer(layer?: GraphicsLayer): void {
  if (layer) layer.removeAll()
}

export function getQueryableFeatureLayers(view: MapView | SceneView): LayerOption[] {
  const result: LayerOption[] = []

  view.map.layers.forEach((layer: any) => {
    if (
      layer &&
      (layer.type === 'feature' || layer.type === 'geojson') &&
      !layer.id?.includes(RESULT_LAYER_ID) &&
      !layer.id?.includes(SKETCH_LAYER_ID)
    ) {
      result.push({
        id: layer.id,
        title: layer.title || layer.id || 'Untitled layer',
        geometryType: (layer as FeatureLayer | GeoJSONLayer).geometryType,
        url: (layer as FeatureLayer).url
      })
    }
  })

  return result.sort((a, b) => a.title.localeCompare(b.title))
}

export function getLayerById(view: MapView | SceneView, id: string): FeatureLayer | GeoJSONLayer | null {
  return (view.map.findLayerById(id) as FeatureLayer | GeoJSONLayer) || null
}

export function createSketchGraphic(geometry: Geometry): Graphic {
  const symbol = geometry.type === 'polygon'
    ? {
        type: 'simple-fill',
        color: [0, 121, 193, 0.08],
        outline: { color: [0, 121, 193, 1], width: 2 }
      }
    : geometry.type === 'polyline'
      ? {
          type: 'simple-line',
          color: [0, 121, 193, 1],
          width: 2
        }
      : {
          type: 'simple-marker',
          color: [0, 121, 193, 1],
          size: 8,
          outline: { color: [255, 255, 255, 1], width: 1 }
        }

  return new Graphic({ geometry, symbol: symbol as any })
}

export function createResultGraphic(geometry: Geometry, attributes: Record<string, any> = {}): Graphic {
  const symbol = geometry.type === 'polygon'
    ? {
        type: 'simple-fill',
        color: [255, 170, 0, 0.22],
        outline: { color: [255, 120, 0, 1], width: 2 }
      }
    : geometry.type === 'polyline'
      ? {
          type: 'simple-line',
          color: [255, 120, 0, 1],
          width: 3
        }
      : {
          type: 'simple-marker',
          color: [255, 120, 0, 1],
          size: 8,
          outline: { color: [255, 255, 255, 1], width: 1 }
        }

  return new Graphic({ geometry, symbol: symbol as any, attributes })
}

export async function bufferGeometry(
  geometry: Geometry,
  distance: number,
  unit: __esri.LinearUnits
): Promise<Geometry | null> {
  const buffered = await geometryEngineAsync.buffer(geometry, distance, unit)
  return (Array.isArray(buffered) ? buffered[0] : buffered) as Geometry | null
}

export async function intersectGeometries(
  target: Geometry,
  overlay: Geometry
): Promise<Geometry | null> {
  const result = await geometryEngineAsync.intersect(target, overlay)
  return result as Geometry | null
}

export async function queryIntersectingFeatures(
  layer: FeatureLayer | GeoJSONLayer,
  geometry: Geometry,
  maxFeatures = 2000
): Promise<Graphic[]> {
  const query = (layer as any).createQuery()
  query.geometry = geometry
  query.spatialRelationship = 'intersects'
  query.returnGeometry = true
  query.outFields = ['*']
  query.num = maxFeatures
  const fs = await (layer as any).queryFeatures(query)
  return fs.features || []
}

export async function zoomToGeometries(view: MapView | SceneView, graphics: Graphic[]): Promise<void> {
  if (!graphics?.length) return
  await view.goTo(graphics)
}

export function exportGraphicsToGeoJSON(graphics: Graphic[], fileName: string): void {
  const features = graphics.map((g, index) => ({
    type: 'Feature',
    id: index + 1,
    properties: g.attributes || {},
    geometry: arcgisGeometryToGeoJSON(g.geometry as any)
  })).filter((f) => !!f.geometry)

  const fc = {
    type: 'FeatureCollection',
    features
  }

  const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.geojson') ? fileName : `${fileName}.geojson`
  a.click()
  URL.revokeObjectURL(url)
}

function arcgisGeometryToGeoJSON(geometry: any): any {
  if (!geometry) return null

  switch (geometry.type) {
    case 'point':
      return {
        type: 'Point',
        coordinates: [geometry.longitude ?? geometry.x, geometry.latitude ?? geometry.y]
      }
    case 'polyline':
      return {
        type: 'MultiLineString',
        coordinates: geometry.paths
      }
    case 'polygon':
      return {
        type: 'Polygon',
        coordinates: geometry.rings
      }
    case 'multipoint':
      return {
        type: 'MultiPoint',
        coordinates: geometry.points
      }
    default:
      return null
  }
}