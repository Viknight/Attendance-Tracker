'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '@/lib/firebase'
import { fetchEmployeeByEmail } from '@/lib/auth'
import { getToday, punch } from '@/lib/firestore'
import type { DayDoc } from '@/lib/types'

export default function StatusCard() {
  const [loading, setLoading] = useState(true)
  const [authorised, setAuthorised] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [today, setToday] = useState<DayDoc | undefined>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setError('')
        setAuthorised(false)
        if (u?.email) {
          const email = u.email.toLowerCase().trim()
          const emp = await fetchEmployeeByEmail(email)
          if (!emp || emp.active === false) {
            await signOut(auth)         // hard-block unknown emails
            setUserEmail(null)
            setToday(undefined)
            setError('Your email is not authorized. Please contact the admin.')
            return
          }
          setAuthorised(true)
          setUserEmail(email)
          const t = await getToday(u.uid)
          setToday(t)
        } else {
          setUserEmail(null)
          setToday(undefined)
        }
      } catch (e: any) {
        setError(e?.message || 'Authentication error')
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // Signed-out state — bigger message like the “Coming soon” heading
  if (!userEmail) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <div className="mb-3 text-xl font-normal">Sign in to mark your attendance</div>
        <button
          onClick={() => signInWithPopup(auth, provider)}
          disabled={loading}
          className="rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow hover:bg-brand-600 disabled:opacity-50"
        >
          Sign in with Google
        </button>
        {error && <div className="mt-4 rounded-lg bg-rose-950/50 p-3 text-rose-300">{error}</div>}
      </motion.div>
    )
  }

  const punches = today?.punches ?? []
  const completed = punches.length >= 2
  const status: 'in' | 'out' = punches.length ? punches[punches.length - 1].type : 'out'

  async function doPunch(next: 'in' | 'out') {
    setError('')
    try {
      if (next === 'out') {
        const ok = window.confirm('Are you sure you want to clock out for today? You cannot clock in again today.')
        if (!ok) return
      }
      setLoading(true)
      await punch(next)
      if (auth.currentUser) {
        const t = await getToday(auth.currentUser.uid)
        setToday(t)
      }
    } catch (e: any) { setError(e?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">

      {/* header with button-style Sign out */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-white/70">{userEmail}</div>
        {authorised && (
          <button
            onClick={() => signOut(auth)}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Sign out
          </button>
        )}
      </div>

      <div className="mb-4 text-2xl font-semibold">
        You’re currently:{' '}
        <span className={status === 'in' ? 'text-emerald-400' : 'text-rose-400'}>
          {status === 'in' ? 'Clocked in' : 'Clocked out'}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={
            completed ? undefined :
            status === 'in' ? () => doPunch('out') : () => doPunch('in')
          }
          disabled={loading || completed}
          className="rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow hover:bg-brand-600 disabled:opacity-50"
        >
          {completed ? 'Done for today' : status === 'in' ? 'Clock out' : 'Clock in'}
        </button>
      </div>

      {error && <div className="mt-4 rounded-lg bg-rose-950/50 p-3 text-rose-300">{error}</div>}

      {punches.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm text-white/60">Today’s punches</div>
          <ul className="space-y-1 text-sm text-white/80">
            {punches.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.type === 'in' ? 'Clock in' : 'Clock out'}</span>
                <span>{new Date(p.ts).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
