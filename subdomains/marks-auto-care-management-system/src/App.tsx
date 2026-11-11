import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RoleSwitcher from './components/RoleSwitcher'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Customers from './pages/Customers'
import QuotesInvoices from './pages/QuotesInvoices'
import RepairProgress from './pages/RepairProgress'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'
import { franchises, currentUser, Role } from './data/mockData'

export default function App() {
  const [role, setRole] = useState<Role>(currentUser.role)
  const [franchiseId, setFranchiseId] = useState(franchises[0].id)

  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="text-sm text-white/50">
            Signed in as <span className="text-white">{currentUser.name}</span>
          </div>
          <RoleSwitcher
            role={role}
            franchiseId={franchiseId}
            onRoleChange={setRole}
            onFranchiseChange={setFranchiseId}
            franchises={franchises}
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard role={role} franchiseId={franchiseId} />} />
            <Route path="/bookings" element={<Bookings role={role} franchiseId={franchiseId} />} />
            <Route path="/customers" element={<Customers role={role} franchiseId={franchiseId} />} />
            <Route path="/quotes" element={<QuotesInvoices role={role} franchiseId={franchiseId} />} />
            <Route path="/repairs" element={<RepairProgress role={role} franchiseId={franchiseId} />} />
            <Route path="/reports" element={<Reports role={role} franchiseId={franchiseId} />} />
            {role === 'head-office' && <Route path="/audit" element={<AuditLog />} />}
          </Routes>
        </main>
      </div>
    </div>
  )
}
