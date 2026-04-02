import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Category-based color styling
 */
const CATEGORY_STYLES = {
  organize: {
    base: 'text-red-600',
    bg: 'bg-red-50',
    border: 'group-hover:border-red-200',
    icon: 'text-red-600',
    hover: 'hover:shadow-red-100'
  },
  convert: {
    base: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'group-hover:border-blue-200',
    icon: 'text-blue-600',
    hover: 'hover:shadow-blue-100'
  },
  security: {
    base: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'group-hover:border-slate-300',
    icon: 'text-slate-600',
    hover: 'hover:shadow-slate-100'
  },
  create: {
    base: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'group-hover:border-indigo-200',
    icon: 'text-indigo-600',
    hover: 'hover:shadow-indigo-100'
  },
  default: {
    base: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'group-hover:border-slate-300',
    icon: 'text-slate-600',
    hover: 'hover:shadow-slate-100'
  }
}

/**
 * ToolCard - Individual tool card component
 * Displays tool icon, title, and description with hover effects
 */
export default function ToolCard({ tool }) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default

  return (
    <Link href={`/${tool.id}`} className="block h-full">
      <div
        className={`
          group relative h-full p-5 rounded-xl
          bg-card border border-border
          transition-all duration-300 ease-out
          ${styles.border} ${styles.hover}
          hover:-translate-y-1 hover:shadow-lg
          flex flex-col items-start gap-3
        `}
      >
        {/* Header: Icon & Title */}
        <div className="flex items-center gap-3 w-full">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.bg} ${styles.icon} transition-transform duration-300 group-hover:scale-110`}>
            <tool.icon strokeWidth={2} className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground line-clamp-1">
            {tool.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Action Hint - Appears on hover */}
        <div className="mt-auto pt-1 flex items-center text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 text-muted-foreground group-hover:text-foreground">
          <span>Open</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  )
}