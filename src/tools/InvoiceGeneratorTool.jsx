'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Download, Plus, Trash, RefreshCw,
    Calendar, User, MapPin, Hash, DollarSign,
    Briefcase, AlertCircle, CheckCircle, FileOutput, Building2
} from 'lucide-react'
import html2canvas from 'html2canvas'
import ToolLayout from '../components/common/ToolLayout'
import ActionButtons from '../components/common/ActionButtons'
import FilenameInput from '../components/FilenameInput'
import { getOutputFilename } from '../utils/fileHelpers'
import { triggerConfetti } from '../utils/confetti'
import { useBrandKit } from '../hooks/useBrandKit'

// --- Default Data ---
const DEFAULT_INVOICE = {
    number: 'INV-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    from: {
        name: 'Alexander Great',
        email: 'alex@example.com',
        address: '123 Empire St, Macedonia',
        phone: '555-0123'
    },
    to: {
        name: 'Client Corp',
        email: 'billing@client.com',
        address: '456 Business Rd, New York',
        phone: '555-9876'
    },
    items: [
        { id: 1, desc: 'Web Development', qty: 10, rate: 50 },
        { id: 2, desc: 'Server Setup', qty: 1, rate: 200 }
    ],
    currency: '$',
    taxRate: 10,
    notes: 'Thank you for your business. Please pay within 7 days.'
}

export default function InvoiceGeneratorTool() {
    const { t } = useTranslation()
    const { brand, hasBrand } = useBrandKit()
    const [data, setData] = useState(DEFAULT_INVOICE)
    const [busy, setBusy] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [outputFileName, setOutputFileName] = useState('invoice')

    // Auto-save drafts
    useEffect(() => {
        const saved = localStorage.getItem('dexpdf_invoice_draft')
        if (saved) {
            try { setData(JSON.parse(saved)) } catch (e) { }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('dexpdf_invoice_draft', JSON.stringify(data))
    }, [data])

    // --- Helpers ---
    const updateField = (section, field, val) => {
        if (section) {
            setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: val } }))
        } else {
            setData(prev => ({ ...prev, [field]: val }))
        }
    }

    const updateItem = (id, field, val) => {
        setData(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, [field]: val } : i)
        }))
    }

    const addItem = () => {
        setData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), desc: '', qty: 1, rate: 0 }]
        }))
    }

    const removeItem = (id) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== id)
        }))
    }

    const applyBrandKit = () => {
        if (!hasBrand) return
        setData(prev => ({
            ...prev,
            from: {
                name: brand.companyName || prev.from.name,
                email: brand.email || prev.from.email,
                address: brand.address || prev.from.address,
                phone: brand.phone || prev.from.phone
            }
        }))
        setSuccessMsg("Brand identity applied!")
        setTimeout(() => setSuccessMsg(""), 2000)
    }

    const subtotal = data.items.reduce((acc, i) => acc + (i.qty * i.rate), 0)
    const taxAmount = (subtotal * data.taxRate) / 100
    const total = subtotal + taxAmount

    // --- Generation ---
    const previewRef = useRef(null)

    async function generatePdf() {
        if (!previewRef.current) return
        setBusy(true); setErrorMsg(''); setSuccessMsg('')

        try {
            // High fidelity capture
            const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, logging: false })
            const imgData = canvas.toDataURL('image/png')

            const { jsPDF } = await import('jspdf')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = 210
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(getOutputFilename(outputFileName, 'invoice'))

            setSuccessMsg('Invoice generated successfully!')
            triggerConfetti()
        } catch (err) {
            console.error(err)
            setErrorMsg('Failed to generate PDF')
        } finally {
            setBusy(false)
        }
    }

    return (
        <ToolLayout title="Invoice Generator" description="Create professional invoices in seconds.">
            <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">

                {/* --- Left: Editor --- */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-500" /> Invoice Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Invoice #</label>
                                <input type="text" className="w-full p-2 border rounded-lg mt-1"
                                    value={data.number} onChange={e => updateField(null, 'number', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Currency</label>
                                <select className="w-full p-2 border rounded-lg mt-1"
                                    value={data.currency} onChange={e => updateField(null, 'currency', e.target.value)}>
                                    <option value="$">$ USD</option>
                                    <option value="€">€ EUR</option>
                                    <option value="£">£ GBP</option>
                                    <option value="Rp">Rp IDR</option>
                                    <option value="¥">¥ JPY</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                                <input type="date" className="w-full p-2 border rounded-lg mt-1"
                                    value={data.date} onChange={e => updateField(null, 'date', e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                                <input type="date" className="w-full p-2 border rounded-lg mt-1"
                                    value={data.dueDate} onChange={e => updateField(null, 'dueDate', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* From */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-sm flex items-center gap-2 text-slate-600">
                                    <User className="w-4 h-4" /> From (You)
                                </h4>
                                {hasBrand && (
                                    <button
                                        onClick={applyBrandKit}
                                        className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                                    >
                                        <Building2 className="w-3 h-3" /> Auto-fill
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                <input placeholder="Your Name / Business" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.from.name} onChange={e => updateField('from', 'name', e.target.value)} />
                                <input placeholder="Email" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.from.email} onChange={e => updateField('from', 'email', e.target.value)} />
                                <input placeholder="Address" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.from.address} onChange={e => updateField('from', 'address', e.target.value)} />
                                <input placeholder="Phone" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.from.phone} onChange={e => updateField('from', 'phone', e.target.value)} />
                            </div>
                        </div>

                        {/* To */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-600">
                                <User className="w-4 h-4" /> Bill To (Client)
                            </h4>
                            <div className="space-y-3">
                                <input placeholder="Client Name" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.to.name} onChange={e => updateField('to', 'name', e.target.value)} />
                                <input placeholder="Email" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.to.email} onChange={e => updateField('to', 'email', e.target.value)} />
                                <input placeholder="Address" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.to.address} onChange={e => updateField('to', 'address', e.target.value)} />
                                <input placeholder="Phone" className="w-full p-2 border rounded-lg bg-slate-50"
                                    value={data.to.phone} onChange={e => updateField('to', 'phone', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" /> Items
                            </h3>
                            <button onClick={addItem} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100">
                                <Plus className="w-3 h-3" /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map(item => (
                                <div key={item.id} className="flex gap-2 items-start group">
                                    <div className="flex-1">
                                        <input placeholder="Description" className="w-full p-2 border rounded-lg text-sm"
                                            value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} />
                                    </div>
                                    <div className="w-20">
                                        <input type="number" placeholder="Qty" className="w-full p-2 border rounded-lg text-sm text-center"
                                            value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} />
                                    </div>
                                    <div className="w-24">
                                        <input type="number" placeholder="Rate" className="w-full p-2 border rounded-lg text-sm text-right"
                                            value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} />
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-8 items-center">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Tax Rate (%)</label>
                                <input type="number" className="w-24 p-2 border rounded-lg mt-1 block"
                                    value={data.taxRate} onChange={e => updateField(null, 'taxRate', Number(e.target.value))} />
                            </div>
                            <div className="text-right space-y-2">
                                <div className="text-sm text-slate-500">Subtotal: {data.currency}{subtotal.toLocaleString()}</div>
                                <div className="text-sm text-slate-500">Tax ({data.taxRate}%): {data.currency}{taxAmount.toLocaleString()}</div>
                                <div className="text-2xl font-bold text-slate-800">Total: {data.currency}{total.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right: Preview & Action --- */}
                <div className="xl:w-[500px] flex flex-col gap-6 sticky top-8 h-fit">

                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-600 block mb-2">Filename</label>
                            <FilenameInput value={outputFileName} onChange={e => setOutputFileName(e.target.value)} />
                        </div>

                        <AnimatePresence>
                            <div className="space-y-2 mb-4">
                                {errorMsg && <div className="text-xs text-red-500 bg-red-50 p-2 rounded flex gap-2"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
                                {successMsg && <div className="text-xs text-green-500 bg-green-50 p-2 rounded flex gap-2"><CheckCircle className="w-4 h-4" /> {successMsg}</div>}
                            </div>
                        </AnimatePresence>

                        <ActionButtons
                            primaryText="Download PDF"
                            primaryIcon={Download}
                            onPrimary={generatePdf}
                            loading={busy}
                        />
                    </div>

                    {/* Live Preview (A4 Ratio) */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-500/10 p-4">
                        <div className="uppercase text-xs font-bold text-slate-500 mb-2 text-center">Preview</div>
                        <div className="origin-top transform scale-[0.6] sm:scale-[0.8] xl:scale-[0.55]" style={{ height: 600 }}> {/* Fixed height container to crop overflow */}
                            <div className="bg-white shadow-2xl mx-auto text-slate-800"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '20mm',
                                    fontFamily: 'sans-serif'
                                }}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-12">
                                    <div className="flex items-start gap-4">
                                        {brand && brand.logo && (
                                            <img src={brand.logo} alt="Company Logo" className="w-20 h-auto object-contain" />
                                        )}
                                        <div>
                                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">INVOICE</h1>
                                            <p className="text-slate-500 mt-2 font-medium">#{data.number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="font-bold text-lg">{data.from.name}</h2>
                                        <p className="text-sm text-slate-500 whitespace-pre-wrap">{data.from.address}</p>
                                        <p className="text-sm text-slate-500">{data.from.email}</p>
                                        <p className="text-sm text-slate-500">{data.from.phone}</p>
                                    </div>
                                </div>

                                {/* Bill To & Date */}
                                <div className="flex justify-between mb-12">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h3>
                                        <div className="font-bold text-lg">{data.to.name}</div>
                                        <div className="text-sm text-slate-600 whitespace-pre-wrap max-w-[250px]">{data.to.address}</div>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</div>
                                            <div className="font-medium">{data.date}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</div>
                                            <div className="font-medium">{data.dueDate}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <table className="w-full mb-12">
                                    <thead className="border-b-2 border-slate-100">
                                        <tr>
                                            <th className="text-left py-3 text-sm font-bold text-slate-500 uppercase">Item</th>
                                            <th className="text-center py-3 text-sm font-bold text-slate-500 uppercase">Qty</th>
                                            <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Rate</th>
                                            <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {data.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="py-4 font-medium">{item.desc || 'Item'}</td>
                                                <td className="py-4 text-center text-slate-500">{item.qty}</td>
                                                <td className="py-4 text-right text-slate-500">{data.currency}{item.rate.toLocaleString()}</td>
                                                <td className="py-4 text-right font-bold">{data.currency}{(item.qty * item.rate).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end mb-12">
                                    <div className="w-1/2 space-y-3">
                                        <div className="flex justify-between text-slate-500">
                                            <span>Subtotal</span>
                                            <span>{data.currency}{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Tax ({data.taxRate}%)</span>
                                            <span>{data.currency}{taxAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-2xl text-slate-900 border-t-2 border-slate-100 pt-3">
                                            <span>Total</span>
                                            <span>{data.currency}{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {data.notes && (
                                    <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                                        <h4 className="font-bold text-sm text-blue-700 mb-1">Notes</h4>
                                        <p className="text-sm text-blue-600 italic">{data.notes}</p>

                                        {brand && brand.signature && (
                                            <div className="mt-8 pt-4 border-t border-blue-200 w-48">
                                                <img src={brand.signature} className="max-h-16 mb-2 object-contain" alt="Signature" />
                                                <div className="text-xs text-blue-400 font-medium">Authorized Signature</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-20 text-center text-xs text-slate-300 font-medium">
                                    Created with DexPDF
                                </div>
                            </div>
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
                        padding: '20mm',
                        fontFamily: 'sans-serif'
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex items-start gap-4">
                            {brand && brand.logo && (
                                <img src={brand.logo} alt="Company Logo" className="w-20 h-auto object-contain" />
                            )}
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">INVOICE</h1>
                                <p className="text-slate-500 mt-2 font-medium">#{data.number}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-lg">{data.from.name}</h2>
                            <p className="text-sm text-slate-500 whitespace-pre-wrap">{data.from.address}</p>
                            <p className="text-sm text-slate-500">{data.from.email}</p>
                            <p className="text-sm text-slate-500">{data.from.phone}</p>
                        </div>
                    </div>

                    {/* Bill To & Date */}
                    <div className="flex justify-between mb-12">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Bill To</h3>
                            <div className="font-bold text-lg">{data.to.name}</div>
                            <div className="text-sm text-slate-600 whitespace-pre-wrap max-w-[250px]">{data.to.address}</div>
                        </div>
                        <div className="text-right space-y-2">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</div>
                                <div className="font-medium">{data.date}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</div>
                                <div className="font-medium">{data.dueDate}</div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-12">
                        <thead className="border-b-2 border-slate-100">
                            <tr>
                                <th className="text-left py-3 text-sm font-bold text-slate-500 uppercase">Item</th>
                                <th className="text-center py-3 text-sm font-bold text-slate-500 uppercase">Qty</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Rate</th>
                                <th className="text-right py-3 text-sm font-bold text-slate-500 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.items.map(item => (
                                <tr key={item.id}>
                                    <td className="py-4 font-medium">{item.desc || 'Item'}</td>
                                    <td className="py-4 text-center text-slate-500">{item.qty}</td>
                                    <td className="py-4 text-right text-slate-500">{data.currency}{item.rate.toLocaleString()}</td>
                                    <td className="py-4 text-right font-bold">{data.currency}{(item.qty * item.rate).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2 space-y-3">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span>{data.currency}{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Tax ({data.taxRate}%)</span>
                                <span>{data.currency}{taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-extrabold text-2xl text-slate-900 border-t-2 border-slate-100 pt-3">
                                <span>Total</span>
                                <span>{data.currency}{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {data.notes && (
                        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                            <h4 className="font-bold text-sm text-blue-700 mb-1">Notes</h4>
                            <p className="text-sm text-blue-600 italic">{data.notes}</p>

                            {brand && brand.signature && (
                                <div className="mt-8 pt-4 border-t border-blue-200 w-48">
                                    <img src={brand.signature} className="max-h-16 mb-2 object-contain" alt="Signature" />
                                    <div className="text-xs text-blue-400 font-medium">Authorized Signature</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-20 text-center text-xs text-slate-300 font-medium">
                        Created with DexPDF
                    </div>
                </div>
            </div>

        </ToolLayout>
    )
}    </ToolLayout >
    )
}
