import React from 'react'
import { Cloud, Laptop } from 'lucide-react'

export default function CloudConversionOption({ value, onChange, disabled = false }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-secondary/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-foreground">Conversion engine</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Cloud keeps complex office layouts more faithfully; browser mode keeps the file local.</p>
        </div>
        <div className="grid shrink-0 grid-cols-2 rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => onChange('local')}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${value === 'local' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Laptop className="h-3.5 w-3.5" /> Local
          </button>
          <button
            type="button"
            onClick={() => onChange('cloud')}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${value === 'cloud' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Cloud className="h-3.5 w-3.5" /> Cloud
          </button>
        </div>
      </div>
      {value === 'cloud' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
          Cloud mode uploads this file to the configured conversion provider. Use Local for confidential documents or when the server token is unavailable.
        </div>
      )}
    </div>
  )
}
