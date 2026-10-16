# 縱谷自由行動所功能驗收清單

## 已驗證

- [x] 旅客可探索至少 8 種示意體驗，使用類別、日期、價格、時長、關鍵字及有名額篩選；開啟詳情、選場次與人數、送出預約並查看狀態。證據：`src/features/traveler/traveler.test.tsx`、`e2e/traveler.spec.ts`。
- [x] 待確認/已確認預約占位；超額、重複取消、取消已完成單與無原因取消被拒絕；取消保留原因與旅客/業者來源並釋出名額。證據：`src/domain/booking.test.ts`、旅客和業者測試。
- [x] 業者確認訂單會更新旅客共用狀態；旅客預約與業者操作共用同一資料模型。證據：`src/features/operator/operator.test.tsx`、`e2e/youth-operator.spec.ts`。
- [x] 行程可以新增體驗及自訂活動、移除、排序、儲存、設定日期/預算/興趣/可用時間、檢視費用差額與衝突；加入行程不建立預約，自訂活動不占場次名額。證據：`src/domain/itinerary.test.ts`、`src/features/itinerary/itinerary.test.tsx`。
- [x] 青年不可重複申請；業者可審核、錄取、拒絕與完成；取消申請保留狀態；只計入符合條件之已完成工時。證據：`src/domain/youth.test.ts`、`e2e/youth-operator.spec.ts`。
- [x] 共創支援資源盤點、草案、試辦、回饋、修改與正式上架；草案/試辦不進公開體驗；正式體驗 ID 與來源草案 ID 不同且可追溯。證據：`src/domain/cocreation.test.ts`、`src/features/cocreation/cocreation.test.tsx`、`e2e/cocreation.spec.ts`。
- [x] LocalStorage 持久化、跨頁讀取、`storage` 事件分頁畫面同步、錯誤資料恢復及二次確認重置入口。證據：`src/store/appStore.test.ts`。
- [x] Playwright 在桌面及手機 Chrome 驗證旅客預約取消、青年申請/業者審核、共創上架與核心路由寬度。

## 原型限制

- [x] 不宣稱具備跨分頁並行交易保證或多人即時同步。
- [x] 不串接真實帳號、金流、地圖 API 或資料庫。
- [x] 所有體驗、價格、任務報酬與營運統計均為示意資料。

## 驗證命令

- `npm run typecheck`
- `npm test -- --run`
- `npm run build`
- `npm run test:e2e`
