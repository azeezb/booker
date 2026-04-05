import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createApiClient } from '../lib/apiClient'
import { updateUser } from '../api/users'
import { useCurrentUser } from '../hooks/useUser'

const tabs = ['Profile', 'Account', 'Reading', 'Notifications', 'Privacy'] as const
type Tab = typeof tabs[number]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('Profile')

  return (
    <div className="flex-1 flex justify-center pt-20 pb-32">
      <div className="flex w-full max-w-2xl">
      {/* Left tab rail */}
      <div className="flex flex-col gap-1 px-3 pt-4 border-r border-stone-100 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
              activeTab === tab
                ? 'bg-stone-800 text-white'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4">
        {activeTab === 'Profile' && (
          <ProfileTab />
        )}
        {activeTab === 'Account' && <Placeholder label="Account settings coming soon" />}
        {activeTab === 'Reading' && <Placeholder label="Reading preferences coming soon" />}
        {activeTab === 'Notifications' && <Placeholder label="Notification settings coming soon" />}
        {activeTab === 'Privacy' && <Placeholder label="Privacy settings coming soon" />}
      </div>
      </div>
    </div>
  )
}

function ProfileTab() {
  const { user: auth0User, getAccessTokenSilently } = useAuth0()
  const { data: apiUser } = useCurrentUser()
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (apiUser?.name) setName(apiUser.name)
  }, [apiUser?.name])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      const token = await getAccessTokenSilently()
      return updateUser(createApiClient(token), newName)
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'me'], updatedUser)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  return (
    <div className="flex flex-col gap-5 max-w-sm">
      <div>
        <label className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1 block">
          Display name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full font-sans text-sm text-stone-800 bg-white/60 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-stone-400"
        />
      </div>

      <div className="w-full h-px bg-stone-100" />

      <div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">Email</p>
        <p className="font-sans text-sm text-stone-400">{auth0User?.email ?? '—'}</p>
        <p className="font-sans text-xs text-stone-300 mt-1">Managed by your login provider</p>
      </div>

      <div className="w-full h-px bg-stone-100" />

      <div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">Member since</p>
        <p className="font-sans text-sm text-stone-500">
          {auth0User?.updated_at
            ? new Date(auth0User.updated_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })
            : '—'}
        </p>
      </div>

      <button
        onClick={() => mutation.mutate(name)}
        disabled={mutation.isPending || name === apiUser?.name}
        className="mt-2 w-full bg-stone-800 text-white font-sans text-xs tracking-widest uppercase rounded-xl py-3 hover:bg-stone-700 transition-colors disabled:opacity-40"
      >
        {mutation.isPending ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
      </button>
    </div>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-20">
      <p className="font-display text-2xl font-light text-stone-300">Coming soon</p>
      <p className="font-sans text-sm text-stone-400 mt-2">{label}</p>
    </div>
  )
}
