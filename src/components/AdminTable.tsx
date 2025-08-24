'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  collection, getDocs, onSnapshot, orderBy, query, where, limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { downloadCsv } from '@/lib/utils'

type Mode = 'live' | 'day' | 'month'
type SortKey = 'time' | 'action'
type SortDir = 'asc' | 'desc'

function todayYmd() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function AdminTable() {
  const [mode, setMode] = useState<Mode>('live')
  const [rawLogs, setRawLogs] = useState<any[]>([])
  const [dayKey, setDayKey] = useState<string>(todayYmd())
  const [monthKey, setMonthKey] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Live sort state
  const [liveSortKey, setLiveSortKey] = useState<SortKey>('time')
  const [liveSortDir, setLiveSortDir] = useState<SortDir>('desc')

  // Apply client-side sorting for Live
  const logs = useMemo(() => {
    if (mode !== 'live') return rawLogs
    const arr = [...rawLogs]
    arr.sort((a, b) => {
      if (liveSortKey === 'time') {
        return liveSortDir === 'asc' ? a.ts - b.ts : b.ts - a.ts
      }
      // action: 'in' before 'out' when asc
      const ai = a.action === 'in' ? 0 : 1
      const bi = b.action === 'in' ? 0 : 1
      if (ai === bi) {
        // secondary by time desc to keep stream feel
        return b.ts - a.ts
      }
      return liveSortDir === 'asc' ? ai - bi : bi - ai
    })
    return arr
  }, [mode, rawLogs, liveSortKey, liveSortDir])

  // Live monitor (today)
  useEffect(() => {
    if (mode !== 'live') return
    const q = query(
      collection(db, 'punches'),
      where('dayKey', '==', todayYmd()),
      orderBy('ts', 'desc'),
      limit(5000)
    )
    const unsub = onSnapshot(q, (snap) => {
      setRawLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [mode])

  async function fetchDay() {
    if (!dayKey) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'punches'),
        where('dayKey', '==', dayKey),
        orderBy('ts', 'desc'),
        limit(5000)
      )
      const snap = await getDocs(q)
      setRawLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } finally { setLoading(false) }
  }

  async function fetchMonth() {
    if (!monthKey) return
    setLoading(true)
    try {
      const [y, m] = monthKey.split('-').map(Number)
      const q = query(
        collection(db, 'punches'),
        where('year', '==', y),
        where('month', '==', m),
        orderBy('ts', 'desc'),
        limit(20000)
      )
      const snap = await getDocs(q)
      setRawLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } finally { setLoading(false) }
  }

  // auto-load when switching to Day (today by default)
  useEffect(() => { if (mode === 'day') fetchDay() }, [mode])

  function exportCsv() {
    const rows = [['Email', 'Action', 'Timestamp', 'Day']]
    logs.forEach(l => rows.push([l.email, l.action, new Date(l.ts).toLocaleString(), l.dayKey]))
    const name =
      mode === 'day' ? `attendance_${dayKey || todayYmd()}.csv`
      : mode === 'month' && monthKey ? `attendance_${monthKey}.csv`
      : 'attendance.csv'
    downloadCsv(name, rows)
  }

  const hasData = logs.length > 0

  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xl font-semibold">Admin • Company-wide</div>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setMode('live')}
            className={`rounded-md px-3 py-1 ring-1 ring-white/15 ${mode === 'live' ? 'bg-white/15' : ''}`}>Live</button>
          <button onClick={() => setMode('day')}
            className={`rounded-md px-3 py-1 ring-1 ring-white/15 ${mode === 'day' ? 'bg-white/15' : ''}`}>Day</button>
          <button onClick={() => setMode('month')}
            className={`rounded-md px-3 py-1 ring-1 ring-white/15 ${mode === 'month' ? 'bg-white/15' : ''}`}>Month</button>
        </div>
      </div>

      {/* Live controls */}
      {mode === 'live' && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/70">Sort by</label>
            <select
              value={liveSortKey}
              onChange={e => setLiveSortKey(e.target.value as SortKey)}
              className="rounded-lg bg-white/10 p-2 text-sm "
            >
              <option value="time" className="text-black ">Time</option>
              <option value="action" className="text-black ">Action</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/70">Order</label>
            <select
              value={liveSortDir}
              onChange={e => setLiveSortDir(e.target.value as SortDir)}
              className="rounded-lg bg-white/10 p-2 text-sm"
            >
              <option value="desc" className="text-black ">Desc</option>
              <option value="asc" className="text-black ">Asc</option>
            </select>
          </div>
          <div className="ml-auto">
            <button
              className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50"
              onClick={exportCsv}
              disabled={!hasData}
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Day controls */}
      {mode === 'day' && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Daily (YYYY-MM-DD)</label>
            <input type="date" defaultValue={dayKey}
              className="w-full rounded-lg bg-white/10 p-2"
              onChange={e => setDayKey(e.target.value)} />
            <button className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-sm disabled:opacity-50"
              onClick={fetchDay} disabled={loading}>Load Day</button>
          </div>
          <div className="flex items-end">
            <button className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50"
              onClick={exportCsv} disabled={!hasData}>Export CSV</button>
          </div>
        </div>
      )}

      {/* Month controls */}
      {mode === 'month' && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">Monthly (YYYY-MM)</label>
            <input type="month" className="w-full rounded-lg bg-white/10 p-2"
              onChange={e => setMonthKey(e.target.value)} />
            <button className="mt-2 rounded-lg bg-brand-600 px-3 py-2 text-sm disabled:opacity-50"
              onClick={fetchMonth} disabled={!monthKey || loading}>Load Month</button>
          </div>
          <div className="flex items-end">
            <button className="rounded-lg border border-white/20 px-3 py-2 text-sm disabled:opacity-50"
              onClick={exportCsv} disabled={!hasData}>Export CSV</button>
          </div>
        </div>
      )}

      <div className="max-h-[60vh] overflow-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Action</th>
              <th className="p-2">Time</th>
              <th className="p-2">Day</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="odd:bg-white/5">
                <td className="p-2">{l.email}</td>
                <td className="p-2 capitalize">{l.action}</td>
                <td className="p-2">{new Date(l.ts).toLocaleString()}</td>
                <td className="p-2">{l.dayKey}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-white/60">
                {mode === 'live' ? 'Waiting for activity today…' : 'No data loaded'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
