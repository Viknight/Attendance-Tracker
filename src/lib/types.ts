export type PunchType = 'in' | 'out'
export type Punch = { type: PunchType; ts: number }
export type DayDoc = { dayKey: string; punches: Punch[]; totalMs?: number }
export type PunchLog = { uid: string; email: string; action: PunchType; ts: number; dayKey: string; year: number; month: number; day: number }