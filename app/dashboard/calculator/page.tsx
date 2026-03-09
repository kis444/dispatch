'use client'

import { useState, useMemo } from 'react'
import { Calculator, TrendingUp, Target, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProgressBar } from '@/components/progress-bar'
import { useAuth } from '@/lib/auth-context'
import {
  getLoads,
  getAfterHours,
  isThisMonth,
  formatCurrency,
} from '@/lib/store'

export default function CalculatorPage() {
  const { user } = useAuth()
  const [customLoadValue, setCustomLoadValue] = useState('')

  const stats = useMemo(() => {
    if (!user) return null

    const loads = getLoads(user.id)
    const afterHours = getAfterHours(user.id)

    const monthLoads = loads.filter((l) => isThisMonth(l.date))
    const monthAfterHours = afterHours.filter((a) => isThisMonth(a.date))

    const monthCommission = monthLoads.reduce((sum, l) => sum + l.commission, 0)
    const monthCutProfit = monthLoads.reduce((sum, l) => sum + l.cutProfit, 0)
    const monthAfterHoursEarnings = monthAfterHours.reduce(
      (sum, a) => sum + a.shiftValue,
      0
    )

    const grossIncome = monthCommission + monthCutProfit + monthAfterHoursEarnings
    const netIncome = grossIncome - grossIncome * (user.taxPercentage / 100)

    return {
      monthLoads: monthLoads.length,
      netIncome,
      remaining: Math.max(user.monthlyGoal - netIncome, 0),
    }
  }, [user])

  const avgLoadValue = useMemo(() => {
    if (customLoadValue) return parseFloat(customLoadValue)
    return user?.averageLoadValue || 1500
  }, [customLoadValue, user])

  const calculations = useMemo(() => {
    if (!user || !stats) return null

    const commissionPerLoad = avgLoadValue * (user.commissionRate / 100)
    const netCommissionPerLoad =
      commissionPerLoad - commissionPerLoad * (user.taxPercentage / 100)

    const loadsNeeded =
      netCommissionPerLoad > 0
        ? Math.ceil(stats.remaining / netCommissionPerLoad)
        : 0

    const today = new Date()
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate()
    const daysRemaining = daysInMonth - today.getDate() + 1

    const loadsPerDay = daysRemaining > 0 ? loadsNeeded / daysRemaining : 0

    return {
      commissionPerLoad,
      netCommissionPerLoad,
      loadsNeeded,
      daysRemaining,
      loadsPerDay,
    }
  }, [user, stats, avgLoadValue])

  if (!user || !stats || !calculations) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#97D3CB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Goal Calculator</h1>
        <p className="mt-1 text-muted-foreground">
          Calculate how many loads you need to reach your monthly goal
        </p>
      </div>

      {/* Current Progress */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Current Progress</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Monthly Goal</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatCurrency(user.monthlyGoal)}
            </p>
          </div>
          <div className="rounded-xl bg-[#97D3CB]/10 p-4">
            <p className="text-sm text-muted-foreground">Earned So Far</p>
            <p className="mt-1 text-2xl font-bold text-[#97D3CB]">
              {formatCurrency(stats.netIncome)}
            </p>
          </div>
          <div className="rounded-xl bg-[#F17961]/10 p-4">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="mt-1 text-2xl font-bold text-[#F17961]">
              {formatCurrency(stats.remaining)}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar
            value={stats.netIncome}
            max={user.monthlyGoal}
            variant="teal"
            size="lg"
          />
        </div>
      </div>

      {/* Calculator */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FECE8C]/20">
              <Calculator className="h-6 w-6 text-[#103754]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Average Load Value
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your typical load rate
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Load Value ($)
              </label>
              <Input
                type="number"
                step="1"
                placeholder={user.averageLoadValue.toString()}
                value={customLoadValue}
                onChange={(e) => setCustomLoadValue(e.target.value)}
                className="h-14 rounded-xl text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Default from settings: ${user.averageLoadValue}
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Commission Rate
                </span>
                <span className="font-medium text-foreground">
                  {user.commissionRate}%
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tax Rate</span>
                <span className="font-medium text-foreground">
                  {user.taxPercentage}%
                </span>
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Net Per Load
                  </span>
                  <span className="text-lg font-bold text-[#97D3CB]">
                    {formatCurrency(calculations.netCommissionPerLoad)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#103754]/10">
              <Target className="h-6 w-6 text-[#103754]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Loads Needed
              </h2>
              <p className="text-sm text-muted-foreground">
                To reach your monthly goal
              </p>
            </div>
          </div>

          {stats.remaining === 0 ? (
            <div className="mt-6 rounded-xl bg-[#97D3CB]/10 p-6 text-center">
              <p className="text-lg font-semibold text-[#97D3CB]">
                Congratulations!
              </p>
              <p className="mt-1 text-muted-foreground">
                You have already reached your monthly goal!
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="rounded-xl bg-[#103754] p-6 text-center">
                <p className="text-sm text-white/70">Estimated loads needed</p>
                <p className="mt-2 text-5xl font-bold text-white">
                  {calculations.loadsNeeded}
                </p>
                <p className="mt-2 text-sm text-white/70">loads remaining</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Days Left
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {calculations.daysRemaining}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Loads/Day
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {calculations.loadsPerDay.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#FECE8C]/30 bg-[#FECE8C]/10 p-4">
                <p className="text-sm text-foreground">
                  You need about{' '}
                  <span className="font-bold">{calculations.loadsNeeded} loads</span>{' '}
                  this month (~
                  <span className="font-bold">
                    {calculations.loadsPerDay.toFixed(1)} loads per day
                  </span>
                  ) to reach your goal of{' '}
                  <span className="font-bold">
                    {formatCurrency(user.monthlyGoal)}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Breakdown by Load Value
        </h2>
        <p className="text-sm text-muted-foreground">
          How many loads you would need at different rates
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1000, 1500, 2000, 2500].map((loadValue) => {
            const commission = loadValue * (user.commissionRate / 100)
            const netCommission =
              commission - commission * (user.taxPercentage / 100)
            const loadsNeeded =
              netCommission > 0
                ? Math.ceil(stats.remaining / netCommission)
                : 0

            return (
              <div
                key={loadValue}
                className="rounded-xl bg-muted/50 p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  ${loadValue} loads
                </p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {loadsNeeded}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(netCommission)}/load
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
