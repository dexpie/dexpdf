import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Divide, ArrowRight, Zap } from 'lucide-react'

export default function PrimeFactorTool() {
    const [num, setNum] = useState('')
    const [result, setResult] = useState(null)

    const calculate = () => {
        const n = parseInt(num)
        if (isNaN(n) || n < 1) return

        const factors = []
        let d = 2
        let temp = n
        while (d * d <= temp) {
            while (temp % d === 0) {
                factors.push(d)
                temp /= d
            }
            d++
        }
        if (temp > 1) factors.push(temp)

        setResult({
            isPrime: factors.length === 1 && factors[0] === n,
            factors
        })
    }

    return (
        <ToolLayout title="Prime Factorization" description="Break numbers down into primes.">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-card p-8 rounded-[2rem] shadow-xl border border-border">
                    <div className="flex gap-4">
                        <input
                            type="number"
                            value={num}
                            onChange={e => setNum(e.target.value)}
                            placeholder="Enter an integer..."
                            className="flex-1 text-2xl font-black p-4 bg-secondary rounded-xl outline-none focus:ring-2 ring-indigo-500"
                        />
                        <button onClick={calculate} className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-colors">
                            <ArrowRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {result && (
                    <div className={`p-8 rounded-[2rem] shadow-lg border-2 text-center transition-all ${result.isPrime ? 'bg-emerald-500/10 border-green-200' : 'bg-card border-border'}`}>
                        <div className="mb-4">
                            {result.isPrime ? (
                                <div className="inline-block px-4 py-2 bg-green-200 text-green-800 rounded-lg font-bold">PRIME NUMBER</div>
                            ) : (
                                <div className="inline-block px-4 py-2 bg-secondary text-muted-foreground rounded-lg font-bold">COMPOSITE NUMBER</div>
                            )}
                        </div>

                        <div className="text-muted-foreground font-bold mb-2">Prime Factors</div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {result.factors.map((f, i) => (
                                <React.Fragment key={i}>
                                    <span className="text-4xl font-black text-foreground">{f}</span>
                                    {i < result.factors.length - 1 && <span className="text-2xl text-muted-foreground font-bold py-2">×</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
