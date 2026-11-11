interface StatCardProps {
  label: string
  value: string
  sub?: string
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="card">
      <div className="label-caps mb-2">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  )
}
