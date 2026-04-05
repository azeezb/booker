import { useCurrentUser } from '../hooks/useUser'

export default function Home() {
  const { data: dbUser } = useCurrentUser()
  const firstName = dbUser?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <p className="font-sans text-sm font-light tracking-[0.2em] uppercase text-stone-400 mb-3">
        Welcome back
      </p>
      <h1 className="font-display text-6xl font-light text-stone-800 leading-tight">
        Hi, {firstName}
      </h1>
      <div className="mt-4 w-12 h-px bg-stone-300 mx-auto" />
    </div>
  )
}
