'use client'
import { useState, useEffect, useCallback } from 'react'

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

    const generateOpId = () => {
        return 'OP-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }

    const addToHistory = useCallback((fileMetadata) => {
        // fileMetadata: { name, size, type, tool, date, id }
        const newItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            opId: generateOpId(),
            ...fileMetadata
        }

        setHistory(previous => {
            const newHistory = [newItem, ...previous].slice(0, 50)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
            return newHistory
        })
    }, [])

    const clearHistory = useCallback(() => {
        setHistory([])
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    const exportHistory = useCallback(() => {
        return history
    }, [history])

    const importHistory = useCallback((incoming) => {
        if (!Array.isArray(incoming)) return { added: 0, skipped: 0 }
        const existingIds = new Set(history.map(item => item.id))
        const valid = incoming.filter(item =>
            item && typeof item === 'object' && item.name && item.tool && !existingIds.has(String(item.id))
        )
        const merged = [...valid, ...history].slice(0, 50)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        setHistory(merged)
        return { added: valid.length, skipped: incoming.length - valid.length }
    }, [history])

    return { history, addToHistory, clearHistory, exportHistory, importHistory }
}
