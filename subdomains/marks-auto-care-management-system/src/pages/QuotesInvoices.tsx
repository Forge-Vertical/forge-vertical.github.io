import { jobs, customers, vehicles, franchises, formatRand, Role } from '../data/mockData'
import DemoFlag from '../components/DemoFlag'

interface QuotesInvoicesProps {
  role: Role
  franchiseId: string
}

export default function QuotesInvoices({ role, franchiseId }: QuotesInvoicesProps) {
  const isHeadOffice = role === 'head-office'
  const scoped = isHeadOffice ? jobs : jobs.filter((j) => j.franchiseId === franchiseId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotes → Invoices</h1>
        <p className="text-white/40 text-sm mt-1">Branded with Marks Autocare's and each franchise's logo, colours and letterhead.</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
              {isHeadOffice && <th className="pb-2 pr-4">Franchise</th>}
              <th className="pb-2 pr-4">Customer</th>
              <th className="pb-2 pr-4">Description</th>
              <th className="pb-2 pr-4">Amount</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Action</th>
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
                  <td className="py-3 pr-4">
                    <div>{customer?.name}</div>
                    <div className="text-xs text-white/40">{vehicle?.make} {vehicle?.model}</div>
                  </td>
                  <td className="py-3 pr-4 text-white/70">{j.description}</td>
                  <td className="py-3 pr-4 font-medium">{formatRand(j.quoteAmount)}</td>
                  <td className="py-3 pr-4">
                    <span className={`pill ${j.invoiced ? 'bg-brand-lime/15 text-brand-lime' : 'bg-white/10 text-white/60'}`}>
                      {j.invoiced ? 'Invoiced' : 'Quote'}
                    </span>
                  </td>
                  <td className="py-3">
                    <DemoFlag explainer={j.invoiced
                      ? 'In production, this downloads a branded PDF invoice — this franchise\'s logo and letterhead, generated from the stored job record.'
                      : 'In production, approving a quote here converts it to an invoice in one step, stamped with this franchise\'s branding, and marks the job ready for the next status.'}
                    >
                      <button className="text-xs text-brand-lime hover:underline">
                        {j.invoiced ? 'View invoice' : 'Convert to invoice'}
                      </button>
                    </DemoFlag>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
