import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Category styles
const CATEGORY_STYLES = {
  organize: {
    base: 'text-red-600',
    bg: 'bg-red-50',
    border: 'group-hover:border-red-400',
    icon: 'text-red-600'
  },
  convert: {
    base: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'group-hover:border-blue-400',
    icon: 'text-blue-600'
  },
  security: {
    base: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'group-hover:border-slate-400',
    icon: 'text-slate-600'
  },
  create: {
    base: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'group-hover:border-indigo-400',
    icon: 'text-indigo-600'
  },
  default: {
    base: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'group-hover:border-slate-400',
    icon: 'text-slate-600'
  }
}

export default function ToolCard({ tool }) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default

  return (
    <Link href={`/${tool.id}`} className="block h-full">
      <div
        className={`
          group relative h-full p-5 rounded-xl
          bg-white border border-slate-200
          transition-all duration-200 ease-out 
          ${styles.border} hover:-translate-y-0.5 hover:shadow-md
          flex flex-col items-start gap-3
        `}
      >
        {/* Header: Icon & Title */}
        <div className="flex items-center gap-3 w-full">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.bg} ${styles.icon}`}>
            <tool.icon strokeWidth={2.5} className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-800 line-clamp-1">
            {tool.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Action Hint */}
        <div className="mt-auto pt-1 flex items-center text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 group-hover:text-slate-600">
          <span>Open</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  )
}
