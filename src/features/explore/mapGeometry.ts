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

export type MapPlaceRenderItem =
  | { kind: 'place'; id: string; place: ProjectedPlace }
  | { kind: 'cluster'; id: string; anchorX: number; anchorY: number; places: ProjectedPlace[] }

export function clusterProjectedPlaces(
  places: ProjectedPlace[],
  maximumDistance: number,
  expandedClusters: Set<string> = new Set(),
): MapPlaceRenderItem[] {
  const parents = places.map((_, index) => index)
  const find = (index: number): number => {
    if (parents[index] !== index) parents[index] = find(parents[index])
    return parents[index]
  }
  const join = (left: number, right: number) => { parents[find(left)] = find(right) }
  for (let left = 0; left < places.length; left += 1) {
    for (let right = left + 1; right < places.length; right += 1) {
      const a = places[left]
      const b = places[right]
      if (a && b && Math.hypot(a.anchorX - b.anchorX, a.anchorY - b.anchorY) < maximumDistance) join(left, right)
    }
  }
  const groups = new Map<number, ProjectedPlace[]>()
  places.forEach((place, index) => {
    const root = find(index)
    groups.set(root, [...(groups.get(root) ?? []), place])
  })
  return [...groups.values()].map((group) => {
    if (group.length === 1) return { kind: 'place' as const, id: group[0]!.id, place: group[0]! }
    const ids = group.map((place) => place.id).sort()
    const id = `cluster:${ids.join('|')}`
    if (expandedClusters.has(id)) return group.map((place) => ({ kind: 'place' as const, id: place.id, place }))
    return {
      kind: 'cluster' as const,
      id,
      anchorX: group.reduce((sum, place) => sum + place.anchorX, 0) / group.length,
      anchorY: group.reduce((sum, place) => sum + place.anchorY, 0) / group.length,
      places: group,
    }
  }).flat()
}

function segmentsCross(a: ProjectedPlace, b: ProjectedPlace): boolean {
  const orient = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  return orient(a.anchorX, a.anchorY, a.labelX, a.labelY, b.anchorX, b.anchorY) * orient(a.anchorX, a.anchorY, a.labelX, a.labelY, b.labelX, b.labelY) < 0
    && orient(b.anchorX, b.anchorY, b.labelX, b.labelY, a.anchorX, a.anchorY) * orient(b.anchorX, b.anchorY, b.labelX, b.labelY, a.labelX, a.labelY) < 0
}

export function layoutMarkerLabels(places: ProjectedPlace[], width: number, height: number, minimumDistance = 40): ProjectedPlace[] {
  const arranged: ProjectedPlace[] = []
  const step = Math.max(6, minimumDistance / 2)
  const angles = Array.from({ length: 24 }, (_, index) => index * Math.PI / 12)
  return places.map((place) => {
    let best: ProjectedPlace | undefined
    let bestScore = Number.POSITIVE_INFINITY
    for (let radius = minimumDistance / 2; radius <= Math.hypot(width, height); radius += step) {
      for (const angle of angles) {
        const x = place.anchorX + Math.cos(angle) * radius
        const y = place.anchorY + Math.sin(angle) * radius
        if (x < minimumDistance / 2 || x > width - minimumDistance / 2 || y < minimumDistance / 2 || y > height - minimumDistance / 2) continue
        const candidate = { ...place, labelX: x, labelY: y }
        if (arranged.some((other) => Math.hypot(x - other.labelX, y - other.labelY) < minimumDistance)) continue
        const crossings = arranged.reduce((count, other) => count + Number(segmentsCross(candidate, other)), 0)
        const score = radius + crossings * Math.max(width, height)
        if (score < bestScore) { best = candidate; bestScore = score }
      }
      if (best && bestScore < radius + Math.max(width, height)) break
    }
    const result = best ?? { ...place, labelX: Math.max(0, Math.min(width, place.anchorX)), labelY: Math.max(0, Math.min(height, place.anchorY)) }
    arranged.push(result)
    return result
  })
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
  const projectedPlaces = places.flatMap((place) => {
    if (!Number.isFinite(place.longitude) || !Number.isFinite(place.latitude)) return []
    const projected = projection([place.longitude as number, place.latitude as number])
    if (!projected) return []
    const [anchorX, anchorY] = projected
    return [{ ...place, anchorX, anchorY, labelX: anchorX, labelY: anchorY }]
  })
  return layoutMarkerLabels(projectedPlaces, width, height, 40)
}

export function countyPath(projection: GeoProjection, feature: Feature<Geometry, TaiwanCountyProperties>): string | null | undefined {
  return geoPath(projection)(feature as GeoPermissibleObjects)
}
