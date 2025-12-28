import React, { useState, useRef, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Camera, RefreshCw, Trash2, Download, Plus, X, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'

export default function ScanTool() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [scans, setScans] = useState([])
    const [capturing, setCapturing] = useState(false)
    const [error, setError] = useState('')
    const [cameraActive, setCameraActive] = useState(false)

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    const startCamera = async () => {
        try {
            setError('')
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Prefer back camera on mobile
                audio: false
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setCameraActive(true)
        } catch (err) {
            console.error(err)
            setError('Could not access camera. Please allow permissions.')
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setCameraActive(false)
    }

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current

        // Match canvas size to video resolution
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

        setScans(prev => [...prev, {
            id: Date.now(),
            src: dataUrl,
            width: canvas.width,
            height: canvas.height
        }])

        // Visual feedback
        setCapturing(true)
        setTimeout(() => setCapturing(false), 200)
    }

    const removeScan = (index) => {
        setScans(prev => prev.filter((_, i) => i !== index))
    }

    const generatePdf = async () => {
        if (scans.length === 0) return

        try {
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            scans.forEach((scan, i) => {
                if (i > 0) doc.addPage()

                const pageWidth = doc.internal.pageSize.getWidth()
                const pageHeight = doc.internal.pageSize.getHeight()

                // Calculate aspect ratio to fit page
                const ratio = Math.min(pageWidth / scan.width, pageHeight / scan.height)
                const w = scan.width * ratio
                const h = scan.height * ratio

                // Center image
                const x = (pageWidth - w) / 2
                const y = (pageHeight - h) / 2

                doc.addImage(scan.src, 'JPEG', x, y, w, h)
            })

            doc.save('scanned_document.pdf')
            triggerConfetti()
        } catch (err) {
            console.error('PDF Generation failed', err)
            setError('Failed to generate PDF')
        }
    }

    return (
        <ToolLayout title="Scan to PDF" description="Use your camera to scan documents directly to PDF.">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Camera Section */}
                    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-[3/4] flex flex-col">
                        {cameraActive ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover flex-1"
                                />
                                {/* Overlay Flash Effect */}
                                <AnimatePresence>
                                    {capturing && (
                                        <motion.div
                                            initial={{ opacity: 0.8 }}
                                            animate={{ opacity: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-white z-20 pointer-events-none"
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Controls */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-10">
                                    <button onClick={stopCamera} className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 shadow-xl active:scale-95 transition-all flex items-center justify-center"
                                    >
                                        <div className="w-14 h-14 bg-white rounded-full border-2 border-slate-900" />
                                    </button>
                                    <div className="w-12" /> {/* Spacer for centering */}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-white bg-slate-900 p-8 text-center">
                                <Camera className="w-20 h-20 mb-6 text-slate-400" />
                                <h3 className="text-xl font-bold mb-2">Camera Access Needed</h3>
                                <p className="text-slate-400 mb-8 text-sm">Allow camera access to capture documents.</p>
                                <button
                                    onClick={startCamera}
                                    className="px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50"
                                >
                                    Start Scanning
                                </button>
                                {error && <p className="text-red-400 mt-4 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Scanned Pages List */}
                    <div className="flex flex-col h-full bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                                Scanned Pages ({scans.length})
                            </h3>
                            {scans.length > 0 && (
                                <button onClick={() => setScans([])} className="text-xs text-red-500 hover:text-red-600 font-bold">Clear All</button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {scans.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <Plus className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-sm">No pages yet.<br />Start camera to scan.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {scans.map((scan, i) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={scan.id}
                                            className="relative group aspect-[3/4] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                                        >
                                            <img src={scan.src} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                {i + 1}
                                            </div>
                                            <button
                                                onClick={() => removeScan(i)}
                                                className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <button
                                onClick={generatePdf}
                                disabled={scans.length === 0}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
