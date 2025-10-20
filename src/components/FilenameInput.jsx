import React from 'react'

export default function FilenameInput({
    value,
    onChange,
    disabled = false,
    placeholder = 'output',
    label = 'Nama File Output (opsional):',
    helperText = 'Kosongkan untuk menggunakan nama default. Ekstensi .pdf akan ditambahkan otomatis.'
}) {
    return (
        <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {helperText}
            </div>
        </div>
    )
}
