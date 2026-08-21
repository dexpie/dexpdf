import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileJson, FileSpreadsheet, ArrowLeftRight, Download, Copy, Trash2 } from 'lucide-react'
import Papa from 'papaparse'
import { triggerConfetti } from '../utils/confetti'

export default function DataConverterTool() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [mode, setMode] = useState('csv2json') // csv2json, json2csv

    const convert = () => {
        if (!input.trim()) return

        try {
            if (mode === 'csv2json') {
                Papa.parse(input, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setOutput(JSON.stringify(results.data, null, 2))
                    },
                    error: (err) => {
                        alert('Error parsing CSV: ' + err.message)
                    }
                })
            } else {
                try {
                    const jsonData = JSON.parse(input)
                    const csv = Papa.unparse(jsonData)
                    setOutput(csv)
                } catch (e) {
                    alert('Invalid JSON')
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    const swap = () => {
        setMode(mode === 'csv2json' ? 'json2csv' : 'csv2json')
        setInput(output)
        setOutput('')
    }

    const download = () => {
        const blob = new Blob([output], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `converted_data.${mode === 'csv2json' ? 'json' : 'csv'}`
        a.click()
        triggerConfetti()
    }

    return (
        <ToolLayout title="Data Converter" description="Convert between CSV and JSON formats.">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                {/* Controls */}
                <div className="flex justify-center items-center gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border">
                    <span className={`font-bold ${mode === 'csv2json' ? 'text-blue-600' : 'text-muted-foreground'}`}>CSV</span>
                    <button onClick={swap} className="p-2 bg-secondary rounded-full hover:bg-blue-100 text-muted-foreground hover:text-blue-600 transition-colors">
                        <ArrowLeftRight className="w-5 h-5" />
                    </button>
                    <span className={`font-bold ${mode === 'json2csv' ? 'text-blue-600' : 'text-muted-foreground'}`}>JSON</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                    {/* Input */}
                    <div className="flex flex-col bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                        <div className="bg-secondary p-4 border-b border-border flex justify-between items-center">
                            <label className="font-bold text-muted-foreground flex items-center gap-2">
                                {mode === 'csv2json' ? <FileSpreadsheet className="w-4 h-4" /> : <FileJson className="w-4 h-4" />}
                                Input
                            </label>
                            <button onClick={() => setInput('')} className="text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={mode === 'csv2json' ? "Paste CSV here..." : "Paste JSON here..."}
                            className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed"
                        />
                    </div>

                    {/* Output */}
                    <div className="flex flex-col bg-slate-900 rounded-3xl shadow-lg border border-slate-800 overflow-hidden relative">
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <label className="font-bold text-muted-foreground flex items-center gap-2">
                                {mode === 'json2csv' ? <FileSpreadsheet className="w-4 h-4" /> : <FileJson className="w-4 h-4" />}
                                Output
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => navigator.clipboard.writeText(output)} className="text-muted-foreground hover:text-white">
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button onClick={download} className="text-blue-400 hover:text-blue-300">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Result will appear here..."
                            className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed bg-transparent text-green-400"
                        />

                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={convert}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <ArrowLeftRight className="w-4 h-4" /> Convert
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
