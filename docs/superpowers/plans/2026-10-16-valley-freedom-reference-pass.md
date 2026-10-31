
## Phase 1B — TANICA / e-CHUBU / Shirahone / AIM Reference Pass

**Source of truth:** `docs/superpowers/specs/2026-10-16-valley-freedom-design.md` (second-round reference findings and acceptance).

### Files and responsibilities

- `src/features/traveler/HomePage.tsx`, `src/styles/home.css`: hero photo carousel and type strip; TANICA asymmetric journey collage; two-column route directory; Shirahone-style experience list; AIM-style companion feature; photo-backed CTA footer.
- `src/components/motion/useHomeScrollStory.ts`: remove/replace the old homepage arc pin behavior where it conflicts with route rows; keep reversible, scoped scroll effects and cleanup.
- `public/photos/*`: only newly authored/owned local imagery; transparent generated cutout companion figures if generation succeeds.
- `src/features/traveler/home.test.tsx`, existing E2E suites: semantic content, route continuity, functional controls and responsive behavior.
- Existing route components, domain data and store remain the source of truth; no route or workflow deletion.

### Phase 1 — Update specification and plan

- [x] Record direct visual references, superseded homepage treatments, originality rules and four-size acceptance before code edits.

### Phase 2 — Hero and TANICA journey collage

- [x] Add failing tests for slide controls, key CTA routes, concise hero copy and the journey collage.
- [x] Build responsive photo carousel with low-distraction overlay; reserve image aspect ratio and handle missing image fallback.
- [x] Add independent journey collage: one dominant local image, vertical desktop copy, offset supporting image; recompose naturally for phones.
- [x] Limit GSAP to reversible image scale/translation and distinct parallax; disable pin on narrow/reduced-motion settings.
- [x] Verify screenshot and tests before moving to directory sections.

### Phase 3 — Shirahone directory sections

- [x] Replace arc gallery with four route rows (image, region, short route note, suggested travel time, real link).
- [x] Replace equal experience tiles with information-rich editorial rows, using clearly labeled illustrative time and price fields.
- [x] Verify all four region links and experience detail links.

### Phase 4 — AIM companion composition and e-CHUBU ending

- [x] Generate original transparent travel companion cutout imagery, copy into local public assets and verify alpha transparency/visual crop.
- [x] Create the pale/angled editorial companion section with one dominant cutout and legible service information, preserving companion search handoff.
- [x] Replace final CTA with full-bleed original landscape and three asymmetrical route/itinerary/companion action panels; keep global navigation/footer links.

### Phase 5 — Content, accessibility, responsive and motion pass

- [x] Check mock/verified labels, copy repetition, focal image crops and info completeness.
- [x] Verify keyboard carousel controls, reduced motion, reverse scroll, image stability and mobile natural flow.
- [x] Inspect 1440×900, 1920×1080, 390×844, 430×932 and fix overflow/clipping.

### Phase 6 — Regression and full validation

- [x] Run typecheck, existing unit suite, production build and existing Playwright E2E suite; resolve failures without deleting prior functionality.
- [x] Visit core routes and exercise itinerary gap-to-companion search, booking and relevant workbench flows.

### Phase 7 — Publish existing public Site

- [x] Confirm the same Site identity and public audience.
- [ ] Push/package the verified current source; save/deploy a new version to the existing project.
- [ ] Reopen the live URL and verify the deployed homepage and companion route.

# Homepage correction pass checklist

- [x] Reproduce multi-person companion and non-forest marquee regressions in focused tests.
- [x] Separate the hero/footer outlined type bands from image clipping contexts.
- [x] Fix collage title/body/image overlap at desktop and mobile breakpoints.
- [x] Reduce companion section to one upper-body cutout.
- [x] Pin the site navigation at the viewport top on every breakpoint.
- [x] Align footer action panel colors to the forest-based palette.
- [x] Run existing tests, typecheck, production build, and responsive browser checks.
- [ ] Publish the verified update to the existing public site.

Browser captures were reviewed at 1440×900, 1920×1080, 390×844, and 430×932. All four rendered without horizontal overflow; the 390/430 hero copy-to-action gaps measured 27px/34px. The actual sticky header, desktop collage, mobile collage, forest marquee, single upper-body companion, and footer ticker/panels were visually checked.

Verification: 19/19 unit test files (46/46 tests), TypeScript check, production build, and 18/18 Playwright E2E tests passed.

## Phase 1C — 2026-10-17 首頁 Hero / Marquee / 拼貼校正

### 執行順序

1. 更新規格與計畫（完成後直接進入實作，不再逐階段等待確認）。
2. 先更新首頁回歸測試，鎖定「東岸一季」、雙字帶自動 marquee、五列中段 scrub、拼貼對齊與無標點標題；確認測試先失敗。
3. 製作新海岸 Hero 圖片並加入原創本地素材；調整 Hero 排版與按鈕/輪播控制間距。
4. Hero 與 footer 字帶改為反覆循環 CSS marquee；中段調整為五列且較小字體，保留 ScrollTrigger scrub 和反向控制。
5. 重新設計藍綠色彩變數與首頁各區色彩，修正行程拼貼的對齊、小圖尺寸、旅伴背景。
6. 以桌機和手機截圖檢查版面、溢出、文字層級與動效；處理 reduced-motion。
7. 執行完整既有 Vitest、typecheck、build、Playwright E2E；修正回歸後保存並部署新版本到既有公開 Site。

### 本輪驗收清單

- [x] Hero 顯示「東岸一季」，標題/CTA/控制器不重疊；用原創高解析東海岸照片。
- [x] Hero、footer marquee 使用連續 CSS 動畫且英文字描邊與中文字視覺高度接近。
- [x] 中段使用五行較小字體、深藍綠視覺層次，GSAP 滾輪 scrub 可反向。
- [x] 旅程標題上緣與主照片對齊；右下小照片加寬、下移且不超出視窗。
- [x] 旅伴區背景使用深藍綠，文字對比足夠。
- [x] 首頁可見標題不含標點；所有原路由與行程空檔找旅伴入口維持。
- [x] 1440×900、1920×1080、390×844、430×932 響應式檢查通過，reduced motion 有靜態備援。
- [x] 完整 Vitest、typecheck、build、Playwright E2E 全數通過。
- [x] 推送來源並部署到現有公開 Site；版本 9，正式網址仍為 https://valley-freedom.tf23720031.chatgpt.site。

## Phase 1D — 2026-10-17 全站藍綠色、跑馬燈與空檔版面修整

### 執行順序

1. [x] 更新規格：中段三列、字級不變、列間距加大；兩條自主字帶改 #466E77；全寬導覽與滿版 Hero；旅伴低對比文字提升；行程空白狀態有直接旅伴入口、低對比格線與圓形花東照片；全站色票一致。
2. [x] 先補首頁行數和空白行程直達旅伴的回歸測試。
3. [x] 移除兩條 marquee row 及其 ScrollTrigger 動畫，保留三列反向 scrub；調大列距但保留字級。
4. [x] 修整共用 token、全寬 navbar/hero 和字帶背景色；提升旅伴服務說明對比與字級。
5. [x] 為行程空白狀態加低透明格線、圓形地方照片與帶日期/時間/地區的直接搜尋連結；底色維持原淺色。
6. [x] 逐路由檢查功能價值、文字碰撞與 RWD，執行全套測試/build 並修正回歸。
7. [x] 更新既有正式 Site，確認公開頁面結果。

### 驗收清單

- [x] 首頁 scroll marquee 僅三列，字級維持原 token 設定，行距明顯加大且無跨列碰撞。
- [x] Hero 圖片滿版；navigation 寬度為 100%；兩條 CSS marquee 底色是 `#466E77`。
- [x] 旅伴介紹的區域/簡介文字在深藍綠底上可讀且比原版大。
- [x] 行程空白狀態顯示「這裡有空／要找旅伴嗎」，直接帶入日期、時間及地區搜尋；背景為低透明格線與三張圓形地方照片，淺底不變。
- [x] 所有主要路由色彩與分隔線對齊藍綠 token；桌機與手機不重疊、不產生水平溢出，原功能未退化。
- [x] Typecheck、unit、build、E2E 全部實跑通過。
- [x] 正式 Site 成功更新並確認公開頁面。

Phase 1D 最終驗證：19 個 Vitest 測試檔、48 個測試通過；Playwright 22/22 通過；`npm run typecheck` 與 `npm run build` 通過。首頁在正式 URL 已確認載入，主要路由及「行程空檔 → 旅伴搜尋」保留。Sites v11 部署成功，正式站維持公開。
