'use client'

import { useState, useMemo } from 'react'
import { Plus, Users, Trash2, Edit2, X, Phone, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import {
  getDrivers,
  getLoads,
  saveDriver,
  deleteDriver,
  generateId,
  isThisMonth,
  type Driver,
} from '@/lib/store'

export default function DriversPage() {
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [truckType, setTruckType] = useState('')
  const [notes, setNotes] = useState('')

  const drivers = useMemo(() => {
    if (!user) return []
    return getDrivers(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey])

  const loads = useMemo(() => {
    if (!user) return []
    return getLoads(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey])

  const getDriverStats = (driverId: string) => {
    const driverLoads = loads.filter(
      (l) => l.driverId === driverId && isThisMonth(l.date)
    )
    return {
      loadsThisMonth: driverLoads.length,
      totalLoads: loads.filter((l) => l.driverId === driverId).length,
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setTruckType('')
    setNotes('')
    setEditingDriver(null)
  }

  const openForm = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver)
      setName(driver.name)
      setPhone(driver.phone)
      setTruckType(driver.truckType)
      setNotes(driver.notes)
    } else {
      resetForm()
    }
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name) return

    const driver: Driver = {
      id: editingDriver?.id || generateId(),
      userId: user.id,
      name,
      phone,
      truckType,
      notes,
    }

    saveDriver(driver)
    setRefreshKey((k) => k + 1)
    setIsFormOpen(false)
    resetForm()
  }

  const handleDelete = (driverId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this driver? This will not delete their loads.'
      )
    ) {
      deleteDriver(driverId)
      setRefreshKey((k) => k + 1)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#97D3CB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drivers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your driver roster
          </p>
        </div>
        <Button
          onClick={() => openForm()}
          className="h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
        >
          <Plus className="h-5 w-5" />
          Add Driver
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  resetForm()
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Driver Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Truck Type
                </label>
                <Input
                  placeholder="e.g., Dry Van, Flatbed, Reefer"
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <Input
                  placeholder="Optional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                  className="h-12 flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!name}
                  className="h-12 flex-1 rounded-xl bg-[#103754] text-white hover:bg-[#103754]/90"
                >
                  {editingDriver ? 'Update Driver' : 'Add Driver'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drivers Grid */}
      {drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-lg font-medium text-foreground">
            No drivers yet
          </p>
          <p className="mt-1 text-muted-foreground">
            Add your first driver to get started
          </p>
          <Button
            onClick={() => openForm()}
            className="mt-6 h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
          >
            <Plus className="h-5 w-5" />
            Add Driver
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => {
            const stats = getDriverStats(driver.id)
            return (
              <div
                key={driver.id}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#103754]/10">
                      <Users className="h-7 w-7 text-[#103754]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {driver.name}
                      </h3>
                      {driver.truckType && (
                        <p className="text-sm text-muted-foreground">
                          {driver.truckType}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openForm(driver)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-[#F17961]/10 hover:text-[#F17961]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {driver.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{driver.phone}</span>
                    </div>
                  )}
                  {driver.truckType && (
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{driver.truckType}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-4 rounded-xl bg-muted/50 p-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.loadsThisMonth}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      loads this month
                    </p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {stats.totalLoads}
                    </p>
                    <p className="text-xs text-muted-foreground">total loads</p>
                  </div>
                </div>

                {driver.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {driver.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
