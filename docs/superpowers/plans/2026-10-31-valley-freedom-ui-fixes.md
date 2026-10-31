# VALLEY FREEDOM UI and flow fixes

## Scope

Preserve the current React/TypeScript design and local prototype while fixing the reported itinerary ordering and conflict cues, companion checkbox/session card layout, login modal and protected-action return, map panel sizing and password-confirmed cumulative stamps, proposal copy, and companion profile age/identity/photo editing.

## Implementation sequence

1. Add regression tests for chronological rendering, recalculated end times and overlap notices; stamp password/idempotency/persistence; age validation; guest login modal return.
2. Fix itinerary sorting and edit layout; separate companion fee and transport guidance; correct checkbox and session card semantics/styles.
3. Replace route-based login with a reusable accessible login modal that preserves current route and protected action.
4. Add map stamp password flow and persistent per-place stamp history; constrain map panel scroll on desktop and restore natural mobile scroll.
5. Add proposal placeholder and companion gender/birthdate/age/photo upload using IndexedDB-backed photo storage.
6. Run typecheck, unit tests, Playwright desktop/mobile viewport checks, and build; publish the verified source to GitHub and the existing public Site.

## Constraints

- Do not add a backend or real authentication.
- Keep all personal fields and image data within the browser; do not persist base64 photos in LocalStorage.
- Keep map coordinates, candidate-partner status, and demonstration-data warnings unchanged.
- Touch targets remain usable on narrow phones; modal content must fit the viewport and support Escape/focus return.
