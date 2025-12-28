import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Calculator as CalcIcon, Delete, Equal } from 'lucide-react'

export default function CalculatorTool() {
    const [display, setDisplay] = useState('0')
    const [equation, setEquation] = useState('')
    const [shouldReset, setShouldReset] = useState(false)

    const handleNumber = (num) => {
        if (display === '0' || shouldReset) {
            setDisplay(num)
            setShouldReset(false)
        } else {
            setDisplay(display + num)
        }
    }

    const handleOperator = (op) => {
        setEquation(display + ' ' + op + ' ')
        setShouldReset(true)
    }

    const calculate = () => {
        try {
            // Yes, eval is evil, but for a client-side calculator with specific inputs it's manageable.
            // Replacing visuals with JS operators
            const expr = (equation + display)
                .replace('×', '*')
                .replace('÷', '/')
                .replace('^', '**')
                .replace('π', Math.PI)
                .replace('e', Math.E)

            // Allow Math functions
            const safeExpr = expr
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/log/g, 'Math.log10')
                .replace(/ln/g, 'Math.log')
                .replace(/sqrt/g, 'Math.sqrt')

            // eslint-disable-next-line
            const result = eval(safeExpr)

            setDisplay(String(Math.round(result * 100000000) / 100000000))
            setEquation('')
            setShouldReset(true)
        } catch (e) {
            setDisplay('Error')
            setShouldReset(true)
        }
    }

    const clear = () => {
        setDisplay('0')
        setEquation('')
        setShouldReset(false)
    }

    const buttons = [
        ['C', '(', ')', '÷'],
        ['sin', 'cos', 'tan', '×'],
        ['7', '8', '9', '-'],
        ['4', '5', '6', '+'],
        ['1', '2', '3', '='],
        ['0', '.', 'π', '^']
    ]

    return (
        <ToolLayout title="Scientific Calculator" description="Perform complex mathematical calculations.">
            <div className="max-w-md mx-auto">
                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800">
                    {/* Display */}
                    <div className="bg-slate-800 rounded-2xl p-4 mb-6 text-right h-32 flex flex-col justify-end overflow-hidden">
                        <div className="text-slate-400 text-sm h-6">{equation}</div>
                        <div className="text-white text-4xl font-mono font-bold tracking-wider">{display}</div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-4 gap-3">
                        {/* Custom Function Row */}
                        <button onClick={clear} className="col-span-1 p-4 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-colors">AC</button>
                        <button onClick={() => handleNumber('(')} className="p-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors">(</button>
                        <button onClick={() => handleNumber(')')} className="p-4 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors">)</button>
                        <button onClick={() => handleOperator('/')} className="p-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">÷</button>

                        <button onClick={() => handleNumber('sin(')} className="p-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors">sin</button>
                        <button onClick={() => handleNumber('cos(')} className="p-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors">cos</button>
                        <button onClick={() => handleNumber('tan(')} className="p-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors">tan</button>
                        <button onClick={() => handleOperator('*')} className="p-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">×</button>

                        {[7, 8, 9].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-colors shadow-lg">{n}</button>)}
                        <button onClick={() => handleOperator('-')} className="p-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">-</button>

                        {[4, 5, 6].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-colors shadow-lg">{n}</button>)}
                        <button onClick={() => handleOperator('+')} className="p-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">+</button>

                        {[1, 2, 3].map(n => <button key={n} onClick={() => handleNumber(String(n))} className="p-4 rounded-xl bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-colors shadow-lg">{n}</button>)}
                        <button onClick={calculate} className="row-span-2 p-4 rounded-xl bg-blue-600 text-white font-bold text-xl hover:bg-blue-500 transition-colors shadow-xl flex items-center justify-center">=</button>

                        <button onClick={() => handleNumber('0')} className="col-span-2 p-4 rounded-xl bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-colors shadow-lg">0</button>
                        <button onClick={() => handleNumber('.')} className="p-4 rounded-xl bg-slate-700 text-white font-bold text-xl hover:bg-slate-600 transition-colors">.</button>
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
