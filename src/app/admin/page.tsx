'use client'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { fetchEmployeeByEmail } from '@/lib/auth'
import AdminTable from '@/components/AdminTable'

export default function AdminPage() {
  const [allowed, setAllowed] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u?.email) { setAllowed(false); return }
      const e = u.email.toLowerCase()
      setEmail(e)
      const emp = await fetchEmployeeByEmail(e)
      setAllowed(!!emp && emp.active !== false && emp.role === 'admin')
    })
    return () => unsub()
  }, [])

  if (!allowed) return <div className="rounded-xl bg-white/5 p-6">Admins only. Ask an admin to grant you access.</div>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Report</h1>
      <div className="text-sm text-white/70">Signed in as {email}</div>
      <AdminTable />
    </div>
  )
}
