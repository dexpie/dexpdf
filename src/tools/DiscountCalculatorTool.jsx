import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Tag, TrendingDown } from 'lucide-react'

export default function DiscountCalculatorTool() {
    const [price, setPrice] = useState(100)
    const [discount, setDiscount] = useState(25) // percentage

    const saved = price * (discount / 100)
    const final = price - saved

    return (
        <ToolLayout title="Discount Calculator" description="Calculate sale price and savings.">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 space-y-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Original Price ($)</label>
                        <input
                            type="number" value={price} onChange={e => setPrice(Number(e.target.value))}
                            className="w-full text-3xl font-bold p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-orange-500 text-slate-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Discount (%)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range" min="0" max="100" value={discount} onChange={e => setDiscount(Number(e.target.value))}
                                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <input
                                type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))}
                                className="w-20 text-center font-bold p-2 bg-slate-50 rounded-lg outline-none ring-1 ring-slate-200"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {[10, 20, 25, 30, 50, 75].map(d => (
                            <button
                                key={d} onClick={() => setDiscount(d)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm ${discount === d ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {d}%
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-orange-500 rounded-3xl shadow-xl p-8 text-white flex flex-col justify-center gap-8 relative overflow-hidden">
                    <Tag className="absolute w-64 h-64 text-orange-400/20 -right-12 -bottom-12 rotate-[-15deg]" />

                    <div className="relative z-10">
                        <div className="text-orange-100 font-bold uppercase text-sm mb-1">Final Price</div>
                        <div className="text-6xl font-black tracking-tighter">
                            ${final.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="relative z-10 p-4 bg-black/10 rounded-xl">
                        <div className="text-orange-100 font-bold uppercase text-xs mb-1">You Save</div>
                        <div className="text-3xl font-bold text-white">
                            ${saved.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
