import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import Feed from './pages/Feed'
import CreatePost from './pages/CreatePost'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Search from './pages/Search'
import DesktopSidebar from './components/layout/DesktopSidebar'
import DesktopRightPanel from './components/layout/DesktopRightPanel'

/** Auth pages: centered, mobile-width, no sidebar */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0D17] flex justify-center">
      <div className="w-full max-w-[430px] relative">
        {children}
      </div>
    </div>
  )
}

/** App pages: sidebar (md+) + center feed + right panel (lg+) */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F0D17] flex">
      <DesktopSidebar />
      <main className="flex-1 flex justify-center min-w-0 md:border-x md:border-white/5">
        <div className="w-full md:max-w-[600px]">
          {children}
        </div>
      </main>
      <DesktopRightPanel />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/"              element={<AuthShell><Login /></AuthShell>} />
          <Route path="/register"      element={<AuthShell><Register /></AuthShell>} />
          <Route path="/verify"        element={<AuthShell><Verify /></AuthShell>} />
          <Route path="/feed"          element={<AppShell><Feed /></AppShell>} />
          <Route path="/create"        element={<AppShell><CreatePost /></AppShell>} />
          <Route path="/profile"       element={<AppShell><Profile /></AppShell>} />
          <Route path="/notifications" element={<AppShell><Notifications /></AppShell>} />
          <Route path="/search"        element={<AppShell><Search /></AppShell>} />
          <Route path="/saved"         element={<AppShell><Feed /></AppShell>} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
