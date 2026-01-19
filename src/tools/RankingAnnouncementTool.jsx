'use client'
import React, { useState, useRef, useEffect } from 'react'
import {
    Download, Award, Trophy, Plus, Trash, Medal
} from 'lucide-react'
import html2canvas from 'html2canvas'
import ToolLayout from '../components/common/ToolLayout'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'

// --- Default Data ---
const DEFAULT_RANKING = {
    eventTitle: 'Pengumuman Hasil Lomba',
    eventSubtitle: 'Kompetisi Nasional 2024',
    eventDate: new Date().toISOString().split('T')[0],
    participants: [
        { id: 1, rank: 1, name: 'Ahmad Pratama', score: 98, institution: 'SMA 1 Jakarta' },
        { id: 2, rank: 2, name: 'Siti Rahayu', score: 95, institution: 'SMA 3 Bandung' },
        { id: 3, rank: 3, name: 'Budi Santoso', score: 92, institution: 'SMA 2 Surabaya' },
    ]
}

// Medal colors for top 3
const getMedalColor = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', icon: 'text-yellow-500' }
    if (rank === 2) return { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-600', icon: 'text-slate-400' }
    if (rank === 3) return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-500' }
    return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-400' }
}

export default function RankingAnnouncementTool() {
    const [data, setData] = useState(DEFAULT_RANKING)
    const [theme, setTheme] = useState('classic') // classic, gold, blue
    const [busy, setBusy] = useState(false)
    const [outputFileName, setOutputFileName] = useState('pengumuman-ranking')

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('dexpdf_ranking_draft')
        if (saved) try { setData(JSON.parse(saved)) } catch (e) { }
    }, [])

    useEffect(() => {
        localStorage.setItem('dexpdf_ranking_draft', JSON.stringify(data))
    }, [data])

    const updateField = (field, val) => setData(prev => ({ ...prev, [field]: val }))

    const updateParticipant = (id, field, val) => {
        setData(prev => ({
            ...prev,
            participants: prev.participants.map(p =>
                p.id === id ? { ...p, [field]: val } : p
            )
        }))
    }

    const addParticipant = () => {
        const maxRank = Math.max(...data.participants.map(p => p.rank), 0)
        setData(prev => ({
            ...prev,
            participants: [...prev.participants, {
                id: Date.now(),
                rank: maxRank + 1,
                name: '',
                score: 0,
                institution: ''
            }]
        }))
    }

    const removeParticipant = (id) => {
        setData(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id)
        }))
    }

    const sortByRank = () => {
        setData(prev => ({
            ...prev,
            participants: [...prev.participants].sort((a, b) => a.rank - b.rank)
        }))
    }

    const sortByScore = () => {
        setData(prev => ({
            ...prev,
            participants: [...prev.participants]
                .sort((a, b) => b.score - a.score)
                .map((p, i) => ({ ...p, rank: i + 1 }))
        }))
    }

    // --- PDF Generation ---
    const previewRef = useRef(null)

    async function generatePdf() {
        if (!previewRef.current) return
        setBusy(true)
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')
            const { jsPDF } = await import('jspdf')
            // Portrait A4
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(getOutputFilename(outputFileName, 'ranking'))
            triggerConfetti()
        } catch (err) {
            console.error(err)
            alert('Failed to generate PDF')
        } finally {
            setBusy(false)
        }
    }

    // Sorted participants for display
    const sortedParticipants = [...data.participants].sort((a, b) => a.rank - b.rank)

    return (
        <ToolLayout title="Pengumuman Ranking Peserta" description="Buat pengumuman ranking peserta kompetisi secara profesional.">
            {/* Font Loader */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');
            `}</style>

            <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
                {/* Editor Column */}
                <div className="flex-1 space-y-6">
                    {/* Event Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                            <Trophy className="w-5 h-5 text-yellow-500" /> Detail Acara
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Judul Acara</label>
                                <input
                                    className="w-full p-3 border rounded-lg mt-1 text-lg font-bold"
                                    value={data.eventTitle}
                                    onChange={e => updateField('eventTitle', e.target.value)}
                                    placeholder="Pengumuman Hasil Lomba"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Sub Judul</label>
                                    <input
                                        className="w-full p-2 border rounded-lg mt-1"
                                        value={data.eventSubtitle}
                                        onChange={e => updateField('eventSubtitle', e.target.value)}
                                        placeholder="Kompetisi Nasional 2024"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg mt-1"
                                        value={data.eventDate}
                                        onChange={e => updateField('eventDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Participants List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700">
                                <Medal className="w-5 h-5 text-yellow-500" /> Daftar Peserta
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={sortByScore}
                                    className="text-xs flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold hover:bg-green-100"
                                >
                                    Urutkan Skor
                                </button>
                                <button
                                    onClick={addParticipant}
                                    className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100"
                                >
                                    <Plus className="w-3 h-3" /> Tambah
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data.participants.map((p, index) => (
                                <div key={p.id} className="flex gap-2 items-start group p-3 bg-slate-50 rounded-lg">
                                    <div className="w-16">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Rank</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full p-2 border rounded-lg text-center font-bold"
                                            value={p.rank}
                                            onChange={e => updateParticipant(p.id, 'rank', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Nama Peserta</label>
                                        <input
                                            className="w-full p-2 border rounded-lg"
                                            value={p.name}
                                            onChange={e => updateParticipant(p.id, 'name', e.target.value)}
                                            placeholder="Nama lengkap"
                                        />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Skor</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg text-center"
                                            value={p.score}
                                            onChange={e => updateParticipant(p.id, 'score', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Institusi</label>
                                        <input
                                            className="w-full p-2 border rounded-lg"
                                            value={p.institution}
                                            onChange={e => updateParticipant(p.id, 'institution', e.target.value)}
                                            placeholder="Sekolah/Organisasi"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeParticipant(p.id)}
                                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="xl:w-[550px] flex flex-col gap-6 sticky top-8 h-fit">
                    {/* Controls */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex gap-4 mb-6">
                            {['classic', 'gold', 'blue'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`flex-1 p-2 capitalize rounded-lg border-2 font-bold text-sm transition-all ${theme === t ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="mb-4">
                            <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} />
                        </div>
                        <ActionButtons primaryText="Download PDF" primaryIcon={Download} onPrimary={generatePdf} loading={busy} />
                    </div>

                    {/* Preview Area (Scaled) */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-500/10 p-4 flex justify-center">
                        <div className="origin-top transform scale-[0.4] sm:scale-[0.5] xl:scale-[0.5]" style={{ height: 700, width: '210mm' }}>
                            {/* Visible Preview */}
                            <div
                                className={`bg-white shadow-2xl mx-auto text-slate-800 relative p-12
                                    ${theme === 'gold' ? 'border-t-8 border-yellow-500' : ''}
                                    ${theme === 'blue' ? 'border-t-8 border-blue-600' : ''}
                                    ${theme === 'classic' ? 'border-t-8 border-slate-800' : ''}
                                `}
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                }}
                            >
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                                        ${theme === 'gold' ? 'bg-yellow-100' : ''}
                                        ${theme === 'blue' ? 'bg-blue-100' : ''}
                                        ${theme === 'classic' ? 'bg-slate-100' : ''}
                                    `}>
                                        <Trophy className={`w-10 h-10
                                            ${theme === 'gold' ? 'text-yellow-500' : ''}
                                            ${theme === 'blue' ? 'text-blue-600' : ''}
                                            ${theme === 'classic' ? 'text-slate-700' : ''}
                                        `} />
                                    </div>
                                    <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                                        {data.eventTitle}
                                    </h1>
                                    <p className="text-xl text-slate-500" style={{ fontFamily: '"Inter", sans-serif' }}>
                                        {data.eventSubtitle}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        {new Date(data.eventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>

                                {/* Ranking Table */}
                                <div className="space-y-3">
                                    {sortedParticipants.map((p) => {
                                        const medalColors = getMedalColor(p.rank)
                                        return (
                                            <div
                                                key={p.id}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 ${medalColors.bg} ${medalColors.border}`}
                                            >
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl ${medalColors.text} bg-white border-2 ${medalColors.border}`}>
                                                    {p.rank <= 3 ? (
                                                        <Medal className={`w-8 h-8 ${medalColors.icon}`} />
                                                    ) : (
                                                        p.rank
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-xl text-slate-800">{p.name || 'Nama Peserta'}</div>
                                                    <div className="text-sm text-slate-500">{p.institution || 'Institusi'}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-3xl font-bold ${medalColors.text}`}>{p.score}</div>
                                                    <div className="text-xs text-slate-400 uppercase">Poin</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="mt-12 text-center text-xs text-slate-300 font-medium">
                                    Dibuat dengan DexPDF
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Ghost Print Area (Hidden) --- */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div
                        ref={previewRef}
                        className={`bg-white text-slate-800 relative p-12
                            ${theme === 'gold' ? 'border-t-8 border-yellow-500' : ''}
                            ${theme === 'blue' ? 'border-t-8 border-blue-600' : ''}
                            ${theme === 'classic' ? 'border-t-8 border-slate-800' : ''}
                        `}
                        style={{
                            width: '794px', // 210mm at ~96dpi
                            minHeight: '1123px', // 297mm at ~96dpi
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                                ${theme === 'gold' ? 'bg-yellow-100' : ''}
                                ${theme === 'blue' ? 'bg-blue-100' : ''}
                                ${theme === 'classic' ? 'bg-slate-100' : ''}
                            `}>
                                <Trophy className={`w-10 h-10
                                    ${theme === 'gold' ? 'text-yellow-500' : ''}
                                    ${theme === 'blue' ? 'text-blue-600' : ''}
                                    ${theme === 'classic' ? 'text-slate-700' : ''}
                                `} />
                            </div>
                            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                                {data.eventTitle}
                            </h1>
                            <p className="text-xl text-slate-500" style={{ fontFamily: '"Inter", sans-serif' }}>
                                {data.eventSubtitle}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                {new Date(data.eventDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Ranking Table */}
                        <div className="space-y-3">
                            {sortedParticipants.map((p) => {
                                const medalColors = getMedalColor(p.rank)
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${medalColors.bg} ${medalColors.border}`}
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl ${medalColors.text} bg-white border-2 ${medalColors.border}`}>
                                            {p.rank <= 3 ? (
                                                <Medal className={`w-8 h-8 ${medalColors.icon}`} />
                                            ) : (
                                                p.rank
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-xl text-slate-800">{p.name || 'Nama Peserta'}</div>
                                            <div className="text-sm text-slate-500">{p.institution || 'Institusi'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-bold ${medalColors.text}`}>{p.score}</div>
                                            <div className="text-xs text-slate-400 uppercase">Poin</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center text-xs text-slate-300 font-medium">
                            Dibuat dengan DexPDF
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
