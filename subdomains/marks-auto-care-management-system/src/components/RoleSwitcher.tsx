import { Role } from '../data/mockData'

interface RoleSwitcherProps {
  role: Role
  franchiseId: string
  onRoleChange: (r: Role) => void
  onFranchiseChange: (f: string) => void
  franchises: { id: string; name: string }[]
}

const roleLabels: Record<Role, string> = {
  'head-office': 'Head Office / Super Admin',
  'franchise-admin': 'Franchise Admin',
  'branch-staff': 'Branch Staff / Technician',
}

/**
 * Demo-only. In production this doesn't exist — the role and franchise
 * scope come from the signed-in user's account and are enforced server-side.
 * This dropdown exists purely so a reviewer can preview all three views
 * without three separate logins.
 */
export default function RoleSwitcher({ role, franchiseId, onRoleChange, onFranchiseChange, franchises }: RoleSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-brand-charcoal border border-brand-lime/20 rounded-lg px-3 py-2 text-xs">
      <span className="text-brand-lime font-semibold uppercase tracking-wide">Preview as</span>
      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value as Role)}
        className="bg-transparent border border-white/15 rounded px-2 py-1 text-white"
      >
        {(Object.keys(roleLabels) as Role[]).map((r) => (
          <option key={r} value={r} className="text-black">
            {roleLabels[r]}
          </option>
        ))}
      </select>
      {role !== 'head-office' && (
        <select
          value={franchiseId}
          onChange={(e) => onFranchiseChange(e.target.value)}
          className="bg-transparent border border-white/15 rounded px-2 py-1 text-white"
        >
          {franchises.map((f) => (
            <option key={f.id} value={f.id} className="text-black">
              {f.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
