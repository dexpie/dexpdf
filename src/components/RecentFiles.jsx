'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { getRecent, clearRecent } from '@/utils/storage'

export default function RecentFiles({ onOpen }) {
    const [items, setItems] = useState([])
    const router = useRouter()
    const { t } = useTranslation()

    useEffect(() => {
        setItems(getRecent())
        const onStorage = () => setItems(getRecent())
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    if (!items || items.length === 0) return null

    return (
        <div className="recent-files" aria-live="polite">
            <div className="recent-header">
                <strong>{t('recent.title')}</strong>
                <button className="recent-clear" onClick={() => { clearRecent(); setItems([]) }}>{t('recent.clear')}</button>
            </div>
            <ul>
                {items.map((it) => (
                    <li key={it.id}>
                        <button className="recent-item" onClick={() => {
                            router.push(`/${it.id}`)
                            if (onOpen) onOpen(it)
                        }}>
                            <span className="recent-name">{it.name || it.id}</span>
                            <span className="recent-time">{new Date(it.time).toLocaleString()}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
