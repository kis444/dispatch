// lib/store.ts
export interface User {
  id: string
  email: string
  role: 'dispatcher' | 'owner'  // Adăugat rol
  commissionRate: number
  cutPercentage: number
  taxPercentage: number
  monthlyGoal: number
  defaultAfterHoursValue: number
  averageLoadValue: number
}

export interface Driver {
  id: string
  userId: string
  name: string
  phone: string
  truckType: string
  notes: string
}

export interface Load {
  id: string
  userId: string
  driverId: string
  loadRate: number
  commission: number
  cutAmount: number
  cutProfit: number
  date: string
  notes: string
}

export interface AfterHours {
  id: string
  userId: string
  driverId?: string
  shiftValue: number
  date: string
  notes: string
}

export const defaultUserSettings: Omit<User, 'id' | 'email'> = {
  role: 'dispatcher',  // Adăugat rol cu valoare default
  commissionRate: 1.3,
  cutPercentage: 4,
  taxPercentage: 7,
  monthlyGoal: 4000,
  defaultAfterHoursValue: 100,
  averageLoadValue: 1500,
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'dispatcher_user',
  DRIVERS: 'dispatcher_drivers',
  LOADS: 'dispatcher_loads',
  AFTER_HOURS: 'dispatcher_after_hours',
  AUTH: 'dispatcher_auth',
}

// Auth functions
export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.AUTH)
  return data ? JSON.parse(data) : null
}

export function setAuthUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH)
  }
}

export function getUsers(): Record<string, { email: string; password: string; user: User }> {
  if (typeof window === 'undefined') return {}
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : {}
}

export function saveUser(email: string, password: string, user: User): void {
  if (typeof window === 'undefined') return
  const users = getUsers()
  users[email] = { email, password, user }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users))
}

export function updateUserSettings(userId: string, settings: Partial<User>): void {
  if (typeof window === 'undefined') return
  const users = getUsers()
  const userEntry = Object.values(users).find(u => u.user.id === userId)
  if (userEntry) {
    userEntry.user = { ...userEntry.user, ...settings }
    users[userEntry.email] = userEntry
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users))
    setAuthUser(userEntry.user)
  }
}

// Funcție pentru a seta primul utilizator ca owner
export function setupFirstOwner(email: string, password: string): User | null {
  const users = getUsers()
  if (Object.keys(users).length === 0) {
    // Primul utilizator devine owner
    const newUser: User = {
      id: generateId(),
      email,
      role: 'owner',
      commissionRate: 1.3,
      cutPercentage: 4,
      taxPercentage: 7,
      monthlyGoal: 4000,
      defaultAfterHoursValue: 100,
      averageLoadValue: 1500,
    }
    saveUser(email, password, newUser)
    setAuthUser(newUser)
    return newUser
  }
  return null
}

// Drivers
export function getDrivers(userId: string): Driver[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const allDrivers: Driver[] = data ? JSON.parse(data) : []
  return allDrivers.filter(d => d.userId === userId)
}

export function saveDriver(driver: Driver): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const allDrivers: Driver[] = data ? JSON.parse(data) : []
  const index = allDrivers.findIndex(d => d.id === driver.id)
  if (index >= 0) {
    allDrivers[index] = driver
  } else {
    allDrivers.push(driver)
  }
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(allDrivers))
}

export function deleteDriver(driverId: string): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const allDrivers: Driver[] = data ? JSON.parse(data) : []
  const filtered = allDrivers.filter(d => d.id !== driverId)
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(filtered))
}

// Loads
export function getLoads(userId: string): Load[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.LOADS)
  const allLoads: Load[] = data ? JSON.parse(data) : []
  return allLoads.filter(l => l.userId === userId)
}

export function saveLoad(load: Load): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.LOADS)
  const allLoads: Load[] = data ? JSON.parse(data) : []
  const index = allLoads.findIndex(l => l.id === load.id)
  if (index >= 0) {
    allLoads[index] = load
  } else {
    allLoads.push(load)
  }
  localStorage.setItem(STORAGE_KEYS.LOADS, JSON.stringify(allLoads))
}

export function deleteLoad(loadId: string): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.LOADS)
  const allLoads: Load[] = data ? JSON.parse(data) : []
  const filtered = allLoads.filter(l => l.id !== loadId)
  localStorage.setItem(STORAGE_KEYS.LOADS, JSON.stringify(filtered))
}

// After Hours
export function getAfterHours(userId: string): AfterHours[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.AFTER_HOURS)
  const allAfterHours: AfterHours[] = data ? JSON.parse(data) : []
  return allAfterHours.filter(a => a.userId === userId)
}

export function saveAfterHours(afterHours: AfterHours): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.AFTER_HOURS)
  const allAfterHours: AfterHours[] = data ? JSON.parse(data) : []
  const index = allAfterHours.findIndex(a => a.id === afterHours.id)
  if (index >= 0) {
    allAfterHours[index] = afterHours
  } else {
    allAfterHours.push(afterHours)
  }
  localStorage.setItem(STORAGE_KEYS.AFTER_HOURS, JSON.stringify(allAfterHours))
}

export function deleteAfterHours(afterHoursId: string): void {
  if (typeof window === 'undefined') return
  const data = localStorage.getItem(STORAGE_KEYS.AFTER_HOURS)
  const allAfterHours: AfterHours[] = data ? JSON.parse(data) : []
  const filtered = allAfterHours.filter(a => a.id !== afterHoursId)
  localStorage.setItem(STORAGE_KEYS.AFTER_HOURS, JSON.stringify(filtered))
}

// Utility functions
export function isToday(dateStr: string): boolean {
  const today = new Date()
  const date = new Date(dateStr)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function isThisMonth(dateStr: string): boolean {
  const today = new Date()
  const date = new Date(dateStr)
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}