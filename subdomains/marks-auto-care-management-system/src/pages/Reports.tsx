import { franchises, formatRand, Role } from '../data/mockData'
import DemoFlag from '../components/DemoFlag'

interface ReportsProps {
  role: Role
  franchiseId: string
}

export default function Reports({ role, franchiseId }: ReportsProps) {
  const isHeadOffice = role === 'head-office'
  const scoped = isHeadOffice ? franchises : franchises.filter((f) => f.id === franchiseId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-white/40 text-sm mt-1">Weekly, monthly and annual — income, vehicles handled, jobs completed.</p>
        </div>
        <div className="flex gap-2">
          {['Weekly', 'Monthly', 'Annual'].map((period) => (
            <DemoFlag key={period} explainer={`In production, this runs a real aggregation query over this ${isHeadOffice ? 'network' : 'branch'}'s job records for the selected period and exports a PDF or CSV.`}>
              <button className="btn-ghost text-xs">{period}</button>
            </DemoFlag>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {scoped.map((f) => (
          <div key={f.id} className="card">
            <div className="font-semibold mb-3">{f.name}</div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="label-caps">Revenue</div>
                <div className="font-semibold mt-1">{formatRand(f.monthRevenue)}</div>
              </div>
              <div>
                <div className="label-caps">Vehicles</div>
                <div className="font-semibold mt-1">{f.monthVehicles}</div>
              </div>
              <div>
                <div className="label-caps">Active jobs</div>
                <div className="font-semibold mt-1">{f.activeJobs}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
