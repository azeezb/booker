import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { BookOpen, Calendar, Users } from 'lucide-react'

const features = [
  { icon: Calendar, text: 'Track upcoming meetings and reading dates' },
  { icon: BookOpen, text: 'Assign and discover books for each session' },
  { icon: Users, text: 'Manage your club, members, and schedules' },
]

const demoEmail = import.meta.env.VITE_DEMO_EMAIL as string | undefined
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD as string | undefined

export default function Landing() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-10">
        <div>
          <h1 className="font-display text-5xl font-light text-stone-800 tracking-tight">booker</h1>
          <p className="font-sans text-sm text-stone-400 mt-2 tracking-wide">
            Your book club, organised.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6 space-y-5 shadow-sm text-left">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <Icon size={15} strokeWidth={1.5} className="text-stone-400 mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-stone-600 leading-snug">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => loginWithRedirect()}
            className="w-full font-sans text-sm text-white bg-stone-800 rounded-full py-3 hover:bg-stone-700 transition-all"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/browse')}
            className="w-full font-sans text-sm text-stone-600 border border-stone-300 rounded-full py-3 hover:bg-white/60 transition-all"
          >
            Browse clubs
          </button>
        </div>

        {demoEmail && demoPassword && (
          <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400">Just looking?</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-xs text-stone-400">Email</span>
                <span className="font-sans text-xs text-stone-800 bg-white/70 border border-stone-200 rounded-lg px-2.5 py-1">
                  {demoEmail}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-xs text-stone-400">Password</span>
                <span className="font-sans text-xs text-stone-800 bg-white/70 border border-stone-200 rounded-lg px-2.5 py-1">
                  {demoPassword}
                </span>
              </div>
            </div>
            <button
              onClick={() => loginWithRedirect({ authorizationParams: { login_hint: demoEmail } })}
              className="w-full font-sans text-sm text-stone-600 border border-stone-300 rounded-full py-2.5 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-all"
            >
              Try the demo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
