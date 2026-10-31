import { describe, expect, it } from 'vitest'
import { clusterProjectedPlaces, createProjectedPlaces, fitTaiwanProjection, layoutMarkerLabels, mainlandCounties, type MapPlaceCoordinate } from './mapGeometry'

const counties = {
  type: 'FeatureCollection' as const,
  features: [{
    type: 'Feature' as const,
    properties: { COUNTYNAME: '臺灣' },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[120, 22], [122, 22], [122, 25], [120, 25], [120, 22]]],
    },
  }],
}

describe('projected place map', () => {
  it('clusters nearby anchors and expands the same group without changing geographic anchors', () => {
    const places = createProjectedPlaces(counties, [
      { id: 'a', name: '甲', longitude: 121.2, latitude: 23.4 },
      { id: 'b', name: '乙', longitude: 121.20005, latitude: 23.4 },
      { id: 'c', name: '丙', longitude: 120.5, latitude: 23.4 },
    ], 600, 700)
    const grouped = clusterProjectedPlaces(places, 32)
    expect(grouped.map((item) => item.kind)).toEqual(['cluster', 'place'])
    const cluster = grouped[0]
    expect(cluster?.kind).toBe('cluster')
    if (cluster?.kind !== 'cluster') return
    const expanded = clusterProjectedPlaces(places, 32, new Set([cluster.id]))
    expect(expanded.map((item) => item.kind)).toEqual(['place', 'place', 'place'])
    expect(expanded.filter((item) => item.kind === 'place').map((item) => item.place.anchorX)).toEqual(places.map((place) => place.anchorX))
  })

  it('places expanded labels within bounds and keeps their requested visual clearance', () => {
    const crowded = Array.from({ length: 8 }, (_, i) => ({
      id: `crowded-${i}`, name: `場域${i}`, longitude: 121.2, latitude: 23.4,
      anchorX: 300, anchorY: 380, labelX: 300, labelY: 380,
    }))
    const laidOut = layoutMarkerLabels(crowded, 600, 760, 44)
    for (const [index, point] of laidOut.entries()) {
      expect(point.labelX).toBeGreaterThanOrEqual(0)
      expect(point.labelX).toBeLessThanOrEqual(600)
      expect(point.labelY).toBeGreaterThanOrEqual(0)
      expect(point.labelY).toBeLessThanOrEqual(760)
      for (const other of laidOut.slice(index + 1)) {
        expect(Math.hypot(point.labelX - other.labelX, point.labelY - other.labelY)).toBeGreaterThanOrEqual(44)
      }
    }
  })
  it('projects longitude/latitude through the same fitted projection and does not assign positions to unknown places', () => {
    const places: MapPlaceCoordinate[] = [
      { id: 'east', name: '東側', longitude: 121.5, latitude: 23.5 },
      { id: 'west', name: '西側', longitude: 120.5, latitude: 23.5 },
      { id: 'unknown', name: '待查' },
    ]
    const result = createProjectedPlaces(counties, places, 600, 700)
    expect(result.map((place) => place.id)).toEqual(['east', 'west'])
    expect(result[0].anchorX).toBeGreaterThan(result[1].anchorX)
    expect(result.every((place) => place.anchorX !== place.labelX || place.anchorY !== place.labelY)).toBe(true)
    expect(result[0].anchorX).toBeCloseTo(fitTaiwanProjection(counties, 600, 700)([121.5, 23.5])?.[0] ?? 0)
  })

  it('keeps geographic anchor and leader line separate from the collision-avoiding label', () => {
    const places = Array.from({ length: 4 }, (_, i): MapPlaceCoordinate => ({
      id: `p${i}`, name: `點${i}`, longitude: 121.2 + i * 0.00005, latitude: 23.4,
    }))
    const result = createProjectedPlaces(counties, places, 600, 700)
    expect(new Set(result.map((place) => `${place.labelX.toFixed(1)},${place.labelY.toFixed(1)}`)).size).toBe(4)
    expect(result.every((place) => place.anchorX >= 0 && place.anchorX <= 600 && place.anchorY >= 0 && place.anchorY <= 700)).toBe(true)
  })

  it('normalizes GeoJSON exterior ring orientation for d3 spherical projection', () => {
    const projection = fitTaiwanProjection(counties, 600, 700)
    const bounds = projection([120, 22])
    const oppositeCorner = projection([122, 25])
    expect(bounds?.[0]).not.toEqual(oppositeCorner?.[0])
    expect(bounds?.[1]).not.toEqual(oppositeCorner?.[1])
    expect(projection.scale()).toBeGreaterThan(10)
  })

  it('keeps the largest Taiwan mainland polygon and excludes county islands and offshore counties', () => {
    const collection = {
      type: 'FeatureCollection' as const,
      features: [
        { ...counties.features[0], properties: { COUNTYNAME: '花蓮縣' }, geometry: { type: 'MultiPolygon' as const, coordinates: [
          counties.features[0].geometry.coordinates,
          [[[125, 23], [126, 23], [126, 24], [125, 24], [125, 23]]],
        ] } },
        { ...counties.features[0], properties: { COUNTYNAME: '澎湖縣' } },
      ],
    }
    const mainland = mainlandCounties(collection)
    expect(mainland.features.map((feature) => feature.properties.COUNTYNAME)).toEqual(['花蓮縣'])
    expect(mainland.features[0].geometry?.type).toBe('MultiPolygon')
    expect(mainland.features[0].geometry?.type === 'MultiPolygon' && mainland.features[0].geometry.coordinates).toHaveLength(1)
  })
})
