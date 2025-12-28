import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import yaml from 'js-yaml'

export default function YamlJsonConverterTool() {
    const [left, setLeft] = useState('') // YAML
    const [right, setRight] = useState('') // JSON
    const [error, setError] = useState(null)

    const yamlToJson = () => {
        try {
            const obj = yaml.load(left)
            setRight(JSON.stringify(obj, null, 2))
            setError(null)
        } catch (e) {
            setError('Invalid YAML: ' + e.message)
        }
    }

    const jsonToYaml = () => {
        try {
            const obj = JSON.parse(right)
            const yStr = yaml.dump(obj)
            setLeft(yStr)
            setError(null)
        } catch (e) {
            setError('Invalid JSON: ' + e.message)
        }
    }

    return (
        <ToolLayout title="YAML <-> JSON" description="Convert between YAML and JSON formats.">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 h-[600px]">

                <div className="flex flex-col bg-white rounded-3xl shadow p-4 border border-slate-200">
                    <label className="font-bold text-slate-500 mb-2">YAML</label>
                    <textarea
                        value={left} onChange={e => setLeft(e.target.value)}
                        className="flex-1 resize-none outline-none font-mono text-xs p-4 bg-slate-50 rounded-xl"
                        placeholder="key: value..."
                    />
                </div>

                <div className="flex flex-col justify-center gap-4">
                    <button onClick={yamlToJson} className="p-4 bg-blue-600 text-white rounded-full shadow hover:scale-110 transition-all">
                        <ArrowRight className="w-6 h-6" />
                    </button>
                    <button onClick={jsonToYaml} className="p-4 bg-orange-500 text-white rounded-full shadow hover:scale-110 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col bg-white rounded-3xl shadow p-4 border border-slate-200">
                    <label className="font-bold text-slate-500 mb-2">JSON</label>
                    <textarea
                        value={right} onChange={e => setRight(e.target.value)}
                        className="flex-1 resize-none outline-none font-mono text-xs p-4 bg-slate-50 rounded-xl"
                        placeholder="{ ... }"
                    />
                </div>

            </div>
            {error && <div className="max-w-md mx-auto mt-4 p-4 bg-red-100 text-red-600 text-center rounded-xl font-bold">{error}</div>}
        </ToolLayout>
    )
}
