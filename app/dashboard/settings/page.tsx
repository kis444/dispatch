'use client'

import { useState, useEffect } from 'react'
import { Settings, Percent, DollarSign, Target, Moon, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
  const { user, updateSettings } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Form state
  const [commissionRate, setCommissionRate] = useState('')
  const [cutPercentage, setCutPercentage] = useState('')
  const [taxPercentage, setTaxPercentage] = useState('')
  const [monthlyGoal, setMonthlyGoal] = useState('')
  const [defaultAfterHoursValue, setDefaultAfterHoursValue] = useState('')
  const [averageLoadValue, setAverageLoadValue] = useState('')

  useEffect(() => {
    if (user) {
      setCommissionRate(user.commissionRate.toString())
      setCutPercentage(user.cutPercentage.toString())
      setTaxPercentage(user.taxPercentage.toString())
      setMonthlyGoal(user.monthlyGoal.toString())
      setDefaultAfterHoursValue(user.defaultAfterHoursValue.toString())
      setAverageLoadValue(user.averageLoadValue.toString())
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)

    updateSettings({
      commissionRate: parseFloat(commissionRate) || user.commissionRate,
      cutPercentage: parseFloat(cutPercentage) || user.cutPercentage,
      taxPercentage: parseFloat(taxPercentage) || user.taxPercentage,
      monthlyGoal: parseFloat(monthlyGoal) || user.monthlyGoal,
      defaultAfterHoursValue:
        parseFloat(defaultAfterHoursValue) || user.defaultAfterHoursValue,
      averageLoadValue: parseFloat(averageLoadValue) || user.averageLoadValue,
    })

    setIsSaving(false)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
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
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure your rates and preferences
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 gap-2 rounded-xl bg-[#103754] px-5 text-white hover:bg-[#103754]/90"
        >
          {showSaved ? (
            <>
              <Check className="h-5 w-5" />
              Saved
            </>
          ) : isSaving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground">Your account information</p>

        <div className="mt-6">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-1 font-medium text-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#97D3CB]/20">
            <Percent className="h-6 w-6 text-[#103754]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Commission Rates
            </h2>
            <p className="text-sm text-muted-foreground">
              Set your earning percentages
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Commission Rate (%)
            </label>
            <Input
              type="number"
              step="0.1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Percentage of load rate you earn
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Cut Percentage (%)
            </label>
            <Input
              type="number"
              step="0.1"
              value={cutPercentage}
              onChange={(e) => setCutPercentage(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Your share of cut amounts
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tax Rate (%)
            </label>
            <Input
              type="number"
              step="0.1"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Estimated tax percentage
            </p>
          </div>
        </div>
      </div>

      {/* Income Goals */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FECE8C]/20">
            <Target className="h-6 w-6 text-[#103754]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Income Goals
            </h2>
            <p className="text-sm text-muted-foreground">
              Set your monthly targets
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Monthly Goal ($)
            </label>
            <Input
              type="number"
              step="100"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Your target net income per month
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Average Load Value ($)
            </label>
            <Input
              type="number"
              step="100"
              value={averageLoadValue}
              onChange={(e) => setAverageLoadValue(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Used for goal calculations
            </p>
          </div>
        </div>
      </div>

      {/* After Hours */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F17961]/20">
            <Moon className="h-6 w-6 text-[#103754]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              After Hours
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure default shift values
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="max-w-sm space-y-2">
            <label className="text-sm font-medium text-foreground">
              Default Shift Value ($)
            </label>
            <Input
              type="number"
              step="5"
              value={defaultAfterHoursValue}
              onChange={(e) => setDefaultAfterHoursValue(e.target.value)}
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled when adding after-hours entries
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="rounded-2xl border border-[#97D3CB]/30 bg-[#97D3CB]/10 p-6">
        <h3 className="font-semibold text-foreground">How Your Earnings Work</h3>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Commission:</span> Load
            Rate x {commissionRate || user.commissionRate}% = Your Commission
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Cut Profit:</span> Cut
            Amount x {cutPercentage || user.cutPercentage}% = Your Cut Profit
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Gross Income:</span>{' '}
            Commission + Cut Profit + After Hours
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Net Income:</span> Gross
            Income - {taxPercentage || user.taxPercentage}% Tax
          </p>
        </div>
      </div>
    </div>
  )
}
