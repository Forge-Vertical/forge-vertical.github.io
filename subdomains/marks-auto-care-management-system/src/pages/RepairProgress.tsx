import { jobs, customers, vehicles, franchises, JobStatus, Role } from '../data/mockData'
import DemoFlag from '../components/DemoFlag'

interface RepairProgressProps {
  role: Role
  franchiseId: string
}

const columns: { status: JobStatus; label: string }[] = [
  { status: 'booked', label: 'Booked' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'awaiting-parts', label: 'Awaiting Parts' },
  { status: 'quality-check', label: 'Quality Check' },
  { status: 'completed', label: 'Completed' },
]

export default function RepairProgress({ role, franchiseId }: RepairProgressProps) {
  const isHeadOffice = role === 'head-office'
  const scoped = isHeadOffice ? jobs : jobs.filter((j) => j.franchiseId === franchiseId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Repair Progress</h1>
        <p className="text-white/40 text-sm mt-1">Live job status — the single most important view on the dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columns.map((col) => {
          const colJobs = scoped.filter((j) => j.status === col.status)
          return (
            <div key={col.status} className="card min-h-[160px]">
              <div className="label-caps mb-3">{col.label} · {colJobs.length}</div>
              <div className="space-y-2">
                {colJobs.map((j) => {
                  const customer = customers.find((c) => c.id === j.customerId)
                  const vehicle = vehicles.find((v) => v.id === j.vehicleId)
                  const franchise = franchises.find((f) => f.id === j.franchiseId)
                  return (
                    <DemoFlag
                      key={j.id}
                      explainer="In production, dragging this card (or updating status from a tablet in-branch) writes the new status immediately — visible to the franchise and head office at the same moment, with a timestamped history entry."
                    >
                      <div className="bg-white/5 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-white/10">
                        <div className="font-medium text-white/90">{vehicle?.make} {vehicle?.model}</div>
                        <div className="text-white/40 mt-0.5">{customer?.name}</div>
                        {isHeadOffice && <div className="text-brand-lime/70 mt-1">{franchise?.name}</div>}
                      </div>
                    </DemoFlag>
                  )
                })}
                {colJobs.length === 0 && <div className="text-white/20 text-xs italic">No jobs</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
