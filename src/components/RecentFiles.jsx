import React, { useEffect, useState } from 'react'
import { getRecent, clearRecent } from '../utils/storage'

export default function RecentFiles({ onOpen }) {
    const [items, setItems] = useState([])

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
                <strong>Recent</strong>
                <button className="recent-clear" onClick={() => { clearRecent(); setItems([]) }}>Clear</button>
            </div>
            <ul>
                {items.map((it) => (
                    <li key={it.id}>
                        <button className="recent-item" onClick={() => onOpen(it)}>
                            <span className="recent-name">{it.name || it.id}</span>
                            <span className="recent-time">{new Date(it.time).toLocaleString()}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
