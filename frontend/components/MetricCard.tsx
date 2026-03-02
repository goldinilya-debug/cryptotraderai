import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  highlight?: boolean
  valueColor?: string
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  highlight,
  valueColor = 'text-white'
}: MetricCardProps) {
  return (
    <div className={`rounded-xl p-4 border ${
      highlight 
        ? 'bg-primary/10 border-primary/30' 
        : 'bg-surface border-surface-light'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted mb-1">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className="text-xs text-muted mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${
          highlight ? 'bg-primary/20' : 'bg-surface-light'
        }`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-primary' : 'text-muted'}`} />
        </div>
      </div>
    </div>
  )
}
