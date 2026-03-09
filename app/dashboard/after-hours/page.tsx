'use client'

import { useState, useMemo } from 'react'
import { Plus, Moon, Trash2, Edit2, X } from 'lucide-react'
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
  getAfterHours,
  getDrivers,
  saveAfterHours,
  deleteAfterHours,
  generateId,
  formatCurrency,
  isThisMonth,
  type AfterHours,
} from '@/lib/store'

export default function AfterHoursPage() {
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AfterHours | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form state
  const [driverId, setDriverId] = useState('')
  const [shiftValue, setShiftValue] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const drivers = useMemo(() => {
    if (!user) return []
    return getDrivers(user.id)
  }, [user])

  const entries = useMemo(() => {
    if (!user) return []
    return getAfterHours(user.id).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshKey])

  const monthEntries = useMemo(() => {
    return entries.filter((e) => isThisMonth(e.date))
  }, [entries])

  const resetForm = () => {
    setDriverId('')
    setShiftValue(user?.defaultAfterHoursValue.toString() || '100')
    setDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setEditingEntry(null)
  }

  const openForm = (entry?: AfterHours) => {
    if (entry) {
      setEditingEntry(entry)
      setDriverId(entry.driverId || '')
      setShiftValue(entry.shiftValue.toString())
      setDate(entry.date)
      setNotes(entry.notes)
    } else {
      resetForm()
    }
    setIsFormOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !shiftValue) return

    const entry: AfterHours = {
      id: editingEntry?.id || generateId(),
      userId: user.id,
      driverId: driverId || undefined,
      shiftValue: parseFloat(shiftValue),
      date,
      notes,
    }

    saveAfterHours(entry)
    setRefreshKey((k) => k + 1)
    setIsFormOpen(false)
    resetForm()
  }

  const handleDelete = (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteAfterHours(entryId)
      setRefreshKey((k) => k + 1)
    }
  }

  const getDriverName = (id?: string) => {
    if (!id) return 'No driver assigned'
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
          <h1 className="text-3xl font-bold text-foreground">After Hours</h1>
          <p className="mt-1 text-muted-foreground">
            Track your after-hours shift earnings
          </p>
        </div>
        <Button
          onClick={() => openForm()}
          className="h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
        >
          <Plus className="h-5 w-5" />
          Add Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {monthEntries.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">shifts worked</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Earnings</p>
          <p className="mt-1 text-3xl font-bold text-[#FECE8C]">
            {formatCurrency(monthEntries.reduce((sum, e) => sum + e.shiftValue, 0))}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">this month</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Average Per Shift</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {formatCurrency(
              monthEntries.length > 0
                ? monthEntries.reduce((sum, e) => sum + e.shiftValue, 0) /
                    monthEntries.length
                : 0
            )}
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
                {editingEntry ? 'Edit Entry' : 'Add After Hours Entry'}
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
                  Driver (Optional)
                </label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select a driver (optional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">No driver</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Shift Value ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={user.defaultAfterHoursValue.toString()}
                  value={shiftValue}
                  onChange={(e) => setShiftValue(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default: ${user.defaultAfterHoursValue}
                </p>
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
                  disabled={!shiftValue}
                  className="h-12 flex-1 rounded-xl bg-[#103754] text-white hover:bg-[#103754]/90"
                >
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Entries</h2>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Moon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">
              No entries yet
            </p>
            <p className="mt-1 text-muted-foreground">
              Add your first after-hours shift
            </p>
            <Button
              onClick={() => openForm()}
              className="mt-6 h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
            >
              <Plus className="h-5 w-5" />
              Add Entry
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-6 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FECE8C]/20">
                    <Moon className="h-6 w-6 text-[#103754]" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {getDriverName(entry.driverId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {entry.notes && ` - ${entry.notes}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-xl font-bold text-[#FECE8C]">
                    {formatCurrency(entry.shiftValue)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openForm(entry)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
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
