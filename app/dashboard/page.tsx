'use client'

import { useMemo } from 'react'
import {
  Package,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Moon,
} from 'lucide-react'
import { StatCard } from '@/components/stat-card'
import { ProgressBar } from '@/components/progress-bar'
import { IncomeChart } from '@/components/income-chart'
import { useAuth } from '@/lib/auth-context'
import {
  getLoads,
  getAfterHours,
  isToday,
  isThisMonth,
  formatCurrency,
  type Load,
  type AfterHours,
} from '@/lib/store'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = useMemo(() => {
    if (!user) return null

    const loads = getLoads(user.id)
    const afterHours = getAfterHours(user.id)

    // Today's stats
    const todayLoads = loads.filter((l) => isToday(l.date))
    const todayRevenue = todayLoads.reduce((sum, l) => sum + l.loadRate, 0)
    const todayCommission = todayLoads.reduce((sum, l) => sum + l.commission, 0)

    // This month's stats
    const monthLoads = loads.filter((l) => isThisMonth(l.date))
    const monthAfterHours = afterHours.filter((a) => isThisMonth(a.date))

    const monthRevenue = monthLoads.reduce((sum, l) => sum + l.loadRate, 0)
    const monthCommission = monthLoads.reduce((sum, l) => sum + l.commission, 0)
    const monthCutProfit = monthLoads.reduce((sum, l) => sum + l.cutProfit, 0)
    const monthAfterHoursEarnings = monthAfterHours.reduce(
      (sum, a) => sum + a.shiftValue,
      0
    )

    // Income calculations
    const grossIncome = monthCommission + monthCutProfit + monthAfterHoursEarnings
    const taxAmount = grossIncome * (user.taxPercentage / 100)
    const netIncome = grossIncome - taxAmount

    // Goal progress
    const remaining = Math.max(user.monthlyGoal - netIncome, 0)
    const avgCommissionPerLoad =
      monthLoads.length > 0 ? monthCommission / monthLoads.length : user.averageLoadValue * (user.commissionRate / 100)
    const estimatedLoadsNeeded = avgCommissionPerLoad > 0 ? Math.ceil(remaining / avgCommissionPerLoad) : 0

    // Chart data - last 7 days
    const chartData = generateChartData(loads, afterHours, user.taxPercentage)

    return {
      today: {
        loads: todayLoads.length,
        revenue: todayRevenue,
        commission: todayCommission,
      },
      month: {
        loads: monthLoads.length,
        revenue: monthRevenue,
        commission: monthCommission,
        cutProfit: monthCutProfit,
        afterHours: monthAfterHoursEarnings,
      },
      income: {
        gross: grossIncome,
        net: netIncome,
        tax: taxAmount,
      },
      goal: {
        target: user.monthlyGoal,
        earned: netIncome,
        remaining,
        estimatedLoads: estimatedLoadsNeeded,
      },
      chartData,
    }
  }, [user])

  if (!user || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#97D3CB] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Here is your performance overview.
        </p>
      </div>

      {/* Today's Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Today</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Loads Booked"
            value={stats.today.loads}
            icon={<Package className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.today.revenue)}
            icon={<DollarSign className="h-6 w-6" />}
            variant="secondary"
          />
          <StatCard
            title="Commission"
            value={formatCurrency(stats.today.commission)}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="gold"
          />
        </div>
      </section>

      {/* This Month's Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">This Month</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Loads"
            value={stats.month.loads}
            icon={<Package className="h-6 w-6" />}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.month.revenue)}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard
            title="Commission"
            value={formatCurrency(stats.month.commission)}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="secondary"
          />
          <StatCard
            title="Cut Profit"
            value={formatCurrency(stats.month.cutProfit)}
            icon={<Calendar className="h-6 w-6" />}
            variant="coral"
          />
          <StatCard
            title="After Hours"
            value={formatCurrency(stats.month.afterHours)}
            icon={<Moon className="h-6 w-6" />}
            variant="gold"
          />
        </div>
      </section>

      {/* Income Summary & Goal Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Summary */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Income Summary</h2>
          <p className="text-sm text-muted-foreground">This month overview</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(stats.month.commission)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-muted-foreground">Cut Profit</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(stats.month.cutProfit)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-muted-foreground">After Hours</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(stats.month.afterHours)}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Gross Income</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.income.gross)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Tax ({user.taxPercentage}%)
                </span>
                <span className="text-[#F17961]">
                  -{formatCurrency(stats.income.tax)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#103754] p-4">
                <span className="font-medium text-white">Net Income</span>
                <span className="text-2xl font-bold text-[#97D3CB]">
                  {formatCurrency(stats.income.net)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Monthly Goal</h2>
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FECE8C]/20">
              <Target className="h-6 w-6 text-[#103754]" />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earned</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(stats.goal.earned)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="text-xl font-semibold text-muted-foreground">
                  {formatCurrency(stats.goal.target)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <ProgressBar
                value={stats.goal.earned}
                max={stats.goal.target}
                variant="teal"
                size="lg"
              />
            </div>

            <div className="mt-6 rounded-xl bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Remaining to goal</p>
              <p className="mt-1 text-2xl font-bold text-[#F17961]">
                {formatCurrency(stats.goal.remaining)}
              </p>
              {stats.goal.remaining > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Estimated{' '}
                  <span className="font-semibold text-foreground">
                    {stats.goal.estimatedLoads} loads
                  </span>{' '}
                  needed to reach your goal
                </p>
              )}
              {stats.goal.remaining === 0 && (
                <p className="mt-3 text-sm font-medium text-[#97D3CB]">
                  Congratulations! You have reached your goal!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Earnings Over Time</h2>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
        <div className="mt-4">
          <IncomeChart data={stats.chartData} />
        </div>
      </div>
    </div>
  )
}

function generateChartData(
  loads: Load[],
  afterHours: AfterHours[],
  taxPercentage: number
): Array<{ date: string; earnings: number }> {
  const today = new Date()
  const data: Array<{ date: string; earnings: number }> = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const displayDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const dayLoads = loads.filter((l) => l.date === dateStr)
    const dayAfterHours = afterHours.filter((a) => a.date === dateStr)

    const commission = dayLoads.reduce((sum, l) => sum + l.commission, 0)
    const cutProfit = dayLoads.reduce((sum, l) => sum + l.cutProfit, 0)
    const ahEarnings = dayAfterHours.reduce((sum, a) => sum + a.shiftValue, 0)

    const gross = commission + cutProfit + ahEarnings
    const net = gross - gross * (taxPercentage / 100)

    data.push({ date: displayDate, earnings: Math.round(net) })
  }

  return data
}
