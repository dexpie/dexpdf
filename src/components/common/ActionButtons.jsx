import React from 'react'

export default function ActionButtons({
    primaryText,
    onPrimary,
    secondaryText,
    onSecondary,
    disabled = false,
    loading = false,
    danger = false
}) {
    return (
        <div className="action-buttons">
            {onSecondary && (
                <button
                    className="btn-secondary"
                    onClick={onSecondary}
                    disabled={disabled || loading}
                >
                    {secondaryText}
                </button>
            )}
            {onPrimary && (
                <button
                    className={`btn-primary ${danger ? 'btn-danger' : ''}`}
                    onClick={onPrimary}
                    disabled={disabled || loading}
                >
                    {loading ? (
                        <span className="spinner-sm" aria-hidden="true" />
                    ) : null}
                    {loading ? 'Processing...' : primaryText}
                </button>
            )}
        </div>
    )
}
