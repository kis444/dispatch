'use client'

import { useState, useMemo } from 'react'
import { Plus, Package, Trash2, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  getLoads,
  getDrivers,
  saveLoad,
  deleteLoad,
  generateId,
  formatCurrency,
  isThisMonth,
  type Load,
} from '@/lib/store'

export default function LoadsPage() {
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLoad, setEditingLoad] = useState<Load | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form state
  const [driverId, setDriverId] = useState('')
  const [loadRate, setLoadRate] = useState('')
  const [cutAmount, setCutAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const drivers = useMemo(() => {
    if (!user) return []
    return getDrivers(user.id)
  }, [user])

  const loads = useMemo(() => {
    if (!user) return []
    return getLoads(user.id).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey])

  const monthLoads = useMemo(() => {
    return loads.filter((l) => isThisMonth(l.date))
  }, [loads])

  // Calculated values
  const calculatedCommission = useMemo(() => {
    if (!user || !loadRate) return 0
    return parseFloat(loadRate) * (user.commissionRate / 100)
  }, [loadRate, user])

  const calculatedCutProfit = useMemo(() => {
    if (!user || !cutAmount) return 0
    return parseFloat(cutAmount) * (user.cutPercentage / 100)
  }, [cutAmount, user])

  const resetForm = () => {
    setDriverId('')
    setLoadRate('')
    setCutAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setEditingLoad(null)
  }

  const openForm = (load?: Load) => {
    if (load) {
      setEditingLoad(load)
      setDriverId(load.driverId)
      setLoadRate(load.loadRate.toString())
      setCutAmount(load.cutAmount.toString())
      setDate(load.date)
      setNotes(load.notes)
    } else {
      resetForm()
    }
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !driverId || !loadRate) return

    const loadRateNum = parseFloat(loadRate)
    const cutAmountNum = parseFloat(cutAmount) || 0

    const load: Load = {
      id: editingLoad?.id || generateId(),
      userId: user.id,
      driverId,
      loadRate: loadRateNum,
      commission: loadRateNum * (user.commissionRate / 100),
      cutAmount: cutAmountNum,
      cutProfit: cutAmountNum * (user.cutPercentage / 100),
      date,
      notes,
    }

    saveLoad(load)
    setRefreshKey((k) => k + 1)
    setIsFormOpen(false)
    resetForm()
  }

  const handleDelete = (loadId: string) => {
    if (confirm('Are you sure you want to delete this load?')) {
      deleteLoad(loadId)
      setRefreshKey((k) => k + 1)
    }
  }

  const getDriverName = (id: string) => {
    const driver = drivers.find((d) => d.id === id)
    return driver?.name || 'Unknown Driver'
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
          <h1 className="text-3xl font-bold text-foreground">Loads</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track your booked loads
          </p>
        </div>
        <Button
          onClick={() => openForm()}
          className="h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
        >
          <Plus className="h-5 w-5" />
          Add Load
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {monthLoads.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">loads booked</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatCurrency(monthLoads.reduce((sum, l) => sum + l.loadRate, 0))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">this month</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Commission Earned</p>
          <p className="mt-1 text-3xl font-bold text-[#97D3CB]">
            {formatCurrency(monthLoads.reduce((sum, l) => sum + l.commission, 0))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">this month</p>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {editingLoad ? 'Edit Load' : 'Add New Load'}
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
                  Driver
                </label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {drivers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No drivers added yet
                      </SelectItem>
                    ) : (
                      drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Load Rate ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={loadRate}
                    onChange={(e) => setLoadRate(e.target.value)}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Cut Amount ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00 (optional)"
                    value={cutAmount}
                    onChange={(e) => setCutAmount(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 rounded-xl"
                  required
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

              {/* Calculated Values */}
              {loadRate && (
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Calculated Earnings
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Commission ({user.commissionRate}%)
                      </span>
                      <span className="font-semibold text-[#97D3CB]">
                        {formatCurrency(calculatedCommission)}
                      </span>
                    </div>
                    {cutAmount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Cut Profit ({user.cutPercentage}%)
                        </span>
                        <span className="font-semibold text-[#FECE8C]">
                          {formatCurrency(calculatedCutProfit)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Total</span>
                        <span className="text-lg font-bold text-foreground">
                          {formatCurrency(calculatedCommission + calculatedCutProfit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                  disabled={!driverId || !loadRate}
                  className="h-12 flex-1 rounded-xl bg-[#103754] text-white hover:bg-[#103754]/90"
                >
                  {editingLoad ? 'Update Load' : 'Add Load'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loads List */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Loads</h2>
        </div>

        {loads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">No loads yet</p>
            <p className="mt-1 text-muted-foreground">
              Add your first load to start tracking
            </p>
            <Button
              onClick={() => openForm()}
              className="mt-6 h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
            >
              <Plus className="h-5 w-5" />
              Add Load
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {loads.map((load) => (
              <div
                key={load.id}
                className="flex items-center justify-between p-6 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#103754]/10">
                    <Package className="h-6 w-6 text-[#103754]" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {getDriverName(load.driverId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(load.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {load.notes && ` - ${load.notes}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(load.loadRate)}
                    </p>
                    <p className="text-sm text-[#97D3CB]">
                      +{formatCurrency(load.commission + load.cutProfit)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openForm(load)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(load.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-[#F17961]/10 hover:text-[#F17961]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
