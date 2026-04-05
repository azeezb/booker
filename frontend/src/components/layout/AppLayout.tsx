import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 flex flex-col">
      <TopBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
