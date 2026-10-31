import { geoMercator, geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

export interface MapPlaceCoordinate {
  id: string
  name: string
  longitude?: number
  latitude?: number
}

export interface ProjectedPlace extends MapPlaceCoordinate {
  anchorX: number
  anchorY: number
  labelX: number
  labelY: number
}

export interface TaiwanCountyProperties extends Record<string, unknown> {
  COUNTYNAME?: string
}

export type TaiwanCountyCollection = FeatureCollection<Geometry, TaiwanCountyProperties>

export const MAIN_ISLAND_EXCLUDED_COUNTIES = new Set(['澎湖縣', '金門縣', '連江縣'])

export function mainlandCounties(collection: TaiwanCountyCollection): TaiwanCountyCollection {
  return {
    ...collection,
    features: collection.features
      .filter((feature) => !MAIN_ISLAND_EXCLUDED_COUNTIES.has(feature.properties?.COUNTYNAME ?? ''))
      .flatMap((feature) => {
        const normalized = normalizeMainlandGeometry(feature)
        return normalized ? [normalized] : []
      }),
  }
}

export function fitTaiwanProjection(collection: TaiwanCountyCollection, width: number, height: number): GeoProjection {
  const mainland = mainlandCounties(collection)
  return geoMercator().fitExtent([[18, 18], [Math.max(19, width - 18), Math.max(19, height - 18)]], mainland as GeoPermissibleObjects)
}

const directions = [
  [1, -1], [1, 0], [1, 1], [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1],
]

function labelPosition(anchorX: number, anchorY: number, width: number, height: number, occupied: Array<[number, number]>, offset = 28): [number, number] {
  for (let radius = offset; radius <= 154; radius += 14) {
    for (const [dx, dy] of directions) {
      const x = Math.min(width - 18, Math.max(18, anchorX + dx * radius))
      const y = Math.min(height - 18, Math.max(18, anchorY + dy * radius))
      if (occupied.every(([otherX, otherY]) => Math.hypot(x - otherX, y - otherY) >= 39)) return [x, y]
    }
  }
  return [Math.min(width - 18, Math.max(18, anchorX + offset)), Math.min(height - 18, Math.max(18, anchorY + offset))]
}

type Position = [number, number, ...number[]]
type LinearRing = Position[]
type PolygonCoordinates = LinearRing[]

function planarRingArea(ring: LinearRing): number {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length]
    return area + point[0] * next[1] - next[0] * point[1]
  }, 0) / 2
}

function isTaiwanMainIslandPolygon(polygon: PolygonCoordinates): boolean {
  const outer = polygon[0] ?? []
  const longitudes = outer.map(([longitude]) => longitude)
  const latitudes = outer.map(([, latitude]) => latitude)
  return Math.max(...longitudes) >= 119 && Math.min(...longitudes) <= 122.2
    && Math.max(...latitudes) >= 21.6 && Math.min(...latitudes) <= 25.5
}

function normalizePolygon(polygon: PolygonCoordinates): PolygonCoordinates {
  return polygon.map((ring, index) => {
    const area = planarRingArea(ring)
    const shouldBeClockwise = index === 0
    const isClockwise = area < 0
    return isClockwise === shouldBeClockwise ? ring : [...ring].reverse()
  })
}

function normalizeMainlandGeometry(feature: Feature<Geometry, TaiwanCountyProperties>): Feature<Geometry, TaiwanCountyProperties> | null {
  const geometry = feature.geometry
  if (!geometry) return feature
  if (geometry.type === 'Polygon') {
    const polygon = geometry.coordinates as PolygonCoordinates
    return isTaiwanMainIslandPolygon(polygon) ? { ...feature, geometry: { ...geometry, coordinates: normalizePolygon(polygon) } } : null
  }
  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as PolygonCoordinates[]
    const mainland = polygons.filter(isTaiwanMainIslandPolygon)
    const largestMainland = mainland.sort((a, b) => Math.abs(planarRingArea(b[0] ?? [])) - Math.abs(planarRingArea(a[0] ?? []))).slice(0, 1).map(normalizePolygon)
    return largestMainland.length ? { ...feature, geometry: { ...geometry, coordinates: largestMainland } } : null
  }
  return feature
}

export function createProjectedPlaces(
  counties: TaiwanCountyCollection,
  places: MapPlaceCoordinate[],
  width: number,
  height: number,
): ProjectedPlace[] {
  if (width <= 0 || height <= 0) return []
  const projection = fitTaiwanProjection(counties, width, height)
  const occupied: Array<[number, number]> = []
  return places.flatMap((place) => {
    if (!Number.isFinite(place.longitude) || !Number.isFinite(place.latitude)) return []
    const projected = projection([place.longitude as number, place.latitude as number])
    if (!projected) return []
    const [anchorX, anchorY] = projected
    const [labelX, labelY] = labelPosition(anchorX, anchorY, width, height, occupied)
    occupied.push([labelX, labelY])
    return [{ ...place, anchorX, anchorY, labelX, labelY }]
  })
}

export function countyPath(projection: GeoProjection, feature: Feature<Geometry, TaiwanCountyProperties>): string | null | undefined {
  return geoPath(projection)(feature as GeoPermissibleObjects)
}
