import React from 'react'

/**
 * FilenameInput - Input component for output filename
 * @param {string} props.value - Current filename value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disable input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {string} props.helperText - Helper text below input
 */
export default function FilenameInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'output',
  label = 'Output Filename',
  helperText = 'The .pdf extension will be added automatically'
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border border-[rgba(243,239,228,0.16)] bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
      />
      {helperText && (
        <p className="text-xs text-muted-foreground mt-2">
          {helperText}
        </p>
      )}
    </div>
  )
}