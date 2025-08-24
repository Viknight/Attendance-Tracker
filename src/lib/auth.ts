import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export type EmployeeDoc = {
  name?: string
  active?: boolean
  role?: 'employee' | 'admin'
}

export async function fetchEmployeeByEmail(email?: string | null): Promise<EmployeeDoc | null> {
  if (!email) return null
  const id = email.toLowerCase().trim()
  const ref = doc(db, 'employees', id)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as EmployeeDoc) : null
}
