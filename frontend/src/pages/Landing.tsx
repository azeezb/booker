import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { BookOpen, Calendar, Users } from 'lucide-react'

const features = [
  { icon: Calendar, text: 'Track upcoming meetings and reading dates' },
  { icon: BookOpen, text: 'Assign and discover books for each session' },
  { icon: Users, text: 'Manage your club, members, and schedules' },
]

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
      </div>
    </div>
  )
}
