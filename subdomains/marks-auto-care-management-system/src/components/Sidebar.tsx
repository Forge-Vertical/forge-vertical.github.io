import { NavLink } from 'react-router-dom'
import { Role } from '../data/mockData'

interface SidebarProps {
  role: Role
}

const headOfficeLinks = [
  { to: '/', label: 'Overview' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/customers', label: 'Customers & Vehicles' },
  { to: '/quotes', label: 'Quotes & Invoices' },
  { to: '/repairs', label: 'Repair Progress' },
  { to: '/reports', label: 'Reports' },
  { to: '/audit', label: 'Audit Log' },
]

const franchiseLinks = [
  { to: '/', label: 'My Branch' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/customers', label: 'Customers & Vehicles' },
  { to: '/quotes', label: 'Quotes & Invoices' },
  { to: '/repairs', label: 'Repair Progress' },
  { to: '/reports', label: 'Reports' },
]

const branchStaffLinks = [
  { to: '/', label: 'My Branch' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/repairs', label: 'Repair Progress' },
]

export default function Sidebar({ role }: SidebarProps) {
  const links = role === 'head-office' ? headOfficeLinks : role === 'franchise-admin' ? franchiseLinks : branchStaffLinks

  return (
    <aside className="w-60 shrink-0 bg-brand-dark border-r border-white/5 flex flex-col">
      <div className="px-5 py-6">
        <div className="font-display text-brand-lime text-xl leading-none">MARKS</div>
        <div className="text-brand-lime text-[10px] tracking-widest mt-1">CAR SERVICES &amp; REPAIRS</div>
        <div className="text-white/30 text-[10px] mt-3 uppercase tracking-wider">Franchise Platform</div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-brand-lime/15 text-brand-lime font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-[10px] text-white/25 border-t border-white/5">
        Internal tool · not indexed · demo build
      </div>
    </aside>
  )
}
