'use client'
import React, { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Download, Plus, Trash, User, Briefcase, GraduationCap,
    Award, Layout, Mail, Phone, MapPin, Globe, GripVertical
} from 'lucide-react'
import html2canvas from 'html2canvas'
import ToolLayout from '../components/common/ToolLayout'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'

// --- Default Data ---
const DEFAULT_RESUME = {
    personal: {
        name: 'John Doe',
        title: 'Senior Software Engineer',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        website: 'johndoe.dev',
        summary: 'Passionate developer with 5+ years of experience building scalable web applications. Expert in React, Node.js, and Cloud Architecture.'
    },
    experience: [
        {
            id: '1',
            role: 'Senior Frontend Developer',
            company: 'Tech Corp',
            location: 'Remote',
            startDate: '2021-01',
            endDate: 'Present',
            description: '• Led a team of 5 developers\n• Improved site performance by 40%\n• Architected new design system'
        }
    ],
    education: [
        {
            id: '1',
            degree: 'BS Computer Science',
            school: 'University of Tech',
            year: '2016 - 2020'
        }
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'AWS', 'Docker']
}

export default function ResumeBuilderTool() {
    const [data, setData] = useState(DEFAULT_RESUME)
    const [layout, setLayout] = useState('modern') // 'modern' | 'classic'
    const [busy, setBusy] = useState(false)
    const [outputFileName, setOutputFileName] = useState('resume')

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('dexpdf_resume_draft')
        if (saved) try { setData(JSON.parse(saved)) } catch (e) { }
    }, [])

    useEffect(() => {
        localStorage.setItem('dexpdf_resume_draft', JSON.stringify(data))
    }, [data])

    // --- Helpers ---
    const updatePersonal = (field, val) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: val } }))
    }

    // Experience Listeners
    const addExp = () => setData(prev => ({
        ...prev, experience: [...prev.experience, { id: uuidv4(), role: '', company: '', startDate: '', endDate: '', description: '' }]
    }))
    const updateExp = (id, field, val) => setData(prev => ({
        ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [field]: val } : e)
    }))
    const removeExp = (id) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }))

    // Education Listeners
    const addEdu = () => setData(prev => ({
        ...prev, education: [...prev.education, { id: uuidv4(), degree: '', school: '', year: '' }]
    }))
    const updateEdu = (id, field, val) => setData(prev => ({
        ...prev, education: prev.education.map(e => e.id === id ? { ...e, [field]: val } : e)
    }))
    const removeEdu = (id) => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }))

    // Skills
    const updateSkills = (val) => setData(prev => ({ ...prev, skills: val.split(',').map(s => s.trim()) }))

    // --- PDF Generation ---
    const previewRef = useRef(null)

    async function generatePdf() {
        if (!previewRef.current) return
        setBusy(true)
        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
            const imgData = canvas.toDataURL('image/png')
            const { jsPDF } = await import('jspdf')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(getOutputFilename(outputFileName, 'resume'))
            triggerConfetti()
        } catch (err) {
            console.error(err)
            alert('Failed to generate PDF')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Resume Builder" description="Build ATS-friendly resumes with modern layouts.">
            <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
                {/* Editor Column */}
                <div className="flex-1 space-y-6">

                    {/* Personal Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                            <User className="w-5 h-5" /> Personal Info
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <input className="input-field" placeholder="Full Name" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} />
                            <input className="input-field" placeholder="Job Title" value={data.personal.title} onChange={e => updatePersonal('title', e.target.value)} />
                            <input className="input-field" placeholder="Email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} />
                            <input className="input-field" placeholder="Phone" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
                            <input className="input-field" placeholder="Location" value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} />
                            <input className="input-field" placeholder="Website / Portfolio" value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} />
                        </div>
                        <textarea className="input-field mt-4 w-full h-24" placeholder="Professional Summary..." value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} />
                    </div>

                    {/* Experience */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700"><Briefcase className="w-5 h-5" /> Experience</h3>
                            <button onClick={addExp} className="btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <div className="space-y-6">
                            {data.experience.map((exp, i) => (
                                <div key={exp.id} className="relative p-4 border border-slate-100 rounded-xl bg-slate-50/50 group">
                                    <button onClick={() => removeExp(exp.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                                        <input className="input-field bg-white" placeholder="Role / Position" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} />
                                        <input className="input-field bg-white" placeholder="Company" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                                        <input type="month" className="input-field bg-white" value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} />
                                        <input type="text" placeholder="End Date (or 'Present')" className="input-field bg-white" value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} />
                                    </div>
                                    <textarea className="input-field bg-white w-full h-24" placeholder="Description (Bullet points)" value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700"><GraduationCap className="w-5 h-5" /> Education</h3>
                            <button onClick={addEdu} className="btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1 flex items-center gap-1 text-xs font-bold">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>
                        <div className="space-y-4">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="flex gap-3 items-center group">
                                    <div className="flex-1 grid md:grid-cols-3 gap-2">
                                        <input className="input-field" placeholder="Degree" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} />
                                        <input className="input-field" placeholder="School" value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} />
                                        <input className="input-field" placeholder="Year" value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} />
                                    </div>
                                    <button onClick={() => removeEdu(edu.id)} className="text-slate-300 hover:text-red-500">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700"><Award className="w-5 h-5" /> Skills</h3>
                        <p className="text-xs text-slate-500 mb-2">Comma separated</p>
                        <textarea className="input-field w-full" value={data.skills.join(', ')} onChange={e => updateSkills(e.target.value)} />
                    </div>

                </div>

                {/* Preview Column */}
                <div className="xl:w-[500px] flex flex-col gap-6 sticky top-8 h-fit">

                    {/* Controls */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                        <div className="flex gap-4 mb-6">
                            <button onClick={() => setLayout('modern')} className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all ${layout === 'modern' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300'}`}>
                                Modern
                            </button>
                            <button onClick={() => setLayout('classic')} className={`flex-1 p-3 rounded-xl border-2 font-bold text-sm transition-all ${layout === 'classic' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-300'}`}>
                                Classic
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-600 block mb-2">Filename</label>
                            <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} />
                        </div>

                        <ActionButtons primaryText="Download Resume" primaryIcon={Download} onPrimary={generatePdf} loading={busy} />
                    </div>

                    {/* Preview Area (Scaled) */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-500/10 p-4">
                        <div className="origin-top transform scale-[0.55]" style={{ height: 600 }}>
                            <div className="bg-white shadow-2xl mx-auto text-slate-800"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    // padding: '20mm', // Styles vary by layout
                                }}
                            >
                                {layout === 'modern' ? (
                                    <ModernLayout data={data} />
                                ) : (
                                    <ClassicLayout data={data} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Ghost Print Area (Hidden) --- */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div ref={previewRef} className="bg-white text-slate-800"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            // padding: '20mm', // Inner padding handled by layouts
                        }}
                    >
                        {layout === 'modern' ? (
                            <ModernLayout data={data} />
                        ) : (
                            <ClassicLayout data={data} />
                        )}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}

function ModernLayout({ data }) {
    return (
        <div className="flex h-full min-h-[297mm]">
            {/* Sidebar */}
            <div className="w-1/3 bg-slate-800 text-white p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2 uppercase tracking-wider">{data.personal.name}</h1>
                    <p className="text-blue-300 font-medium">{data.personal.title}</p>
                </div>

                <div className="space-y-4 text-sm text-slate-300 mb-8">
                    {data.personal.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {data.personal.email}</div>}
                    {data.personal.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {data.personal.phone}</div>}
                    {data.personal.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {data.personal.location}</div>}
                    {data.personal.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {data.personal.website}</div>}
                </div>

                <div className="mb-8">
                    <h3 className="text-white font-bold border-b border-slate-700 pb-2 mb-4 uppercase text-sm tracking-widest">Education</h3>
                    {data.education.map((edu, i) => (
                        <div key={i} className="mb-4">
                            <div className="font-bold text-white">{edu.degree}</div>
                            <div className="text-slate-400 text-sm">{edu.school}</div>
                            <div className="text-slate-500 text-xs">{edu.year}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-white font-bold border-b border-slate-700 pb-2 mb-4 uppercase text-sm tracking-widest">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, i) => (
                            <span key={i} className="bg-slate-700 text-xs px-2 py-1 rounded text-slate-300">{skill}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-2/3 p-8">
                <div className="mb-8">
                    <h3 className="font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 uppercase text-sm tracking-widest">Summary</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{data.personal.summary}</p>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 uppercase text-sm tracking-widest">Experience</h3>
                    {data.experience.map((exp, i) => (
                        <div key={i} className="mb-6">
                            <div className="flex justify-between mb-1">
                                <h4 className="font-bold text-slate-800">{exp.role}</h4>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="text-blue-600 font-medium text-sm mb-2">{exp.company}</div>
                            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ClassicLayout({ data }) {
    return (
        <div className="p-12 h-full">
            <header className="border-b-2 border-black pb-6 mb-8 text-center">
                <h1 className="text-4xl font-serif font-bold text-black mb-2">{data.personal.name}</h1>
                <p className="text-lg text-slate-600 mb-4">{data.personal.title}</p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
                    <span>{data.personal.email}</span> •
                    <span>{data.personal.phone}</span> •
                    <span>{data.personal.location}</span>
                </div>
            </header>

            <section className="mb-6">
                <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-3 pb-1">Professional Summary</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{data.personal.summary}</p>
            </section>

            <section className="mb-6">
                <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-4 pb-1">Experience</h3>
                {data.experience.map((exp, i) => (
                    <div key={i} className="mb-5">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-md">{exp.role}</h4>
                            <span className="text-sm text-slate-500 italic">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <div className="text-slate-700 font-medium mb-2">{exp.company}</div>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">{exp.description}</p>
                    </div>
                ))}
            </section>

            <section className="mb-6">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-3 pb-1">Education</h3>
                        {data.education.map((edu, i) => (
                            <div key={i} className="mb-3">
                                <div className="font-bold text-sm">{edu.school}</div>
                                <div className="text-slate-600 text-sm">{edu.degree}</div>
                                <div className="text-slate-500 text-xs italic">{edu.year}</div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg uppercase border-b border-slate-300 mb-3 pb-1">Skills</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
                            {data.skills.map((skill, i) => (
                                <span key={i}>• {skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
