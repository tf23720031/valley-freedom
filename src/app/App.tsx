import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppStateProvider } from '../store/AppStateProvider'
import { FeedbackProvider } from '../components/Feedback'
import { BrandShell } from '../components/BrandShell'
import { HomePage } from '../features/traveler/HomePage'
import { ExplorePage, ExperienceDetailPage, BookingsPage, MuriSunshinePage } from '../features/traveler/TravelerPages'
import { ItineraryPage } from '../features/itinerary/ItineraryPage'
import { OperatorPage } from '../features/operator/OperatorPage'
import { CocreationPage } from '../features/cocreation/CocreationPage'
import { CompanionSearchPage } from '../features/companions/CompanionSearchPage'
import { CompanionPage } from '../features/companions/CompanionPage'
import { RegionalExplorePage } from '../features/explore/RegionalExplorePage'
import { RouteMapPage } from '../features/explore/RouteMapPage'
import { PartnerGrowthPage } from '../features/operator/PartnerGrowthPage'
import { useAppState } from '../store/AppStateProvider'
import { LoginPage } from '../features/auth/LoginPage'
import { CompanionRequestsPage } from '../features/companions/CompanionRequestsPage'
import { AdminOverviewPage } from '../features/admin/AdminOverviewPage'
import { YouthPage } from '../features/youth/YouthPage'

function NotFound() { return <section className="empty-page"><span className="eyebrow">頁面不存在</span><h1>這段路還沒有安排。</h1><a className="button button-primary" href="/">回到首頁</a></section> }
function RequireLogin({ children }: { children: React.ReactNode }) { const state = useAppState(), location = useLocation(); return state.authenticated ? children : <Navigate to="/login" replace state={{ from: location }} /> }
function AdminGrowthRoute() { return useAppState().role === 'admin' ? <PartnerGrowthPage /> : <Navigate to="/dashboard" replace /> }
function RoleDashboard() { const role = useAppState().role; return <Navigate to={role === 'traveler' ? '/itinerary' : role === 'companion' ? '/companion' : role === 'operator' ? '/operator' : '/admin'} replace /> }
export function App() {
  return <AppStateProvider><FeedbackProvider><BrowserRouter><Routes><Route element={<BrandShell />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/experiences" element={<ExplorePage />} />
    <Route path="/experiences/:experienceId" element={<ExperienceDetailPage />} />
    <Route path="/companions" element={<CompanionSearchPage />} />
    <Route path="/explore" element={<RegionalExplorePage />} />
    <Route path="/explore/map" element={<RouteMapPage />} />
    <Route path="/explore/:regionId" element={<RegionalExplorePage />} />
    <Route path="/places/:placeId" element={<RegionalExplorePage />} />
    <Route path="/dashboard" element={<RequireLogin><RoleDashboard /></RequireLogin>} />
    <Route path="/companion" element={<RequireLogin><CompanionPage /></RequireLogin>} />
    <Route path="/companions/requests" element={<RequireLogin><CompanionRequestsPage /></RequireLogin>} />
    <Route path="/itinerary" element={<RequireLogin><ItineraryPage /></RequireLogin>} />
    <Route path="/bookings" element={<RequireLogin><BookingsPage /></RequireLogin>} />
    <Route path="/muri-sunshine" element={<MuriSunshinePage />} />
    <Route path="/youth" element={<RequireLogin><YouthPage /></RequireLogin>} />
    <Route path="/youth/tasks/:taskId" element={<RequireLogin><YouthPage /></RequireLogin>} />
    <Route path="/operator" element={<RequireLogin><OperatorPage /></RequireLogin>} />
    <Route path="/operator/experiences" element={<RequireLogin><OperatorPage /></RequireLogin>} />
    <Route path="/operator/bookings" element={<RequireLogin><OperatorPage /></RequireLogin>} />
    <Route path="/operator/tasks" element={<RequireLogin><OperatorPage /></RequireLogin>} />
    <Route path="/operator/shop" element={<RequireLogin><OperatorPage /></RequireLogin>} />
    <Route path="/admin" element={<RequireLogin><AdminOverviewPage /></RequireLogin>} />
    <Route path="/admin/growth" element={<RequireLogin><AdminGrowthRoute /></RequireLogin>} />
    <Route path="/operator/growth" element={<RequireLogin><AdminGrowthRoute /></RequireLogin>} />
    <Route path="/co-create" element={<RequireLogin><CocreationPage /></RequireLogin>} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter></FeedbackProvider></AppStateProvider>
}
