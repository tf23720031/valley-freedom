import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

function NotFound() { return <section className="empty-page"><span className="eyebrow">頁面不存在</span><h1>這段路還沒有安排。</h1><a className="button button-primary" href="/">回到首頁</a></section> }
export function App() {
  return <AppStateProvider><FeedbackProvider><BrowserRouter><Routes><Route element={<BrandShell />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/experiences" element={<ExplorePage />} />
    <Route path="/experiences/:experienceId" element={<ExperienceDetailPage />} />
    <Route path="/companions" element={<CompanionSearchPage />} />
    <Route path="/explore" element={<RegionalExplorePage />} />
    <Route path="/explore/:regionId" element={<RegionalExplorePage />} />
    <Route path="/places/:placeId" element={<RegionalExplorePage />} />
    <Route path="/companion" element={<CompanionPage />} />
    <Route path="/itinerary" element={<ItineraryPage />} />
    <Route path="/bookings" element={<BookingsPage />} />
    <Route path="/muri-sunshine" element={<MuriSunshinePage />} />
    <Route path="/youth" element={<CompanionPage />} />
    <Route path="/youth/tasks/:taskId" element={<CompanionPage />} />
    <Route path="/operator" element={<OperatorPage />} />
    <Route path="/operator/experiences" element={<OperatorPage />} />
    <Route path="/operator/bookings" element={<OperatorPage />} />
    <Route path="/operator/tasks" element={<OperatorPage />} />
    <Route path="/co-create" element={<CocreationPage />} />
    <Route path="*" element={<NotFound />} />
  </Route></Routes></BrowserRouter></FeedbackProvider></AppStateProvider>
}
