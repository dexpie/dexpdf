'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'dexpdf_history'

export function useFileHistory() {
    const [history, setHistory] = useState([])

    useEffect(() => {
        // Load initial
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setHistory(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse history", e)
            }
        }
    }, [])

    const addToHistory = (fileMetadata) => {
        // fileMetadata: { name, size, type, tool, date, id }
        const newItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...fileMetadata
        }

        const newHistory = [newItem, ...history].slice(0, 50) // Keep last 50
        setHistory(newHistory)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
    }

    const clearHistory = () => {
        setHistory([])
        localStorage.removeItem(STORAGE_KEY)
    }

    return { history, addToHistory, clearHistory }
}
