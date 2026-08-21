import React from 'react'
import { Button } from '@/components/ui/button'

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
        <Button
          type="button"
          variant="outline"
          onClick={onSecondary}
          disabled={disabled || loading}
          className={secondaryClassName}
        >
          {secondaryText}
        </Button>
      )}
      {onPrimary && (
        <Button
          type="button"
          variant={danger ? 'destructive' : 'default'}
          onClick={onPrimary}
          disabled={disabled || loading}
          className={primaryClassName}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
              Processing...
            </>
          ) : (
            <>
              {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
              {primaryText}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
