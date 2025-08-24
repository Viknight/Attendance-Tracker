// src/app/page.tsx
import StatusCard from '@/components/StatusCard'
import ComingSoon from '@/components/ComingSoon'

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Attendance tracker</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2"><StatusCard /></section>
        <aside>
          <div className="w-full rounded-2xl bg-white/5 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <h2 className="mb-3 text-xl font-semibold">Coming soon</h2>
            <ul className="list-disc space-y-1 pl-6 text-sm text-white/80">
              <li>Holidays Calendar</li>
              <li>Leave Requests & Approvals</li>
              <li>Company Notice Board</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
