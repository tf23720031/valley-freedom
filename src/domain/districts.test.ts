import { describe, expect, it } from 'vitest'
import { districts, getPlaceById } from './districts'

describe('Hualien and Taitung place directory', () => {
  it('keeps the 17 requested places grouped in four regions without inventing partnerships or booking', () => {
    expect(districts.map((region) => region.places.length)).toEqual([2, 6, 4, 5])
    const places = districts.flatMap((region) => region.places)
    expect(places).toHaveLength(17)
    expect(places.every((place) => place.sources.length > 0 && place.sources.every((source) => source.url.startsWith('https://')))).toBe(true)
    expect(places.every((place) => place.partnershipStatus === 'not-confirmed' && place.companionService === 'not-confirmed' && place.photoIsPlacePhoto === false)).toBe(true)
    expect(places.filter((place) => place.bookingChannel === 'public').every((place) => place.bookingUrl)).toBe(true)
    expect(getPlaceById('muri-sunshine')?.verifiedFacts.join(' ')).toContain('瑞穗')
  })

  it('only provides map coordinates with a source and leaves four unresolved venues unpinned', () => {
    const places = districts.flatMap((region) => region.places)
    const located = places.filter((place) => place.coordinates)
    const pending = places.filter((place) => !place.coordinates)
    expect(located).toHaveLength(15)
    expect(located.every((place) => Number.isFinite(place.coordinates?.latitude)
      && Number.isFinite(place.coordinates?.longitude)
      && Boolean(place.coordinates?.sourceUrl))).toBe(true)
    expect(pending.map((place) => place.id)).toEqual(['rice-like-fu', 'fire-studio'])
  })
})
