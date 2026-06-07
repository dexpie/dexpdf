'use client'
import React, { useRef } from 'react'
import { useBrandKit } from '../hooks/useBrandKit'
import { Upload, X, Building2, Mail, Phone, MapPin, Globe, Image as ImageIcon, PenTool } from 'lucide-react'

export default function BrandKit({ isOpen, onClose }) {
    const { brand, updateBrand } = useBrandKit()
    const logoInputRef = useRef(null)
    const sigInputRef = useRef(null)

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updateBrand({ [field]: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Building2 className="text-blue-400" />
                            Brand Identity Kit
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">Manage your company assets centrally.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* 1. Visual Assets */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-slate-100 pb-2">Visual Assets</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Logo */}
                            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-secondary transition-colors relative group">
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                />
                                {brand.logo ? (
                                    <div className="relative h-32 flex items-center justify-center">
                                        <img src={brand.logo} alt="Brand Logo" className="max-h-full max-w-full object-contain" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateBrand({ logo: null }); }}
                                            className="absolute top-0 right-0 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="h-32 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-blue-500"
                                    >
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium">Upload Logo</span>
                                    </div>
                                )}
                            </div>

                            {/* Signature */}
                            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-secondary transition-colors relative group">
                                <input
                                    type="file"
                                    ref={sigInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'signature')}
                                />
                                {brand.signature ? (
                                    <div className="relative h-32 flex items-center justify-center">
                                        <img src={brand.signature} alt="Signature" className="max-h-full max-w-full object-contain" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateBrand({ signature: null }); }}
                                            className="absolute top-0 right-0 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => sigInputRef.current?.click()}
                                        className="h-32 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-blue-500"
                                    >
                                        <PenTool className="w-8 h-8 mb-2" />
                                        <span className="text-sm font-medium">Upload Signature</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Company Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-slate-100 pb-2">Company Details</h3>
                        <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex bg-secondary rounded-lg border border-border px-3 py-2 items-center focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <Building2 className="w-5 h-5 text-muted-foreground mr-3" />
                                    <input
                                        className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
                                        placeholder="Company Name"
                                        value={brand.companyName}
                                        onChange={(e) => updateBrand({ companyName: e.target.value })}
                                    />
                                </div>
                                <div className="flex bg-secondary rounded-lg border border-border px-3 py-2 items-center focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <Globe className="w-5 h-5 text-muted-foreground mr-3" />
                                    <input
                                        className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
                                        placeholder="Website"
                                        value={brand.website}
                                        onChange={(e) => updateBrand({ website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex bg-secondary rounded-lg border border-border px-3 py-2 items-center focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <Mail className="w-5 h-5 text-muted-foreground mr-3" />
                                    <input
                                        className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
                                        placeholder="Email Address"
                                        value={brand.email}
                                        onChange={(e) => updateBrand({ email: e.target.value })}
                                    />
                                </div>
                                <div className="flex bg-secondary rounded-lg border border-border px-3 py-2 items-center focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                    <Phone className="w-5 h-5 text-muted-foreground mr-3" />
                                    <input
                                        className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
                                        placeholder="Phone Number"
                                        value={brand.phone}
                                        onChange={(e) => updateBrand({ phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex bg-secondary rounded-lg border border-border px-3 py-2 items-center focus-within:ring-2 ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                <MapPin className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                                <textarea
                                    className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground resize-none h-20 py-1"
                                    placeholder="Business Address"
                                    value={brand.address}
                                    onChange={(e) => updateBrand({ address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-secondary p-6 border-t border-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
