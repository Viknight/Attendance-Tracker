'use client'
import { db } from './firebase'
import { auth } from './firebase'
import { collection, doc, getDoc, runTransaction } from 'firebase/firestore'
import { dayKey as makeDayKey, ymd } from './utils'
import type { PunchType, DayDoc, PunchLog } from './types'

export async function punch(action: PunchType) {
  const user = auth.currentUser
  if (!user) throw new Error('Not signed in')
  const email = (user.email || '').toLowerCase()
  const uid = user.uid
  const now = new Date()
  const key = makeDayKey(now)
  const uDayRef = doc(db, 'attendance', uid, 'days', key)
  const punchesRef = collection(db, 'punches')

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(uDayRef)
    if (!snap.exists()) {
      if (action !== 'in') throw new Error('First action of the day must be Login')
      const data: DayDoc = { dayKey: key, punches: [{ type: 'in', ts: now.getTime() }] }
      tx.set(uDayRef, data)
    } else {
      const data = snap.data() as DayDoc
      if (data.punches.length >= 2) throw new Error('You have already completed today’s attendance')
      const last = data.punches[data.punches.length - 1]
      if (last.type === action) throw new Error(`Cannot ${action === 'in' ? 'Login' : 'Logout'} twice in a row`)
      // only allow 'out' as the second and final punch
      if (!(last.type === 'in' && action === 'out')) throw new Error('Only one Login and one Logout allowed per day')
      tx.update(uDayRef, { ...data, punches: [...data.punches, { type: 'out', ts: now.getTime() }] })
    }

    const { year, month, day } = ymd(now)
    const log: PunchLog = { uid, email, action, ts: now.getTime(), dayKey: key, year, month, day }
    tx.set(doc(punchesRef), log)
  })
}

export async function getToday(uid: string) {
  const ref = doc(db, 'attendance', uid, 'days', makeDayKey(new Date()))
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as DayDoc) : undefined
}
