'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Download, Award, PenTool, Type, Calendar, User
} from 'lucide-react'
import html2canvas from 'html2canvas'
import ToolLayout from '../components/common/ToolLayout'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'

// --- Default Data ---
const DEFAULT_CERT = {
    recipient: 'Jane Doe',
    title: 'Certificate of Achievement',
    subtitle: 'This certificate is proudly presented to',
    course: 'Advanced React Development',
    description: 'For successfully completing the comprehensive course on modern web development with high distinction.',
    date: new Date().toISOString().split('T')[0],
    signature: 'Albus Dumbledore',
    signatureTitle: 'Headmaster'
}

export default function CertificateMakerTool() {
    const [data, setData] = useState(DEFAULT_CERT)
    const [theme, setTheme] = useState('gold') // gold, blue, classic
    const [busy, setBusy] = useState(false)
    const [outputFileName, setOutputFileName] = useState('certificate')

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('dexpdf_cert_draft')
        if (saved) try { setData(JSON.parse(saved)) } catch (e) { }
    }, [])

    useEffect(() => {
        localStorage.setItem('dexpdf_cert_draft', JSON.stringify(data))
    }, [data])

    const updateField = (field, val) => setData(prev => ({ ...prev, [field]: val }))

    // --- PDF Generation ---
    const previewRef = useRef(null)

    async function generatePdf() {
        if (!previewRef.current) return
        setBusy(true)
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')
            const { jsPDF } = await import('jspdf')
            // Landscape A4
            const pdf = new jsPDF('l', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 297
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(getOutputFilename(outputFileName, 'certificate'))
            triggerConfetti()
        } catch (err) {
            console.error(err)
            alert('Failed to generate PDF')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Certificate Maker" description="Design professional certificates for awards and courses.">
            {/* Font Loader */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap');
            `}</style>

            <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
                {/* Editor Column */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                            <PenTool className="w-5 h-5" /> Details
                        </h3>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                    <input className="input-field mt-1" value={data.title} onChange={e => updateField('title', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Subtitle</label>
                                    <input className="input-field mt-1" value={data.subtitle} onChange={e => updateField('subtitle', e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Recipient Name</label>
                                <input className="input-field mt-1 text-lg font-bold" value={data.recipient} onChange={e => updateField('recipient', e.target.value)} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Course / Award Name</label>
                                <input className="input-field mt-1" value={data.course} onChange={e => updateField('course', e.target.value)} />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <textarea className="input-field mt-1 h-20" value={data.description} onChange={e => updateField('description', e.target.value)} />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                                    <input type="date" className="input-field mt-1" value={data.date} onChange={e => updateField('date', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Signature Name</label>
                                    <input className="input-field mt-1" value={data.signature} onChange={e => updateField('signature', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Sign Title</label>
                                    <input className="input-field mt-1" value={data.signatureTitle} onChange={e => updateField('signatureTitle', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="xl:w-[700px] flex flex-col gap-6 sticky top-8 h-fit">

                    {/* Controls */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex gap-4 mb-6">
                            {['gold', 'blue', 'classic'].map(t => (
                                <button key={t} onClick={() => setTheme(t)} className={`flex-1 p-2 capitalize rounded-lg border-2 font-bold text-sm transition-all ${theme === t ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="mb-4">
                            <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} />
                        </div>
                        <ActionButtons primaryText="Download Certificate" primaryIcon={Download} onPrimary={generatePdf} loading={busy} />
                    </div>

                    {/* Preview Area (Scaled) */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-500/10 p-4 flex justify-center">
                        <div className="origin-top transform scale-[0.45] sm:scale-[0.6] xl:scale-[0.65]" style={{ height: 500, width: '297mm' }}>
                            <div ref={previewRef} className={`bg-white shadow-2xl mx-auto text-slate-800 relative flex flex-col justify-center items-center text-center p-20
                                ${theme === 'gold' ? 'border-[20px] border-double border-yellow-600' : ''}
                                ${theme === 'blue' ? 'border-[20px] border-solid border-blue-900' : ''}
                                ${theme === 'classic' ? 'border-[2px] border-black outline outline-4 outline-offset-4 outline-black' : ''}
                             `}
                                style={{
                                    width: '297mm',
                                    height: '210mm',
                                }}
                            >
                                {/* Watermark/BG Decoration */}
                                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                                    <Award className="w-96 h-96" />
                                </div>

                                <div className="relative z-10 w-full max-w-4xl space-y-6">
                                    <h1 className="text-6xl text-slate-900" style={{ fontFamily: '"Cinzel", serif' }}>
                                        {data.title}
                                    </h1>

                                    <div className="text-xl text-slate-500 italic font-light" style={{ fontFamily: '"Lato", sans-serif' }}>
                                        {data.subtitle}
                                    </div>

                                    <div className="py-8">
                                        <div className="text-7xl text-blue-600" style={{ fontFamily: '"Great Vibes", cursive' }}>
                                            {data.recipient}
                                        </div>
                                        <div className="h-0.5 w-2/3 max-w-lg bg-slate-200 mx-auto mt-4"></div>
                                    </div>

                                    <div className="text-2xl font-bold text-slate-800 uppercase tracking-widest" style={{ fontFamily: '"Cinzel", serif' }}>
                                        {data.course}
                                    </div>

                                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: '"Lato", sans-serif' }}>
                                        {data.description}
                                    </p>

                                    <div className="flex justify-between items-end mt-16 px-16">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-slate-800 mb-2">{data.date}</div>
                                            <div className="h-px w-48 bg-slate-400 mb-2"></div>
                                            <div className="text-sm text-slate-500 uppercase tracking-wider">Date</div>
                                        </div>

                                        {/* Seal */}
                                        <div className="mb-4">
                                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-dashed
                                                ${theme === 'gold' ? 'bg-yellow-100 border-yellow-600 text-yellow-700' : ''}
                                                ${theme === 'blue' ? 'bg-blue-100 border-blue-900 text-blue-900' : ''}
                                                ${theme === 'classic' ? 'bg-gray-100 border-gray-800 text-gray-800' : ''}
                                             `}>
                                                <Award className="w-12 h-12" />
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="text-3xl text-slate-800 mb-0" style={{ fontFamily: '"Great Vibes", cursive' }}>{data.signature}</div>
                                            <div className="h-px w-48 bg-slate-400 mb-2 mt-2"></div>
                                            <div className="text-sm text-slate-500 uppercase tracking-wider">{data.signatureTitle}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
