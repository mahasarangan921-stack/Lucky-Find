import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import NumberFinder from './pages/NumberFinder'
import ResultDetail from './pages/ResultDetail'
import HistoricalExplorer from './pages/HistoricalExplorer'
import Announcements from './pages/Announcements'
import Calendar from './pages/Calendar'
import Statistics from './pages/Statistics'
import NotFound from './pages/NotFound'
import { LotteryDataProvider } from './data/LotteryDataContext'

export default function App() {
  return (
    <LotteryDataProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/finder" element={<NumberFinder />} />
            <Route path="/result/:id" element={<ResultDetail />} />
            <Route path="/history" element={<HistoricalExplorer />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <div className="lf-grain" />  
      </div>
    </LotteryDataProvider>
  )
}
