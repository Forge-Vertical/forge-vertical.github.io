import DemoFlag from '../components/DemoFlag'

const sampleEntries = [
  { who: 'Pieter V. (Bellville)', what: 'Moved booking date', detail: '2026-11-10 → 2026-11-13', when: '2026-11-09 14:22' },
  { who: 'Head Office', what: 'Viewed cross-franchise report', detail: 'All branches, October', when: '2026-11-08 09:03' },
  { who: 'Megan R. (Claremont)', what: 'Changed job status', detail: 'in-progress → quality-check', when: '2026-11-10 16:41' },
  { who: 'System', what: 'Blocked cross-franchise read', detail: 'Bellville user attempted to query Claremont records', when: '2026-11-07 11:58' },
]

export default function AuditLog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-white/40 text-sm mt-1">
          Every change is recorded — what it was, what it became, when, and who changed it. This is the mechanism that closes the
          data-isolation gap Resolve had.
        </p>
      </div>

      <DemoFlag
        inline={false}
        explainer="This is a sample, illustrative log. In production every read and write is checked server-side against the user's franchise ID before it's allowed — a blocked attempt like the one below is a real, logged security event, not a UI message."
      >
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wide border-b border-white/5">
                <th className="pb-2 pr-4">Who</th>
                <th className="pb-2 pr-4">What</th>
                <th className="pb-2 pr-4">Detail</th>
                <th className="pb-2">When</th>
              </tr>
            </thead>
            <tbody>
              {sampleEntries.map((e, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4">{e.who}</td>
                  <td className="py-3 pr-4 text-white/70">{e.what}</td>
                  <td className={`py-3 pr-4 ${e.who === 'System' ? 'text-red-400' : 'text-white/50'}`}>{e.detail}</td>
                  <td className="py-3 text-white/40">{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DemoFlag>
    </div>
  )
}
