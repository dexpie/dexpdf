import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Database, AlignLeft, Copy, Terminal } from 'lucide-react'
import { format } from 'sql-formatter'

export default function SqlFormatterTool() {
    const [input, setInput] = useState('SELECT * FROM users WHERE id = 1')
    const [output, setOutput] = useState('')
    const [language, setLanguage] = useState('sql')
    const [error, setError] = useState(null)

    const handleFormat = () => {
        try {
            const formatted = format(input, { language })
            setOutput(formatted)
            setError(null)
        } catch (e) {
            setError(e.message)
            setOutput('')
        }
    }

    return (
        <ToolLayout title="SQL Formatter" description="Prettify SQL queries for readability.">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[600px]">

                {/* Input */}
                <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                        <label className="font-bold text-slate-600 flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Raw SQL
                        </label>
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="text-xs font-bold bg-white border border-slate-300 rounded-lg p-1 text-slate-600"
                        >
                            <option value="sql">Standard SQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="mariadb">MariaDB</option>
                            <option value="tsql">T-SQL (SQL Server)</option>
                        </select>
                    </div>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="SELECT * FROM table..."
                        className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm leading-relaxed text-slate-700 bg-slate-50/50"
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col justify-center gap-4">
                    <button
                        onClick={handleFormat}
                        className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all"
                        title="Format SQL"
                    >
                        <AlignLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* Output */}
                <div className="flex-1 flex flex-col bg-slate-900 rounded-3xl shadow-lg border border-slate-800 overflow-hidden">
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                        <label className="font-bold text-slate-300 flex items-center gap-2">
                            <Database className="w-4 h-4" /> Formatted
                        </label>
                        <button onClick={() => navigator.clipboard.writeText(output)} className="text-slate-400 hover:text-white">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        {error ? (
                            <div className="p-8 text-red-400 font-mono text-sm">{error}</div>
                        ) : (
                            <textarea
                                value={output}
                                readOnly
                                placeholder="Result..."
                                className="absolute inset-0 w-full h-full p-6 resize-none outline-none font-mono text-sm leading-relaxed bg-transparent text-blue-300"
                            />
                        )}
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}
