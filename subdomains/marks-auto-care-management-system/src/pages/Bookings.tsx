import { useState } from 'react'
import { jobs as initialJobs, customers, vehicles, franchises, Role } from '../data/mockData'
import DemoFlag from '../components/DemoFlag'

interface BookingsProps {
  role: Role
  franchiseId: string
}

export default function Bookings({ role, franchiseId }: BookingsProps) {
  const [jobs] = useState(initialJobs)
  const isHeadOffice = role === 'head-office'
  const scoped = isHeadOffice ? jobs : jobs.filter((j) => j.franchiseId === franchiseId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Booking Calendar</h1>
          <p className="text-white/40 text-sm mt-1">Every date change is logged — what it was, what it became, when, and who changed it.</p>
        </div>
        <DemoFlag explainer="In production, this creates a new booking document in Firestore, scoped to this franchise's ID, and triggers the audit-log entry automatically on any later edit.">
          <button className="btn-primary text-sm">+ New booking</button>
        </DemoFlag>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
              {isHeadOffice && <th className="pb-2 pr-4">Franchise</th>}
              <th className="pb-2 pr-4">Customer</th>
              <th className="pb-2 pr-4">Vehicle</th>
              <th className="pb-2 pr-4">Booking date</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Technician</th>
            </tr>
          </thead>
          <tbody>
            {scoped.map((j) => {
              const customer = customers.find((c) => c.id === j.customerId)
              const vehicle = vehicles.find((v) => v.id === j.vehicleId)
              const franchise = franchises.find((f) => f.id === j.franchiseId)
              return (
                <tr key={j.id} className="border-b border-white/5 last:border-0">
                  {isHeadOffice && <td className="py-3 pr-4 text-white/60">{franchise?.name}</td>}
                  <td className="py-3 pr-4">{customer?.name}</td>
                  <td className="py-3 pr-4 text-white/60">{vehicle?.make} {vehicle?.model}</td>
                  <td className="py-3 pr-4">
                    <DemoFlag explainer="In production, moving this date writes a new value and appends to the audit log: the old date, the new date, timestamp, and which user made the change. The original date is never deleted.">
                      <span className="underline decoration-dotted decoration-white/30 cursor-pointer">
                        {j.bookingDate}
                        {j.originalBookingDate && <span className="text-brand-lime text-xs ml-1">(moved)</span>}
                      </span>
                    </DemoFlag>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="pill bg-white/10 text-white/70">{j.status.replace('-', ' ')}</span>
                  </td>
                  <td className="py-3">{j.technician}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
