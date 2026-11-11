// ─────────────────────────────────────────────────────────────────────────
// MOCK DATA ONLY. Nothing here reads from or writes to a real database.
// Shapes below are a first draft of the Firestore collections this becomes
// in Phase 1 — every record will carry a franchiseId for the real isolation
// rules, which is why it's already on these types even in the demo.
// ─────────────────────────────────────────────────────────────────────────

export type Role = 'head-office' | 'franchise-admin' | 'branch-staff'

export interface Franchise {
  id: string
  name: string
  suburb: string
  staffCount: number
  activeJobs: number
  monthRevenue: number
  monthVehicles: number
}

export interface Vehicle {
  id: string
  franchiseId: string
  make: string
  model: string
  year: number
  vin: string
  plate: string
  lastServiceDate: string
}

export interface Customer {
  id: string
  franchiseId: string
  name: string
  phone: string
  email: string
  vehicleIds: string[]
}

export type JobStatus = 'booked' | 'in-progress' | 'awaiting-parts' | 'quality-check' | 'completed'

export interface Job {
  id: string
  franchiseId: string
  customerId: string
  vehicleId: string
  status: JobStatus
  description: string
  quoteAmount: number
  invoiced: boolean
  technician: string
  bookingDate: string
  originalBookingDate?: string // set only if the date was ever moved
}

export const franchises: Franchise[] = [
  { id: 'fr-bellville', name: 'Bellville', suburb: 'Bellville', staffCount: 6, activeJobs: 14, monthRevenue: 412000, monthVehicles: 61 },
  { id: 'fr-claremont', name: 'Claremont', suburb: 'Claremont', staffCount: 5, activeJobs: 9, monthRevenue: 318000, monthVehicles: 47 },
  { id: 'fr-greenpoint', name: 'Green Point', suburb: 'Green Point', staffCount: 4, activeJobs: 11, monthRevenue: 289000, monthVehicles: 39 },
  { id: 'fr-tableview', name: 'Tableview', suburb: 'Tableview', staffCount: 5, activeJobs: 8, monthRevenue: 301000, monthVehicles: 44 },
  { id: 'fr-stikland', name: 'Stikland', suburb: 'Stikland', staffCount: 7, activeJobs: 16, monthRevenue: 455000, monthVehicles: 68 },
]

export const customers: Customer[] = [
  { id: 'cust-1', franchiseId: 'fr-bellville', name: 'Thandiwe Mahlangu', phone: '082 445 1920', email: 'thandiwe.m@example.com', vehicleIds: ['veh-1'] },
  { id: 'cust-2', franchiseId: 'fr-bellville', name: 'Johan Pretorius', phone: '083 221 7701', email: 'johan.p@example.com', vehicleIds: ['veh-2'] },
  { id: 'cust-3', franchiseId: 'fr-claremont', name: 'Aisha Davids', phone: '071 982 3340', email: 'aisha.d@example.com', vehicleIds: ['veh-3'] },
  { id: 'cust-4', franchiseId: 'fr-greenpoint', name: 'Luke Fourie', phone: '076 310 8852', email: 'luke.f@example.com', vehicleIds: ['veh-4'] },
  { id: 'cust-5', franchiseId: 'fr-stikland', name: 'Nomsa Dlamini', phone: '084 556 2217', email: 'nomsa.d@example.com', vehicleIds: ['veh-5'] },
]

export const vehicles: Vehicle[] = [
  { id: 'veh-1', franchiseId: 'fr-bellville', make: 'Toyota', model: 'Hilux', year: 2021, vin: 'AHTFZ29G2M1038221', plate: 'CA 123-456', lastServiceDate: '2026-09-02' },
  { id: 'veh-2', franchiseId: 'fr-bellville', make: 'VW', model: 'Polo Vivo', year: 2019, vin: 'WVWZZZ6RZKY004821', plate: 'CA 987-654', lastServiceDate: '2026-08-14' },
  { id: 'veh-3', franchiseId: 'fr-claremont', make: 'Ford', model: 'Ranger', year: 2022, vin: '1FTFW1E55MFA10233', plate: 'CA 456-789', lastServiceDate: '2026-10-01' },
  { id: 'veh-4', franchiseId: 'fr-greenpoint', make: 'BMW', model: '320i', year: 2020, vin: 'WBA8E9108LK182244', plate: 'CA 321-654', lastServiceDate: '2026-09-28' },
  { id: 'veh-5', franchiseId: 'fr-stikland', make: 'Hyundai', model: 'i20', year: 2023, vin: 'KMHGH4JH2PU019372', plate: 'CA 741-852', lastServiceDate: '2026-10-20' },
]

export const jobs: Job[] = [
  { id: 'job-1', franchiseId: 'fr-bellville', customerId: 'cust-1', vehicleId: 'veh-1', status: 'in-progress', description: 'Major service + cambelt replacement', quoteAmount: 8450, invoiced: false, technician: 'Sipho N.', bookingDate: '2026-11-11' },
  { id: 'job-2', franchiseId: 'fr-bellville', customerId: 'cust-2', vehicleId: 'veh-2', status: 'awaiting-parts', description: 'Gearbox repair', quoteAmount: 12300, invoiced: false, technician: 'Pieter V.', bookingDate: '2026-11-13', originalBookingDate: '2026-11-10' },
  { id: 'job-3', franchiseId: 'fr-claremont', customerId: 'cust-3', vehicleId: 'veh-3', status: 'quality-check', description: 'Suspension + shocks', quoteAmount: 6200, invoiced: false, technician: 'Megan R.', bookingDate: '2026-11-10' },
  { id: 'job-4', franchiseId: 'fr-greenpoint', customerId: 'cust-4', vehicleId: 'veh-4', status: 'completed', description: 'Minor service', quoteAmount: 2100, invoiced: true, technician: 'Dean A.', bookingDate: '2026-11-05' },
  { id: 'job-5', franchiseId: 'fr-stikland', customerId: 'cust-5', vehicleId: 'veh-5', status: 'booked', description: 'Diagnostics — engine warning light', quoteAmount: 850, invoiced: false, technician: 'Unassigned', bookingDate: '2026-11-14' },
]

export const currentUser = {
  name: 'Jarrit Hosking',
  role: 'head-office' as Role,
}

export function formatRand(n: number): string {
  return 'R' + n.toLocaleString('en-ZA')
}
