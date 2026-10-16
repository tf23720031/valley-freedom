# 縱谷自由行動所 Implementation Plan

> **For agentic workers:** Use the task sequence below in order. Steps use checkbox syntax for tracking.

**Goal:** 建立一個可展示、響應式且以單一瀏覽器 LocalStorage 狀態驅動的地方微體驗預約與共創平台原型。

**Architecture:** 以 Vite + React + TypeScript 建立獨立 SPA，透過 React Router 提供旅客、青年、業者與共創工作區。所有領域資料經集中式 store/reducer 修改並版本化保存；React 訂閱 store，同源其他分頁透過 `storage` 事件重新載入。旅客、青年、業者操作共用領域服務，以唯一 ID 與明確狀態轉移維持一致。

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, LocalStorage, Vitest, React Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-valley-freedom-design.md`

## Global Constraints

- 所有介面使用繁體中文，所有活動、價格、營運數據清楚標示為示意資料。
- 使用奶油白 #F8F6F0、鼠尾草綠 #A7B9A2、森林綠 #284B3B、暖米色 #E8E0D2、深灰 #292D29。
- 使用成熟細緻的自然地方插畫、藝術字體與日系編輯式排版；插畫不得遮擋內容或顯得幼稚。
- 禁止 Emoji、花俏漸層、螢光色、裁切文字、低對比導覽、內層捲軸與無功能按鈕；Lucide 線條圖示僅少量使用。
- 所有資料寫入集中於領域 store；UI 元件不可直接寫 LocalStorage。
- 待確認與已確認預約占用名額；取消單不占名額；旅客/業者取消共用函式並記錄原因、來源、時間；已完成訂單不可取消。
- 同瀏覽器其他分頁透過 `storage` 事件同步；不得宣稱具備跨分頁並行交易保證。
- 行程草稿與正式預約分開；旅客自建活動不占場次；取消預約不可顯示為有效預約。
- 正式體驗保留來源共創草案 ID，並建立自己的正式體驗 ID。
- 青年工作不可包含未具資格者承接受法規限制的導遊、接送或水域活動。
- 預約、任務申請、共創轉換等流程資料均需唯一 ID，重置示範資料需二次確認。

## Review Focus

- 預約容量已滿時的競態與邊界人數：domain service 測試零名額、超額、取消後釋位；跨分頁只承諾畫面同步，不承諾原子交易。
- 旅客取消與業者取消的來源、理由與重複操作：兩端呼叫同一取消函式的測試驗證拒絕無效狀態。
- `storage` 事件收到格式錯誤或舊版資料：store 測試需保留可用預設資料並回報可見錯誤。
- 任務名額同時申請/重複申請及取消後再申請：任務 service 測試同人同任務只能有一筆有效申請且不超錄取容量。
- 共創重複上架與回饋/修改歷史追溯：轉正式體驗測試確認來源草案唯一、原 ID 被保留、正式 ID 不同且重複操作被拒絕。

---

### Task 1: 建立獨立 Vite 專案骨架與品牌外框

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `postcss.config.js` (only if required by selected Tailwind version), `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/components/BrandShell.tsx`, `src/components/RoleSwitcher.tsx`, `src/components/ToastRegion.tsx`, `src/components/ConfirmDialog.tsx`, `public/valley-mark.svg`
- Test: `src/app/router.test.tsx`, `src/components/ConfirmDialog.test.tsx`

**Interfaces:**
- `BrandShell({ children }: { children: React.ReactNode })` renders header, responsive navigation, demo notice, footer and a role switcher slot.
- `RoleSwitcher` reads and changes role through the shared application state once Task 2 lands; Task 1 initially wires an accessible typed prop interface.
- Router routes: `/`, `/experiences`, `/experiences/:experienceId`, `/itinerary`, `/bookings`, `/muri-sunshine`, `/youth`, `/youth/tasks/:taskId`, `/operator`, `/operator/experiences`, `/operator/bookings`, `/operator/tasks`, `/co-create`.

- [ ] **Step 1: Define the project scripts and dependency versions**

  Add React, React DOM, React Router, Lucide React, Vite, TypeScript, Tailwind CSS and its Vite integration. Add Vitest, jsdom, Testing Library and Playwright for the requested role-flow verification. Define `dev`, `build`, `typecheck`, `test`, and `test:e2e` scripts.

- [ ] **Step 2: Create the minimal Vite entry and route shell**

  Create `src/main.tsx`, `App.tsx` and a `createBrowserRouter` route tree with a real not-found page. Start each route with a labeled page heading and accessible links; do not leave dead buttons.

- [ ] **Step 3: Add the global visual tokens and responsive shell**

  Define the specified palette and typography stacks in CSS. Build brand mark as a small local SVG, warm editorial header/footer, desktop nav and mobile menu button with `aria-expanded`; include a demo-data notice and layout focus styles. Use serif only for English display typography.

- [ ] **Step 4: Add shared confirmation and feedback primitives**

  Implement accessible dialog semantics, cancel/confirm actions and a toast region. Ensure Escape closes only non-destructive dialogs and focus returns to the opener.

- [ ] **Step 5: Verify the shell**

  Run `npm run typecheck` and `npm test -- --run src/app/router.test.tsx src/components/ConfirmDialog.test.tsx`; verify routes render and the dialog keyboard actions work.

### Task 2: 建立領域模型、示意資料與集中式 LocalStorage store

**Files:**
- Create: `src/domain/types.ts`, `src/domain/ids.ts`, `src/domain/fixtures.ts`, `src/domain/booking.ts`, `src/domain/itinerary.ts`, `src/domain/youth.ts`, `src/domain/cocreation.ts`, `src/store/persistence.ts`, `src/store/appStore.ts`, `src/store/AppStateProvider.tsx`, `src/store/useAppState.ts`, `src/store/appStore.test.ts`, `src/domain/booking.test.ts`, `src/domain/youth.test.ts`, `src/domain/cocreation.test.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- `AppState` contains `schemaVersion`, `role`, `travelerId`, `youthId`, `experiences`, `sessions`, `bookings`, `itineraries`, `tasks`, `taskApplications`, `resources`, `drafts`, `pilotSessions`, `feedback`, and `changeLog`.
- `BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'`; `CancelSource = 'traveler' | 'operator'`; `cancelBooking(state, { bookingId, source, reason, now }): Result<AppState>`.
- `remainingSeats(state, sessionId): number`; `createBooking(state, { sessionId, travelerId, partySize, now }): Result<{ state: AppState; bookingId: string }>`.
- `subscribe(listener): () => void`; `getSnapshot(): AppState`; `dispatch(action): Result<void>`; all mutations persist via one reducer path.
- `Provider` loads/migrates or initializes fixture data, subscribes React, and re-reads storage on `storage` events for the canonical key. It catches malformed payloads and announces recovery.

- [ ] **Step 1: Write domain behavior tests first**

  Cover at minimum: 8+ unique experience IDs, distinct slot IDs; pending and confirmed bookings occupy seats; cancelled/completed do not; over-capacity booking is rejected; cancellation records source/reason/time and releases seats; repeat cancellation and completed cancellation are rejected; duplicate task application and over-capacity acceptance are rejected; only completed eligible task applications count hours; draft/pilot are not public experiences; publish preserves `sourceDraftId` and creates a distinct experience ID; duplicate publish is rejected.

- [ ] **Step 2: Run the focused domain tests and confirm the expected failures**

  Run `npm test -- --run src/domain/booking.test.ts src/domain/youth.test.ts src/domain/cocreation.test.ts`. The initial failure should be missing domain exports.

- [ ] **Step 3: Define typed entities and deterministic fixture dataset**

  Create entity interfaces with branded string IDs or typed ID aliases. Populate at least eight varied experiences and sessions, several booking statuses, youth tasks, one application, resources, a draft, pilot session, feedback and change log entries. Give all records unique IDs and show `isDemo: true` where useful.

- [ ] **Step 4: Implement pure domain operations**

  Implement seat calculation from pending+confirmed booking party sizes, `createBooking`, shared `cancelBooking`, operator confirmation, itinerary editing and validation, youth application/review/completion, and co-creation transitions. Each operation returns a typed success/error result and never mutates the input state.

- [ ] **Step 5: Implement persistence and cross-tab subscription**

  Implement a versioned storage key and migration/fixture fallback. Reducer dispatch persists one serialized state and notifies in-process subscribers. `storage` listener re-reads and validates external state and notifies subscribers. Document in the UI/domain comments that storage events do not provide transactional guarantees.

- [ ] **Step 6: Connect the React provider and run focused tests**

  Wrap the app in `AppStateProvider`, expose `useAppState`, verify state survives provider remount and that a synthetic `StorageEvent` updates subscribers. Run focused tests and `npm run typecheck`.

### Task 3: 完成旅客首頁、探索、詳情、預約與木日光介紹

**Files:**
- Create: `src/features/traveler/HomePage.tsx`, `src/features/traveler/ExplorePage.tsx`, `src/features/traveler/ExperienceDetailPage.tsx`, `src/features/traveler/BookingsPage.tsx`, `src/features/traveler/MuriSunshinePage.tsx`, `src/features/traveler/ExperienceCard.tsx`, `src/features/traveler/BookingForm.tsx`, `src/features/traveler/traveler.css`, `src/features/traveler/traveler.test.tsx`, `public/illustrations/valley-hero.svg`, `public/illustrations/citrus-grove.svg`
- Modify: `src/app/router.tsx`, `src/components/BrandShell.tsx`, `src/components/RoleSwitcher.tsx`

**Interfaces:**
- Experience cards consume `Experience` plus `Session[]`, calculate available slots through `remainingSeats`.
- Booking form calls `dispatch(createBooking)` and navigates to `/bookings?created=<bookingId>` on success.
- Traveler pages read the same store used by operator views; filters are local view state only.

- [ ] **Step 1: Test traveler discovery and booking behaviors**

  Add tests for category/keyword/price/length/bookable filters, detail rendering, party size bounded by remaining seats, booking creation, no-seat feedback and booking status display.

- [ ] **Step 2: Build a distinctive editorial landing page**

  Create an illustrated縱谷 hero with brand title, Chinese tagline, clear explore and itinerary CTAs, editorial metadata, featured experiences, Muri Sunshine story and youth co-creation introduction. Use original restrained botanical/landscape SVGs and the approved palette; avoid generic dashboard layout.

- [ ] **Step 3: Build discovery filters and experience cards**

  Make controls usable on narrow screens, provide keyword/category/date/price/duration/bookable filters and a reset action. Use semantic labels and visible result counts; show a useful empty state.

- [ ] **Step 4: Build experience detail and booking flow**

  Show image, duration, meeting place, location, price, date/time slots and computed remaining seats. Add party-size selector capped by seats; simulate booking with confirmation dialog and visible success/error result. Include a separate “加入自由旅程” action that never creates a booking.

- [ ] **Step 5: Build booking history and Muri Sunshine story**

  Show current traveler’s pending, confirmed, cancelled and completed records with clear status. Cancel uses a reason selector/input, confirmation dialog and the shared cancellation operation with `source: 'traveler'`. Explain Muri Sunshine’s pomelo culture, food/agriculture education, place story and platform role with related experience links.

- [ ] **Step 6: Verify traveler flow and responsive layout**

  Run `npm test -- --run src/features/traveler/traveler.test.tsx`; use Playwright at 390px and 1440px to explore, book, view the booking and cancel it; confirm remaining seats update. Run `npm run build`.

### Task 4: 建立自由旅程組合器

**Files:**
- Create: `src/features/itinerary/ItineraryPage.tsx`, `src/features/itinerary/ItineraryItem.tsx`, `src/features/itinerary/itinerary.css`, `src/features/itinerary/itinerary.test.tsx`
- Modify: `src/app/router.tsx`, `src/domain/itinerary.ts`

**Interfaces:**
- `Itinerary` has `id`, `date`, `budget`, `interests`, `items`, `updatedAt`; items are discriminated `experience` or `freeActivity` with stable IDs, start/end times and optional `sessionId`.
- Domain functions: `addExperienceToItinerary`, `addFreeActivity`, `removeItineraryItem`, `moveItineraryItem`, `getItinerarySummary`.

- [ ] **Step 1: Add tests for edit, ordering, conflict and budget calculations**

  Verify add/remove/reorder/save, overlap detection, exact boundary non-overlap, budget difference, self-created activities without session IDs, and canceled bookings clearly separated from itinerary drafts.

- [ ] **Step 2: Implement itinerary editor and date/budget/interests controls**

  Build list editing with move-up/down controls usable by keyboard and touch; create and remove free activities with a small form; save changes via store actions.

- [ ] **Step 3: Display time conflicts and cost summary**

  Show conflicting items with their time ranges; calculate experience spend and budget remainder; free activities do not add cost unless user explicitly enters one and never consume capacity.

- [ ] **Step 4: Verify itinerary behavior**

  Run `npm test -- --run src/features/itinerary/itinerary.test.tsx`; Playwright add two overlapping experiences, observe warning, reorder/remove one, save, reload and verify state; confirm no booking was created.

### Task 5: 建立青年工作台與業者營運後台

**Files:**
- Create: `src/features/youth/YouthDashboardPage.tsx`, `src/features/youth/TaskDetailPage.tsx`, `src/features/youth/youth.css`, `src/features/youth/youth.test.tsx`, `src/features/operator/OperatorDashboardPage.tsx`, `src/features/operator/ExperiencesAdminPage.tsx`, `src/features/operator/BookingsAdminPage.tsx`, `src/features/operator/TasksAdminPage.tsx`, `src/features/operator/operator.css`, `src/features/operator/operator.test.tsx`
- Modify: `src/app/router.tsx`, `src/components/RoleSwitcher.tsx`, `src/domain/youth.ts`, `src/domain/booking.ts`

**Interfaces:**
- Youth actions: `applyForTask(state, { taskId, youthId, now })`, `reviewApplication(state, { applicationId, decision, operatorId, now })`, `completeApplication(state, { applicationId, now })`.
- Operator booking actions call `confirmBooking` or shared `cancelBooking(... source: 'operator')`.
- Task capacity counts accepted, non-cancelled applications; completed applications count toward hours only when task is eligible and has a positive configured duration.

- [ ] **Step 1: Test both role views against the same store**

  Verify one youth application appears in operator review; approval/rejection/completion changes youth view; same youth cannot apply twice; capacity prevents over-acceptance; only eligible completed hours affect totals. Verify operator confirmation and cancellation update traveler booking history and seat count.

- [ ] **Step 2: Build youth task list and details**

  Show tasks by date/time, role, requirements, compensation, status and application action. Include accepted tasks, completed history and calculated mock pay/hours; omit restricted guide/transport/water activities.

- [ ] **Step 3: Build operator dashboard and experience/session management**

  Show demo metrics and collaboration outcomes. Provide forms to create/edit an experience and add sessions with capacity, date/time, meeting point and price. New experiences must appear in traveler exploration through the shared store.

- [ ] **Step 4: Build booking management and task scheduling/review**

  Provide reservation filtering, detail view, confirm/cancel with reason, applicant review and task form. Prevent accepting beyond task capacity and provide confirmation for destructive changes.

- [ ] **Step 5: Verify role-switch and operator/youth workflows**

  Run youth/operator tests. Playwright: switch to youth, apply once, verify duplicate blocked; switch operator, approve and complete; return youth and verify status/hours. Create a session and experience as operator, verify traveler sees it; confirm then cancel a seeded pending booking and verify cancellation reason/source plus capacity.

### Task 6: 建立地方資源共創到正式上架流程

**Files:**
- Create: `src/features/cocreation/CocreationPage.tsx`, `src/features/cocreation/ResourceForm.tsx`, `src/features/cocreation/DraftEditor.tsx`, `src/features/cocreation/PilotFeedback.tsx`, `src/features/cocreation/cocreation.css`, `src/features/cocreation/cocreation.test.tsx`
- Modify: `src/app/router.tsx`, `src/domain/cocreation.ts`, `src/features/operator/OperatorDashboardPage.tsx`

**Interfaces:**
- `Resource`: unique ID and one resource type; `ExperienceDraft` references `resourceIds`; pilot records and feedback reference `draftId`; change logs reference the draft and actor.
- `publishDraft(state, { draftId, operatorId, now }): Result<{ state: AppState; experienceId: ExperienceId }>` creates a new public experience with `sourceDraftId` and never exposes earlier draft/pilot records.

- [ ] **Step 1: Add provenance and lifecycle tests**

  Verify each transition in order; reject publish before feedback evaluation; reject duplicate publish; assert final experience ID differs from draft ID and `sourceDraftId` matches; assert resource, pilot, feedback and change-log records remain queryable from the final experience.

- [ ] **Step 2: Build resource inventory and draft editor**

  Support all eight resource categories, description, partner and availability fields. Create a draft linked to selected resources and record each edit in the change log.

- [ ] **Step 3: Build pilot session and feedback review**

  Create clearly labeled pilot sessions that are not general bookable sessions. Add mock feedback form and assessment view; preserve submitted feedback and revision notes.

- [ ] **Step 4: Publish and verify traveler integration**

  Enable publish only at the evaluated stage. Create a new formal experience with source draft ID; show traceability timeline; ensure it appears in traveler exploration only after publishing and that its formal sessions can be booked.

- [ ] **Step 5: Verify the end-to-end co-creation flow**

  Run `npm test -- --run src/features/cocreation/cocreation.test.tsx`; Playwright complete resource → draft → pilot → feedback → publish, verify provenance and traveler listing.

### Task 7: 完成重置保護、主要角色驗收與桌面/手機檢查

**Files:**
- Create: `src/features/demo/ResetDemoData.tsx`, `src/e2e/traveler.spec.ts`, `src/e2e/youth-operator.spec.ts`, `src/e2e/cocreation.spec.ts`, `docs/acceptance/valley-freedom-checklist.md`
- Modify: `src/components/BrandShell.tsx`, `playwright.config.ts`, `README.md`

- [ ] **Step 1: Add reset confirmation and explanatory prototype notices**

  Add a two-step confirmation dialog before resetting canonical storage; display that data is local to this browser and cross-tab display sync does not ensure concurrent transaction safety.

- [ ] **Step 2: Add role-flow end-to-end checks**

  Use Playwright to cover traveler discovery/booking/cancellation, youth application/operator approval/completion, operator experience/session publication, and complete co-creation provenance. Include mobile (390px) and desktop (1440px) viewport runs and assert no horizontal page overflow.

- [ ] **Step 3: Write a human-readable acceptance checklist**

  List each of the seven spec acceptance outcomes and record a pass/fail box with the evidence/route used. Include storage reset and the explicitly limited concurrency guarantee.

- [ ] **Step 4: Run all requested verification**

  Run `npm run typecheck`, `npm test -- --run`, `npm run build`, and `npm run test:e2e`. Fix failures before marking checklist items passed. Review mobile and desktop screenshots for clipped copy, weak contrast, accidental inner scrollbars, focus states and role-navigation usability.

- [ ] **Step 5: Document local start and prototype limits**

  Update `README.md` with install/start commands, role-switching guide, demo workflows, reset behavior, LocalStorage scope, test commands and the absence of real booking/payment/API synchronization.

## Plan Self-Review

- Spec coverage: Tasks 1–7 cover responsive navigation/brand system, 8+ mock experiences, discovery/detail/booking, itinerary, youth operations, operator CRUD and booking management, full co-creation lifecycle/provenance, unique IDs, local persistence, cross-tab display updates, reset confirmation, error/empty states, accessibility, and role-flow verification.
- Placeholder scan: No TODO/TBD or vague “handle edge cases” actions remain; each flow names expected behavior and verification.
- Type consistency: Task 2 defines `AppState`, `Result`, IDs, booking/youth/co-creation operations before consuming tasks. Later task signatures match the shared-state model and use `sourceDraftId` for formal provenance.
- Review focus tests: Capacity boundaries and concurrent-storage limitation are in Task 2; cancellation source/reason in Tasks 2–3/5; malformed storage in Task 2; duplicate/over-capacity task review in Tasks 2/5; duplicate publication and traceability in Tasks 2/6.
