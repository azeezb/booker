import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Landing from './pages/Landing'
import Browse from './pages/Browse'
import BrowseClubDetail from './pages/BrowseClubDetail'
import Home from './pages/Home'
import Clubs from './pages/Clubs'
import ClubDetail from './pages/ClubDetail'
import Books from './pages/Books'
import Account from './pages/Account'
import Settings from './pages/Settings'

function App() {
  const { logout } = useAuth0()

  useEffect(() => {
    const handler = () => logout({ logoutParams: { returnTo: window.location.origin } })
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [logout])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/browse/:id" element={<BrowseClubDetail />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/books" element={<Books />} />
          <Route path="/account" element={<Account />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
