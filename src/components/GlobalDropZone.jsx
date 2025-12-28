'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Image as ImageIcon, X, Zap,
    Scissors, Minimize2, Edit, FileSpreadsheet
} from 'lucide-react'

export default function GlobalDropZone() {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const [dragType, setDragType] = useState(null) // 'pdf', 'image', 'other'

    useEffect(() => {
        const handleDragOver = (e) => {
            e.preventDefault()
            e.stopPropagation()

            // Try to detect type (not always available in dragover)
            const items = e.dataTransfer.items
            if (items && items.length > 0) {
                const type = items[0].type
                if (type === 'application/pdf') setDragType('pdf')
                else if (type.startsWith('image/')) setDragType('image')
                else setDragType('other')
            }

            setIsDragging(true)
        }

        const handleDragLeave = (e) => {
            e.preventDefault()
            e.stopPropagation()
            // Only hide if leaving the window
            if (e.clientX === 0 && e.clientY === 0) {
                setIsDragging(false)
                setDragType(null)
            }
        }

        const handleDrop = (e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            setDragType(null)

            // Logic to handle file drop globally can go here 
            // OR we just intercept it in specific tool zones if we want.
            // But "Smart Drop" suggests we Route them.

            const files = e.dataTransfer.files
            if (files && files.length > 0) {
                // Determine best tool
                const file = files[0]
                if (file.type === 'application/pdf') {
                    // Open a modal or route to a "Lobby"?
                    // For now, let's just log or maybe route to a default tool?
                    // Ideally we show the "Quick Menu" *before* drop, but we can't interact with buttons while dragging file.
                    // So: Drop -> Show Menu Modal with file pre-loaded?
                    // That's complex state management.

                    // Simpler: Just highlight the tools in the grid?
                }
            }
        }

        // To make this robust, we usually put this on 'window'
        window.addEventListener('dragover', handleDragOver)
        window.addEventListener('dragleave', handleDragLeave)
        window.addEventListener('drop', handleDrop)

        return () => {
            window.removeEventListener('dragover', handleDragOver)
            window.removeEventListener('dragleave', handleDragLeave)
            window.removeEventListener('drop', handleDrop)
        }
    }, [])

    // Since we can't click buttons while dragging a file, the "Drop Zone" 
    // must visually divide the screen into "Actions".

    // E.g. Top Left: Merge, Top Right: Compress, etc.

    if (!isDragging) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            {/* We divide screen into zones */}

            {/* Center Info */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-white">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-bounce">
                        {dragType === 'pdf' ? <FileText className="w-10 h-10" /> :
                            dragType === 'image' ? <ImageIcon className="w-10 h-10" /> :
                                <Zap className="w-10 h-10 text-yellow-300" />}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Drop to Equip</h2>
                    <p className="text-slate-400">Drag to a zone to activate tool</p>
                </motion.div>
            </div>

            {/* Smart Zones (only mock visual for now as actual file routing logic requires context) */}
            {/* In a real implementation, 'drop' event on these divs triggers the route with file state */}

            {/* Compress Zone (Left) */}
            <div className="absolute left-0 top-0 bottom-0 w-1/3 border-r-2 border-dashed border-white/20 hover:bg-green-600/20 transition-colors flex items-center justify-center group">
                <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Minimize2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Compress</h3>
                </div>
            </div>

            {/* Edit Zone (Right) */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 border-l-2 border-dashed border-white/20 hover:bg-purple-600/20 transition-colors flex items-center justify-center group">
                <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Edit / Sign</h3>
                </div>
            </div>

            {/* Merge/Split (Top) */}
            <div className="absolute top-0 left-1/3 right-1/3 h-1/2 border-b-2 border-dashed border-white/20 hover:bg-blue-600/20 transition-colors flex items-center justify-center group">
                <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Zap className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Merge</h3>
                </div>
            </div>

            {/* Split (Bottom) */}
            <div className="absolute bottom-0 left-1/3 right-1/3 h-1/2 border-t-2 border-dashed border-white/20 hover:bg-pink-600/20 transition-colors flex items-center justify-center group">
                <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                    <Scissors className="w-16 h-16 mx-auto text-pink-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Split</h3>
                </div>
            </div>

            <div className="absolute bottom-10 text-white/50 text-sm">
                Release to Cancel
            </div>
        </div>
    )
}
