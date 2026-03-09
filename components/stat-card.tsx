'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'primary' | 'secondary' | 'coral' | 'gold'
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border border-border',
    primary: 'bg-[#103754] text-white border-none',
    secondary: 'bg-[#97D3CB]/10 border border-[#97D3CB]/30',
    coral: 'bg-[#F17961]/10 border border-[#F17961]/30',
    gold: 'bg-[#FECE8C]/10 border border-[#FECE8C]/30',
  }

  const iconVariantStyles = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-white/10 text-white',
    secondary: 'bg-[#97D3CB]/20 text-[#103754]',
    coral: 'bg-[#F17961]/20 text-[#F17961]',
    gold: 'bg-[#FECE8C]/30 text-[#103754]',
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'primary' ? 'text-white/70' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight',
              variant === 'primary' ? 'text-white' : 'text-foreground'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'mt-1 text-sm',
                variant === 'primary' ? 'text-white/60' : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-[#F17961]',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '+'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              iconVariantStyles[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
