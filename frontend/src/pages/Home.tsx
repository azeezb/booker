import { useAuth0 } from '@auth0/auth0-react'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'

export default function Home() {
  const { user } = useAuth0()
  const firstName = user?.given_name ?? user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex flex-col">
      <TopBar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="font-sans text-sm font-light tracking-[0.2em] uppercase text-stone-400 mb-3">
          Welcome back
        </p>
        <h1 className="font-display text-6xl font-light text-stone-800 leading-tight">
          Hi, {firstName}
        </h1>
        <div className="mt-4 w-12 h-px bg-stone-300 mx-auto" />
      </main>

      <BottomNav />
    </div>
  )
}
