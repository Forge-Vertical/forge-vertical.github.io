import { customers, vehicles, franchises, Role } from '../data/mockData'
import DemoFlag from '../components/DemoFlag'

interface CustomersProps {
  role: Role
  franchiseId: string
}

export default function Customers({ role, franchiseId }: CustomersProps) {
  const isHeadOffice = role === 'head-office'
  const scoped = isHeadOffice ? customers : customers.filter((c) => c.franchiseId === franchiseId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers &amp; Vehicles</h1>
          <p className="text-white/40 text-sm mt-1">Every vehicle carries its full history, permanently — nothing expires.</p>
        </div>
        <DemoFlag explainer="In production, scanning or photographing the VIN plate here auto-fills make, model and year via OCR, instead of typing it in by hand.">
          <button className="btn-ghost text-sm">Scan VIN</button>
        </DemoFlag>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {scoped.map((c) => {
          const franchise = franchises.find((f) => f.id === c.franchiseId)
          const custVehicles = vehicles.filter((v) => c.vehicleIds.includes(v.id))
          return (
            <div key={c.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-white/40 mt-1">{c.phone} · {c.email}</div>
                </div>
                {isHeadOffice && <span className="pill bg-white/10 text-white/60">{franchise?.name}</span>}
              </div>
              <div className="mt-4 space-y-2">
                {custVehicles.map((v) => (
                  <div key={v.id} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{v.year} {v.make} {v.model}</div>
                      <div className="text-xs text-white/40">{v.plate} · last service {v.lastServiceDate}</div>
                    </div>
                    <DemoFlag explainer="In production, this opens the vehicle's full permanent record — every job, photo, document and technician note ever logged against it, newest first.">
                      <button className="text-xs text-brand-lime hover:underline">View history</button>
                    </DemoFlag>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
