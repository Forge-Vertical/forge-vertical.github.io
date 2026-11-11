import { franchises, jobs, formatRand, Role } from '../data/mockData'
import StatCard from '../components/StatCard'

interface DashboardProps {
  role: Role
  franchiseId: string
}

export default function Dashboard({ role, franchiseId }: DashboardProps) {
  const isHeadOffice = role === 'head-office'
  const scopedFranchises = isHeadOffice ? franchises : franchises.filter((f) => f.id === franchiseId)
  const scopedJobs = isHeadOffice ? jobs : jobs.filter((j) => j.franchiseId === franchiseId)

  const totalRevenue = scopedFranchises.reduce((s, f) => s + f.monthRevenue, 0)
  const totalVehicles = scopedFranchises.reduce((s, f) => s + f.monthVehicles, 0)
  const activeJobs = scopedJobs.filter((j) => j.status !== 'completed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isHeadOffice ? 'Head Office Overview' : `${scopedFranchises[0]?.name ?? ''} Branch`}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {isHeadOffice
            ? 'Live across every franchise — nothing here is visible to any individual branch.'
            : 'Scoped to this branch only. Data from other franchises is never queryable from this view.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="This month's revenue" value={formatRand(totalRevenue)} sub={isHeadOffice ? 'All branches' : undefined} />
        <StatCard label="Vehicles serviced" value={String(totalVehicles)} sub="This month" />
        <StatCard label="Active jobs" value={String(activeJobs)} sub="In progress right now" />
        <StatCard label={isHeadOffice ? 'Franchises' : 'Staff on branch'} value={isHeadOffice ? String(franchises.length) : String(scopedFranchises[0]?.staffCount ?? 0)} />
      </div>

      {isHeadOffice && (
        <div className="card">
          <h2 className="font-semibold mb-4">Franchise performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
                <th className="pb-2">Branch</th>
                <th className="pb-2">Active jobs</th>
                <th className="pb-2">Vehicles (month)</th>
                <th className="pb-2">Revenue (month)</th>
              </tr>
            </thead>
            <tbody>
              {franchises.map((f) => (
                <tr key={f.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 font-medium">{f.name}</td>
                  <td className="py-3">{f.activeJobs}</td>
                  <td className="py-3">{f.monthVehicles}</td>
                  <td className="py-3">{formatRand(f.monthRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-4">Recent activity</h2>
        <ul className="space-y-3 text-sm">
          {scopedJobs.slice(0, 5).map((j) => (
            <li key={j.id} className="flex justify-between border-b border-white/5 last:border-0 pb-3 last:pb-0">
              <span className="text-white/70">{j.description}</span>
              <span className="text-white/40">{j.status.replace('-', ' ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
