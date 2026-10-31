# VALLEY FREEDOM Experimental Editorial Redesign Implementation Plan

> **For agentic workers:** Native execution is selected by the user. Steps use checkbox syntax and are performed sequentially without phase-by-phase approval.

**Goal:** Rebuild the existing travel prototype as a Japanese experimental editorial experience while preserving all routes, mock data, itinerary, companion, booking, operator and youth workflows, then publish to the existing public Site.

**Architecture:** Keep React Router, domain/store/localStorage, existing route/page components and existing image assets. Recompose the homepage and add scoped GSAP ScrollTrigger timelines with cleanup. Keep native vertical scrolling and responsive static-flow fallbacks for mobile and reduced motion; do not load Three.js without a page-specific need.

**Tech Stack:** React 19, TypeScript, Vite, React Router, Vitest, Playwright, GSAP/ScrollTrigger, Three.js/R3F.

**Spec:** `docs/superpowers/specs/2026-10-16-valley-freedom-design.md`

## Global Constraints

- Preserve every current route, store record, local workflow and public Site identity/access.
- Core homepage copy: “花東，自己玩。” and “不跟團、不趕行程。想找人同行，也可以。”
- Keep “在行程空白處直接找旅伴” and validated query handoff intact.
- Label all mock people, places, services, photos, prices, schedules and transportation guidance as illustrative or pending verification.
- Use GSAP ScrollTrigger with reversible scrub on desktop; native/static flow on mobile and `prefers-reduced-motion`.
- No page-wide scroll hijacking, route regressions, horizontal document overflow, clipped interface text or dead controls.
- Do not copy reference site assets, code, logo or copy.

## Reference Findings / Review Focus

- HEARTS: large documentary photo under a compact nav, landscape-edge transition, fixed nav and editorial news that follows; mobile uses a vertically cropped focal photo and document flow.
- MORE THAN: generous white negative space, oversized offset Japanese title over full-width photography, then alternating image/text blocks; mobile keeps the photo vertical and restores readable flow. User attachment informs a separate multi-row oversized scroll-driven text/photo interlude.
- VESSEL: split full-screen photo opening, curved color boundary and lettering on an arc; mobile reduces to a single portrait photo while retaining the curved transition. Apply an arc to one regional gallery only.
- URBANEX SHIFT: white field, oversized typography and fine line masks reveal large graphic forms across divided sections. Mobile remained on its loading percentage in our inspection, so do not infer a mobile animation from it.
- Existing VALLEY FREEDOM: full-bleed background plus stacked headline, long copy and two CTAs; old explanatory landscape section; four equal cards. This lacks image-frame expansion, distinct text velocities and an editorial marquee.
- Highest risk inputs: reduced-motion users; image loading/error; fast/reverse scroll; mobile widths 390/430; missing or invalid itinerary fields; no WebGL; persistent saved itinerary and direct route navigation.

## Files and Responsibilities

- `docs/superpowers/specs/2026-10-16-valley-freedom-design.md`: source of truth; observed reference differences and staged acceptance.
- `docs/superpowers/plans/2026-10-16-valley-freedom.md`: this implementation checklist.
- `src/features/traveler/HomePage.tsx`: hero, marquee, single arc regional entry, copy and existing functional links.
- `src/features/traveler/home.test.tsx`: core homepage links, exact copy, four regions, and imagery/demo disclosure.
- `src/components/motion/useHomeScrollStory.ts`: route-scoped GSAP scrub timelines for hero, marquee and optional arc; cleanup and reduced-motion/mobile guards.
- `src/styles/home.css`, `src/styles/motion.css`, `src/styles/travel-overrides.css`: page-specific editorial layouts and responsive fallbacks.
- `src/features/explore/RegionalExplorePage.tsx`, its tests, `src/features/companions/*`, `src/features/itinerary/*`, `src/domain/*`: preserve/repair region facts, service details, free-time handoff and current workflows.
- `.openai/hosting.json`: keep existing public Site id and static output.

---

## Phase 1 — Reference Review and Updated Specification

- [x] Open each named reference in browser at desktop and mobile sizes; inspect at least its opening state and a scrolled state when it finishes loading.
- [x] Capture the current public VALLEY FREEDOM desktop page and document its structural difference from references.
- [x] Update the design spec with direct observations, limitations, original-site gaps, visual system and acceptance stages.
- [x] Update this plan before changing implementation code.

## Phase 2 — HEARTS-Inspired Expanding Hero

**Files:** `HomePage.tsx`, `home.css`, `useHomeScrollStory.ts`, `home.test.tsx`.

- [x] Test the “花東，自己玩。” hero, concise subcopy, companion link and itinerary link before markup changes.
- [x] Replace the conventional background-and-copy layout with a centered offset photo window, foreground copy layers and unobtrusive two-entry navigation.
- [x] Use a desktop GSAP timeline pinned only through a short section; scrub photo scale/clip and text x/y on distinct ranges; make upward scroll reverse naturally.
- [x] Keep images dimensioned before load, handle load/error without blocking text or interaction, and prevent layout shifts.
- [x] Add a phone-specific portrait composition and disable pinning below 761px / on reduced motion.
- [x] Run focused homepage test and typecheck; inspect desktop 1440×900 and phone 390×844 screenshots.

## Phase 3 — MORE THAN-Inspired Scroll Typography Interlude

**Files:** `HomePage.tsx`, `home.css`, `useHomeScrollStory.ts`, `home.test.tsx`.

- [x] Test visual text alternatives and illustrative photo labels; remove the old explanatory “山與海” section from homepage markup.
- [x] Add three staggered oversized rows using the concise phrases “GO EAST.”, “花東，自由走。”, “YOUR WAY.”, “山線 / 海線”, “NO FIXED ROUTE.” and offset locally available photos.
- [x] Use ScrollTrigger scrub to move rows in alternating horizontal directions at distinct rates; do not create an autoplay loop.
- [x] Ensure this movement does not create document-level horizontal scrolling; preserve semantic visually hidden text where necessary.
- [x] On mobile, use smaller crop-safe typography and a shorter non-pinned native flow; reduced-motion stays static.
- [x] Run focused tests/typecheck and inspect desktop/mobile screenshots.

## Phase 4 — VESSEL-Inspired Regional Arc and SHIFT Transitions

**Files:** `HomePage.tsx`, `home.css`, `RegionalExplorePage.tsx`, `travel-overrides.css`, related tests and scoped motion hook.

- [x] Test four direct region links and keep region identifiers, names and disclosure labels stable.
- [x] Replace equal 2×2 homepage cards with one asymmetrical arc image tour; vary image sizes and place four readable labels/links along a CSS arc.
- [x] Add one scroll-driven rotation/translation timeline with short pin on desktop, natural vertical order on mobile, and reduced-motion static arrangement.
- [x] Add SHIFT-inspired line/clip transitions only at editorial section changes; keep native scroll and avoid applying arc gallery treatment to itinerary, booking, or workbench pages.
- [x] Maintain the distinct region page information: transport planning, stay guidance, site traits, verification source and add-to-itinerary action.
- [x] Run regional tests and inspect 1440×900 plus 390×844 screenshots.

## Phase 5 — Copy and Information Completeness

**Files:** homepage and remaining traveler/explore/companion/itinerary/booking/operator/youth/co-create page files and their tests.

- [x] Search user-visible copy for repeated abstract phrases and replace with brief conversational task-focused language.
- [x] Check every public exploration/service page for transport, suggested stay, itinerary, site characteristic, companion scope and booking steps; use clearly marked mock data where confirmation is unavailable.
- [x] Check all imagery/persons/rates/schedules have explicit demonstration disclosure.
- [x] Keep editorial English only as visual typography/navigation aid; avoid repeated decorative labels.
- [x] Run relevant copy/page tests and typecheck.

## Phase 6 — Core Journey and Motion Regression

**Files:** `ItineraryPage.tsx`, `CompanionSearchPage.tsx`, existing domain/tests, motion hook, any small fixes.

- [x] Verify itinerary time-gap calculation, blank-time CTA, date/time/duration/destination/itineraryId query handoff and safe invalid-query defaults.
- [x] Verify traveler can edit/reorder itinerary, open companion profiles, submit a request and review bookings; submit stays explicit and never auto-books.
- [x] Verify operator and youth workspace routes still render and keep their original actions.
- [x] Verify all GSAP contexts revert on unmount and no repeated ScrollTriggers remain after route changes.
- [x] Verify no-WebGL, image-error and reduced-motion views remain readable and usable.
- [x] Run focused existing tests and typecheck.

## Phase 7 — Responsive QA, Full Test Run, Publish

- [x] Capture/inspect screenshots at 1440×900, 1920×1080, 390×844 and 430×932; fix accidental clipping, horizontal page overflow and mobile desktop-collapse artifacts.
- [x] Check animation end/start states and reverse scrolling; verify hero-to-marquee handoff, Marquee-to-regions handoff, font/image loading stability, focus and reduced-motion.
- [x] Run `npm run typecheck`, `npm test -- --run`, `npm run build`, `npm run test:e2e`; report literal results.
- [x] Confirm `.openai/hosting.json` still identifies the current public project and original access audience.
- [x] Push/package from the verified checkout, save a new version, deploy it to the existing Site and verify the returned live URL/version.
- [x] Reopen the public URL and capture final desktop/mobile screenshots.
