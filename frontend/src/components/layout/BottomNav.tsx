import { BookOpen, Users, User, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { icon: BookOpen, label: 'Books', path: '/books' },
  { icon: Users, label: 'Clubs', path: '/clubs' },
  { icon: User, label: 'Account', path: '/account' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md rounded-full px-4 py-3 shadow-lg border border-white/40">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-full transition-all ${
                active
                  ? 'bg-stone-800 text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-sans font-medium tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
