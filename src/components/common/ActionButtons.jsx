import React from 'react'

/**
 * ActionButtons - Standard action buttons for tool pages
 * @param {string} props.primaryText - Primary button text
 * @param {Function} props.onPrimary - Primary button handler
 * @param {string} props.secondaryText - Secondary button text
 * @param {Function} props.onSecondary - Secondary button handler
 * @param {boolean} props.disabled - Disable all buttons
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.danger - Use danger styling for primary
 */
export default function ActionButtons({
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
  disabled = false,
  loading = false,
  danger = false,
  primaryIcon,
  icon,
  className = '',
  primaryClassName = '',
  secondaryClassName = '',
}) {
  const PrimaryIcon = primaryIcon || icon

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          disabled={disabled || loading}
          className={`min-h-11 px-5 py-2.5 font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${secondaryClassName}`}
        >
          {secondaryText}
        </button>
      )}
      {onPrimary && (
        <button
          type="button"
          onClick={onPrimary}
          disabled={disabled || loading}
          className={`
            min-h-11 px-6 py-2.5 font-bold rounded-xl transition-all
            flex items-center justify-center gap-2
            ${danger
              ? 'bg-destructive text-destructive-foreground hover:opacity-90'
              : 'bg-primary text-primary-foreground hover:opacity-90'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${primaryClassName}
          `}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-current/30 border-current rounded-full animate-spin" />
          )}
          {!loading && PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
          {loading ? 'Processing...' : primaryText}
        </button>
      )}
    </div>
  )
}
