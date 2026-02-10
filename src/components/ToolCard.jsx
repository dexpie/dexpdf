import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// iLovePDF-style Semantic Mapping with dark mode support
const CATEGORY_STYLES = {
  pdf: {
    base: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'group-hover:border-red-500 dark:group-hover:border-red-400',
    shadow: 'group-hover:shadow-red-100 dark:group-hover:shadow-red-900/20',
    icon: 'text-red-600 dark:text-red-400'
  },
  image: {
    base: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'group-hover:border-blue-600 dark:group-hover:border-blue-400',
    shadow: 'group-hover:shadow-blue-100 dark:group-hover:shadow-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  text: {
    base: 'text-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-700/50',
    border: 'group-hover:border-slate-500 dark:group-hover:border-slate-400',
    shadow: 'group-hover:shadow-slate-100 dark:group-hover:shadow-slate-900/20',
    icon: 'text-slate-600 dark:text-slate-400'
  },
  dev: {
    base: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'group-hover:border-purple-500 dark:group-hover:border-purple-400',
    shadow: 'group-hover:shadow-purple-100 dark:group-hover:shadow-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400'
  },
  web: {
    base: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    border: 'group-hover:border-cyan-500 dark:group-hover:border-cyan-400',
    shadow: 'group-hover:shadow-cyan-100 dark:group-hover:shadow-cyan-900/20',
    icon: 'text-cyan-600 dark:text-cyan-400'
  },
  finance: {
    base: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'group-hover:border-emerald-500 dark:group-hover:border-emerald-400',
    shadow: 'group-hover:shadow-emerald-100 dark:group-hover:shadow-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  math: {
    base: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'group-hover:border-emerald-500 dark:group-hover:border-emerald-400',
    shadow: 'group-hover:shadow-emerald-100 dark:group-hover:shadow-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  time: {
    base: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    border: 'group-hover:border-orange-500 dark:group-hover:border-orange-400',
    shadow: 'group-hover:shadow-orange-100 dark:group-hover:shadow-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400'
  },
  fun: {
    base: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-900/30',
    border: 'group-hover:border-pink-500 dark:group-hover:border-pink-400',
    shadow: 'group-hover:shadow-pink-100 dark:group-hover:shadow-pink-900/20',
    icon: 'text-pink-600 dark:text-pink-400'
  },
  default: {
    base: 'text-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-700/50',
    border: 'group-hover:border-slate-400 dark:group-hover:border-slate-500',
    shadow: 'group-hover:shadow-slate-100 dark:group-hover:shadow-slate-900/20',
    icon: 'text-slate-600 dark:text-slate-400'
  }
}

export default function ToolCard({ tool }) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.default

  return (
    <Link href={`/${tool.id}`} className="block h-full">
      <div
        className={`
          group relative h-full p-6 rounded-xl
          bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700
          transition-all duration-200 ease-out 
          ${styles.border} hover:-translate-y-1 hover:shadow-xl ${styles.shadow}
          flex flex-col items-start gap-4
        `}
      >
        {/* Header: Icon & Big Title */}
        <div className="flex items-center gap-4 w-full">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${styles.bg} ${styles.icon} transition-transform group-hover:scale-110 duration-200`}>
            <tool.icon strokeWidth={2.5} className="w-6 h-6" />
          </div>
          <h3 className={`text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:${styles.base} transition-colors line-clamp-1`}>
            {tool.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">
          {tool.description}
        </p>

        {/* Action Hint (Hidden by default, appears on hover) */}
        <div className="mt-auto pt-2 flex items-center text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">
          <span>Open Tool</span>
          <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
