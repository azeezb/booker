import { useAuth0 } from '@auth0/auth0-react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const { logout } = useAuth0()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-stone-100 flex items-center justify-between">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-display text-2xl font-semibold tracking-wide text-stone-800"
      >
        <img src="/favicon.svg" alt="" className="w-6 h-6" />
        Booker
      </button>
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm font-sans"
      >
        <LogOut size={16} strokeWidth={1.5} />
        Sign out
      </button>
    </header>
  )
}
