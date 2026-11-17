# Valley Freedom 預約與分潤 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修復首頁與地圖版面，並以使用者表格的精確計價與 Shapley 算法，統一旅客、旅伴、業者及管理員的預約與收益資料。

**Architecture:** 在 domain 層新增唯一的半日／全日報價與分潤計算器，讓預約建立時保存不可變計算快照；用 AppState 遷移承接既有 localStorage 資料。接著更新地圖路線選擇、旅客預約、青年服務工作台、業者訂單及管理員試算頁，最後修正首頁顯示與各流程的響應式 modal。

**Tech Stack:** React、TypeScript、React Router、既有 AppState/localStorage、Vite、現有 CSS 與 Lucide React。

**Spec:** [docs/superpowers/specs/2026-11-18-valley-freedom-booking-revenue-design.md](../specs/2026-11-18-valley-freedom-booking-revenue-design.md)

## Global Constraints

- 所有旅伴預約改為半日／全日每人計價，不保留原有按小時計價作為預約方式。
- 半日為 4 小時，基本價格 NT$1,000／人；全日為 8 小時，基本價格 NT$1,800／人。
- 平台分配訂單總收入 20%；青年和業者用 Shapley Value 依表格的個別價值與供給池計算分配。
- 青年價值使用表格基準：NT$245／小時（已含雇主負擔），另計 1 小時準備／交通；業者價值基準為 NT$430／人。
- 分配金額採四捨五入至偶數；六列標準情境的青年、業者、平台、供給池、個別價值合計和百分比必須符合核准規格表。
- 金流 2.8%、保險 NT$50／人、每月固定營運成本 NT$9,500，均屬平台營運成本，不得再次扣除 80% 供給池。
- 已建立訂單保存建立當下報價與分潤快照；調整假設只影響新訂單。
- 目前仍是瀏覽器端展示原型；不新增實際金流、身分查核、即時媒合或後端權限。
- 照片、合作狀態、訓練資料與金額若屬示意，仍需明確標示，不得呈現成已查核的真實服務。
- 預約 modal 使用固定 footer 讓總價與主要 CTA 永遠可見；響應式版面不得有非預期水平溢出、文字裁切或遮住主要操作的裝飾。
- 尊重 `prefers-reduced-motion`；地圖四條路線是第一層，場域只在選路後呈現。

## Review Focus

- 四捨五入遇到 `.5`、供給池奇數或可分配值為負時，結果須可重現且不超出供給池；由 Task 1 檢視標準情境和邊界輸入。
- 舊 localStorage 缺少新訂單欄位或 schema version 時，讀取不得崩潰或把時薪當成套裝價；由 Task 2 檢視遷移與舊單顯示。
- 預約 modal 在低視窗高度、手機鍵盤開啟及長需求文字下仍能看到價格與送出按鈕；由 Task 4 檢視。
- 地圖在桌面、窄版和無 GeoJSON 時仍能辨識四路線、所選路線及候選場域；由 Task 3 檢視。
- 長姓名、長地名、超過六人的自訂人數、無候選青年或合作體驗空清單下，角色頁仍清楚給出狀態與下一步；由 Tasks 4–7 檢視。

## 檔案責任地圖

- `src/domain/revenueShare.ts`（新增）：固定價格、基準假設、ties-to-even 整數分配、成本與月淨額計算的純函式來源。
- `src/domain/types.ts`, `src/domain/fixtures.ts`, `src/store/AppStateProvider.tsx`：訂單快照、管理端假設、合作服務資料及 schema 遷移。
- `src/domain/companions.ts`, `src/store/appStore.ts`：建立旅伴服務需求時驗證體驗、日期、人數和青年，並保存同一報價快照。
- `src/features/companions/CompanionSearchPage.tsx`, `CompanionRequestsPage.tsx`, `CompanionPage.tsx`：旅客預約、需求列表及青年服務回覆。
- `src/features/explore/RouteMapPage.tsx`, `src/features/explore/mapGeometry.ts`：路線層級選擇、路線所屬標記和地圖資料呈現。
- `src/features/operator/OperatorPage.tsx`, `OperatorShopProfile.tsx`, `src/features/admin/AdminOverviewPage.tsx`, `PartnerGrowthPage.tsx`, `src/features/traveler/TravelerPages.tsx`, `src/features/itinerary/ItineraryPage.tsx`：業者、管理員、旅客訂單及行程金額顯示。
- `src/features/traveler/HomePage.tsx`, `src/components/motion/useHomeSectionReveals.ts`：首頁內容在 GSAP/ScrollTrigger 失效時保持可見。
- `src/styles/travel.css`, `travel-overrides.css`, `responsive.css`, `home.css`, `src/styles/editorial-rebuild.css`：田野筆記視覺、modal footer、地圖等高面板和各尺寸排版。

---

### Task 1: 建立可精確重現圖表的純計算器

**Files:**
- Create: `src/domain/revenueShare.ts`
- Inspect: `src/domain/types.ts`, `src/domain/fixtures.ts`

**Interfaces:**
- Produces `calculateBookingRevenue(input: { duration: 'half-day' | 'full-day'; partySize: number; assumptions?: RevenueAssumptions }): RevenueSnapshot`。
- Produces `calculateMonthlyPlatformNet(orders: RevenueSnapshot[], assumptions: RevenueAssumptions): MonthlyPlatformSummary`。
- 預設假設包含青年負擔後時薪 245、準備交通 1 小時、業者基準 430／人、平台率 0.2、金流率 0.028、保險 50／人及月固定成本 9500。

- [ ] 定義 `RevenueAssumptions`、`RevenueSnapshot`、錯誤型別及可輸出欄位：服務時數、單價、總額、`vY`、`vB`、Shapley 兩方整數分配、平台收入、供給池、成本和分配百分比。
- [ ] 實作半日/全日單價、gross、20/80 split 與兩方 Shapley 公式；`.5` 使用 ties-to-even，並以第二方分配額作為供給池減第一方分配額，保證整數合計。
- [ ] 加入參數域驗證；當價值輸入不能形成非負且不超過供給池的分配時回傳可顯示錯誤，不做隱性 fallback。
- [ ] 以六個規格表案例逐列人工核算輸出，確認 982/618/400、1352/1848/800、1722/3078/1200、2112/768/720、3122/2638/1440、4132/4508/2160 與所有表列百分比一致。
- [ ] 計算月淨額為各筆平台收入減 2.8% 金流、每人 NT$50 保險，再減 NT$9,500 固定費；不從供給池扣成本。

### Task 2: 訂單資料快照與本機資料遷移

**Files:**
- Modify: `src/domain/types.ts`, `src/domain/fixtures.ts`, `src/store/AppStateProvider.tsx`
- Inspect/modify: `src/store/appStore.ts`

**Interfaces:**
- `ServiceRequest` stores selected experience/operator references and optional legacy marker plus immutable `RevenueSnapshot`.
- `AppState` stores versioned `revenueAssumptions` for new preview bookings.
- Existing `ServiceRequest.price` stays available as the guest-facing total for selectors that still consume it; new requests derive it from snapshot gross.

- [ ] 將 `AppState.schemaVersion` 提升至 5，新增 revenue assumptions 與 ServiceRequest 體驗/業者關聯及報價快照欄位。
- [ ] 新增遷移：既有 state 的旅伴舊需求標記為 legacy estimate，保留既有資料但不偽裝成半日/全日單價；缺少新增欄位時提供安全預設值。
- [ ] 更新 fixtures，提供明確標示為展示合作的體驗/業者關聯及不重複大頭照素材；未確認候選店家不可進入預約選單。
- [ ] 確保保存、重新載入和角色切換沿用既有 localStorage/state 流程，歷史 snapshot 不隨 assumptions 修改而改變。

### Task 3: 修正地圖的路線第一層與尺寸

**Files:**
- Modify: `src/features/explore/RouteMapPage.tsx`, `src/features/explore/mapGeometry.ts`
- Modify: `src/styles/travel.css`, `src/styles/travel-overrides.css`, `src/styles/responsive.css`

- [ ] 建立四個具名路線選擇：太魯閣、台 11 海岸、台 9 縱谷、南迴；預設聚焦一條，地點及地圖標記依路線資料過濾。
- [ ] 移除跨路線全域距離群聚造成的碎片觀感；路線層級以清晰圖例/線型呈現，選擇路線後才顯示該路線場域標記與列表。
- [ ] 保留位置已核對、未核對、示意集章及來源連結語意；路線只作探索分類，不畫成行政區邊界或保證導航。
- [ ] 桌面地圖限定視窗高度，右側資訊面板與地圖等高並讓內容在面板內可捲動；手機自然改成路線、地圖、詳情順序且不出現雙重滾輪。
- [ ] 確認地圖資料載入失敗時，路線卡及候選場域清單仍能正常操作。

### Task 4: 旅客半日／全日預約流程與可見提交操作

**Files:**
- Modify: `src/features/companions/CompanionSearchPage.tsx`, `src/domain/companions.ts`, `src/domain/types.ts`
- Modify: `src/styles/travel.css`, `src/styles/travel-overrides.css`, `src/styles/responsive.css`

**Interfaces:**
- 搜尋資料使用 route/service, date, duration kind, start time, party size, language 及 service needs；持續使用既有 `matchingCompanions` 和 request state transitions。
- `createServiceRequest` 收到體驗/業者關聯與管理端假設，並呼叫 Task 1 計算器；不再使用時薪估價計算預約價格。

- [ ] 將搜尋步驟重排為路線/合作體驗、日期、半日或全日、人數、時間與需求；半日固定 4 小時，全日固定 8 小時。
- [ ] 結果卡以每人 NT$1,000/NT$1,800 和總價為主，不再把時薪當旅客預約費；人物大頭照素材彼此不重複，展示身份聲明維持可見。
- [ ] 選定旅伴後以 shared calculator 顯示人數、時數、體驗業者、每人價格、總價及狀態；需求送出保存完整 snapshot。
- [ ] 移除時薪估價與舊折抵對新訂單總價的錯誤混算；若展示折抵仍保留，須明確區隔於表格基準且不得改寫 gross/share snapshot。
- [ ] 將預約 modal 改為 viewport 受限面板、可讀內容區、sticky footer；桌面低高度與手機鍵盤下總價及送出按鈕保持可見。
- [ ] 以手動互動檢視空結果、必填欄位錯誤、超長需求、關閉/返回與送出後狀態。

### Task 5: 旅伴／青年端依同一訂單快照處理需求

**Files:**
- Modify: `src/features/companions/CompanionPage.tsx`, `CompanionRequestsPage.tsx`
- Modify: `src/features/youth/YouthPage.tsx`, `src/features/youth/*` where service request summaries appear
- Modify: `src/styles/travel.css`, `src/styles/travel-overrides.css`, `src/styles/responsive.css`

- [ ] 將需求按待回覆、已接受、待旅客確認、已排定、已完成、已取消分組，保留現有接受/婉拒/提案/確認/完成狀態轉移。
- [ ] 每筆需求顯示路線、體驗/業者、日期、4/8 小時、人數、服務需求及 snapshot 的青年分配額；舊需求明確標記舊版示意估價。
- [ ] 將青年任務工資與旅伴服務分潤分欄顯示，不把兩種收入混在一起。
- [ ] 手動檢視長需求、無待辦、已完成和被取消狀態的卡片與窄版操作順序。

### Task 6: 業者訂單與管理員分潤試算

**Files:**
- Modify: `src/features/operator/OperatorPage.tsx`, `src/features/operator/OperatorShopProfile.tsx`
- Modify: `src/features/admin/AdminOverviewPage.tsx`, `src/features/operator/PartnerGrowthPage.tsx`
- Modify: `src/domain/types.ts`, `src/store/appStore.ts`
- Modify: `src/styles/travel.css`, `src/styles/travel-overrides.css`, `src/styles/responsive.css`

- [ ] 業者端只呈現自身關聯訂單：日期、場域服務、人數、總額、平台分配、青年分配及業者 snapshot 分配；不得顯示他店資料或青年個人薪資假設。
- [ ] 管理員端呈現六個基準情境及逐項公式來源，輸入青年負擔後時薪/雇主負擔率、準備交通時間、業者參考價、比例及平台成本後即時計算。
- [ ] 管理員每月摘要分開顯示 gross、平台收入、金流、保險、固定成本、平台淨額和各方分配；錯誤參數須說明待調整欄位。
- [ ] 管理員調整 assumptions 只保存為新訂單預設，既有 snapshot 維持原數值；所有畫面標明本機展示原型與未實際款項移轉。
- [ ] 手動逐列核對六案例數值，並操作調整參數、回復預設與超窄版檢視。

### Task 7: 旅客行程、預約紀錄及所有 modal 顯示同一報價

**Files:**
- Modify: `src/features/traveler/TravelerPages.tsx`, `src/features/itinerary/ItineraryPage.tsx`
- Modify: modal components/usage in `src/components/Feedback.tsx` and request pages as needed
- Modify: `src/styles/travel.css`, `src/styles/travel-overrides.css`, `src/styles/responsive.css`

- [ ] 旅客需求廣場、預約紀錄及行程時間軸從 `ServiceRequest` snapshot 顯示同一價格、人數、半/全日及狀態。
- [ ] 確認折抵、取消、旅伴提案與旅客確認頁面不會自行重算或覆蓋原始分潤快照；旅客端不洩漏供應方收入明細。
- [ ] 統一 modal 標題、關閉、焦點、錯誤和操作層；預約主要 CTA 保持明顯且可鍵盤操作。
- [ ] 手動操作建立需求、接受、確認、取消與行程呈現，並檢視超長內容與手機視窗高度。

### Task 8: 首頁滾動空白與跨頁視覺收斂

**Files:**
- Modify: `src/features/traveler/HomePage.tsx`, `src/components/motion/useHomeSectionReveals.ts`
- Modify: `src/styles/home.css`, `src/styles/editorial-rebuild.css`, `src/styles/responsive.css`

- [ ] 確保 GSAP/ScrollTrigger 初始化之前、失敗時、瀏覽器返回及 `prefers-reduced-motion` 下首頁所有正文保持可見；進場效果不再讓主要章節卡在 `autoAlpha: 0`。
- [ ] 以紙格、路線邊註、照片圖錄與定位 metadata 統一各頁編輯式風格，優先確保字體對比與互動可理解。
- [ ] 統一 modal 的 paper/receipt 層級、尺寸、焦點與動態，桌面和手機不遮住內容或主要操作。
- [ ] 手動檢視首頁從頂部到頁尾、快速捲動、前進/返回、動畫關閉及首頁主要 CTA。

### Task 9: 建置與全路由人工驗收、部署

**Files:**
- Inspect: `src/app/App.tsx`, `vercel.json`, all changed route components and styles
- Modify only if a verified defect is found.

- [ ] 執行正式 production build，修復 TypeScript、lint/build 或 bundling 錯誤；不新增或執行自動化測試。
- [ ] 以 320、375、768、1024、1440 px 檢視首頁、`/explore/map`、`/companions`、`/companions/requests`、`/itinerary`、`/bookings`、`/operator` 及 `/admin/growth`，確認無裁字、溢出、空白或被遮操作。
- [ ] 直接重新整理上述路由並確認 SPA fallback、展示登入角色流程及 modal 關閉/送出都可用。
- [ ] 核對六個 Shapley 情境、平台成本公式及修改 assumptions 前後的訂單快照不變。
- [ ] 將核准變更提交並推送到已授權的 `valley-freedom` GitHub repository，等待 Vercel production deployment ready 後匿名檢查主要路由 HTTP 200。

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 cover exact business math and immutable/migrated order data; Task 3 covers four route regions/map height; Task 4 covers traveler booking and persistent CTA; Task 5 covers companion/youth; Task 6 covers operator/admin plus monthly net; Task 7 covers itinerary, requests and modal consistency; Task 8 covers homepage blank area and editorial/motion direction; Task 9 covers responsive/browser/build/deployment criteria.
- **Placeholder scan:** Every task names concrete files, interactions, constraints, and numerical reference outputs; no TBD or deferred implementation work remains.
- **Type consistency:** `calculateBookingRevenue` returns the reusable immutable `RevenueSnapshot`; service requests store it and every role reads it. Legacy requests remain marked and do not enter new pricing math.
- **Review Focus coverage:** Rounding/invalid values in Task 1; persisted legacy schema in Task 2; route fallback in Task 3; modal low-height/keyboard in Task 4; long and empty request states in Task 5; admin assumption edits in Task 6; status transitions and booking snapshots in Task 7; scroll/reduced-motion in Task 8.
