import React from 'react'
import { Cloud, Laptop, Server } from 'lucide-react'
import { getToolProcessingBadges } from '@/config/toolMetadata'

const BADGE_STYLES = {
  Local: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  'Cloud/AI': 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  Server: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300',
}

const BADGE_ICONS = {
  Local: Laptop,
  'Cloud/AI': Cloud,
  Server,
}

export default function ToolProcessingBadge({ tool, compact = false }) {
  const badges = getToolProcessingBadges(tool)

  return (
    <div className="flex flex-wrap gap-1.5" aria-label={`Processing: ${badges.join(' and ')}`}>
      {badges.map(label => {
        const Icon = BADGE_ICONS[label]
        return (
          <span
            key={label}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${BADGE_STYLES[label] || 'border-border bg-secondary text-muted-foreground'}`}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {compact && label === 'Cloud/AI' ? 'Cloud' : label}
          </span>
        )
      })}
    </div>
  )
}

