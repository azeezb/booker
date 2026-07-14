import { useState } from 'react'
import { useCurrentUser, useDeleteUser } from '../hooks/useUser'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Account() {
  const { data: user } = useCurrentUser()
  const { mutate: deleteAccount, isPending } = useDeleteUser()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!user) return null

  return (
    <div className="px-4 pt-12 pb-6 space-y-8 max-w-sm mx-auto">
      <div>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">Account</p>
        <h1 className="font-display text-3xl font-light text-stone-800">Your profile</h1>
      </div>

      {/* User info */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm p-5 space-y-3">
        <div>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">Name</p>
          <p className="font-sans text-sm text-stone-700">{user.name}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">Email</p>
          <p className="font-sans text-sm text-stone-700">{user.email}</p>
        </div>
        <div>
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">Member since</p>
          <p className="font-sans text-sm text-stone-700">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-2xl p-5 space-y-3">
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-red-400">Danger zone</p>

        {!confirmDelete ? (
          <div>
            <p className="font-sans text-xs text-stone-500 mb-3">
              Permanently delete your account and all associated data. Clubs you own will be dissolved or transferred.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="font-sans text-xs text-red-500 border border-red-200 rounded-full px-4 py-2 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
            >
              Delete account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-sans text-xs text-red-600 font-medium">
              This cannot be undone. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteAccount()}
                disabled={isPending}
                className="font-sans text-xs text-white bg-red-500 border border-red-500 rounded-full px-4 py-2 hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-sans text-xs text-stone-500 border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
