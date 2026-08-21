import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { DollarSign, PieChart as PieIcon } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function LoanCalculatorTool() {
    const [amount, setAmount] = useState(250000)
    const [rate, setRate] = useState(5.5)
    const [term, setTerm] = useState(30)
    const [monthly, setMonthly] = useState(0)
    const [totalPayment, setTotalPayment] = useState(0)
    const [totalInterest, setTotalInterest] = useState(0)

    useEffect(() => {
        const principal = amount
        const interest = rate / 100 / 12
        const payments = term * 12

        const x = Math.pow(1 + interest, payments)
        const monthlyPayment = (principal * x * interest) / (x - 1)

        if (isFinite(monthlyPayment)) {
            setMonthly(monthlyPayment)
            setTotalPayment(monthlyPayment * payments)
            setTotalInterest((monthlyPayment * payments) - principal)
        }
    }, [amount, rate, term])

    const data = {
        labels: ['Principal', 'Interest'],
        datasets: [
            {
                data: [amount, totalInterest],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderWidth: 1,
            },
        ],
    }

    return (
        <ToolLayout title="Loan Calculator" description="Calculate mortgage or auto loan payments.">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col gap-6">
                    <Input label="Loan Amount ($)" value={amount} onChange={setAmount} />
                    <Input label="Interest Rate (%)" value={rate} onChange={setRate} step="0.1" />
                    <Input label="Loan Term (Years)" value={term} onChange={setTerm} />

                    <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                        <div className="text-muted-foreground text-sm font-bold uppercase mb-1">Monthly Payment</div>
                        <div className="text-4xl font-black font-mono text-green-400">
                            ${monthly.toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-3xl shadow-lg border border-border flex flex-col items-center justify-center">
                    <div className="w-64 h-64">
                        <Pie data={data} />
                    </div>
                    <div className="mt-8 w-full space-y-2">
                        <div className="flex justify-between font-bold text-muted-foreground border-b border-border pb-2">
                            <span>Total Principal</span>
                            <span>${amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-red-500 border-b border-border pb-2">
                            <span>Total Interest</span>
                            <span>${totalInterest.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-black text-foreground pt-2 text-lg">
                            <span>Total Cost</span>
                            <span>${totalPayment.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

            </div>
        </ToolLayout>
    )
}

function Input({ label, value, onChange, step = 1 }) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">{label}</label>
            <input
                type="number" value={value} onChange={e => onChange(Number(e.target.value))} step={step}
                className="w-full p-4 bg-secondary rounded-xl font-bold border border-border outline-none focus:ring-2 ring-blue-500"
            />
        </div>
    )
}
