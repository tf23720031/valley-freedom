import { describe, expect, it } from 'vitest'
import { districts, getPlaceById } from './districts'

describe('Hualien and Taitung place directory', () => {
  it('keeps the 18 requested places grouped in four regions without inventing partnerships or booking', () => {
    expect(districts.map((region) => region.places.length)).toEqual([2, 6, 4, 5])
    const places = districts.flatMap((region) => region.places)
    expect(places).toHaveLength(17)
    expect(places.every((place) => place.partnershipStatus === 'not-confirmed' && place.companionService === 'not-confirmed' && place.photoIsPlacePhoto === false)).toBe(true)
    expect(places.filter((place) => place.bookingChannel === 'public').every((place) => place.bookingUrl)).toBe(true)
    expect(getPlaceById('muri-sunshine')?.verifiedFacts.join(' ')).toContain('瑞穗')
  })
})
