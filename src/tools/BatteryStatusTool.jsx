import React, { useState, useEffect } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import { Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, AlertTriangle } from 'lucide-react'

export default function BatteryStatusTool() {
    const [battery, setBattery] = useState(null)
    const [supported, setSupported] = useState(true)

    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(batt => {
                updateBattery(batt)
                batt.addEventListener('levelchange', () => updateBattery(batt))
                batt.addEventListener('chargingchange', () => updateBattery(batt))
                batt.addEventListener('chargingtimechange', () => updateBattery(batt))
                batt.addEventListener('dischargingtimechange', () => updateBattery(batt))
            })
        } else {
            setSupported(false)
        }
    }, [])

    const updateBattery = (batt) => {
        setBattery({
            level: batt.level,
            charging: batt.charging,
            chargingTime: batt.chargingTime,
            dischargingTime: batt.dischargingTime
        })
    }

    const formatTime = (seconds) => {
        if (!isFinite(seconds)) return 'Calculating...'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return `${h}h ${m}m`
    }

    if (!supported) {
        return (
            <ToolLayout title="Battery Status" description="Monitor battery level and charging state.">
                <div className="max-w-2xl mx-auto p-8 bg-destructive/10 text-red-600 rounded-3xl text-center border border-red-100">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Not Supported</h3>
                    <p>Your browser does not support the Battery Status API.</p>
                </div>
            </ToolLayout>
        )
    }

    if (!battery) return null

    const levelPercent = Math.round(battery.level * 100)
    let Icon = Battery
    let color = 'text-foreground'
    let barColor = 'bg-slate-800'

    if (battery.charging) {
        Icon = BatteryCharging
        color = 'text-green-500'
        barColor = 'bg-green-500'
    } else if (levelPercent <= 20) {
        Icon = BatteryLow
        color = 'text-red-500'
        barColor = 'bg-red-500'
    } else if (levelPercent <= 50) {
        Icon = BatteryMedium
        color = 'text-orange-500'
        barColor = 'bg-orange-500'
    } else {
        Icon = BatteryFull
        color = 'text-green-500'
        barColor = 'bg-green-500'
    }

    return (
        <ToolLayout title="Battery Status" description="Monitor battery level and charging state.">
            <div className="max-w-md mx-auto">
                <div className="bg-card p-12 rounded-[3rem] shadow-xl border border-border flex flex-col items-center">
                    <div className={`mb-8 relative ${battery.charging ? 'animate-pulse' : ''}`}>
                        <Icon className={`w-32 h-32 ${color}`} strokeWidth={1} />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-black ${color}`}>
                            {levelPercent}%
                        </span>
                    </div>

                    <div className="w-full bg-secondary h-6 rounded-full overflow-hidden mb-8">
                        <div
                            className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                            style={{ width: `${levelPercent}%` }}
                        ></div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
                            <span className="text-muted-foreground font-bold">Status</span>
                            <span className={`font-black ${battery.charging ? 'text-green-500' : 'text-foreground'}`}>
                                {battery.charging ? 'Charging' : 'Discharging'}
                            </span>
                        </div>

                        {battery.charging && (
                            <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
                                <span className="text-muted-foreground font-bold">Time to Full</span>
                                <span className="font-black text-foreground">{formatTime(battery.chargingTime)}</span>
                            </div>
                        )}

                        {!battery.charging && (
                            <div className="flex justify-between items-center p-4 bg-secondary rounded-2xl">
                                <span className="text-muted-foreground font-bold">Time Left</span>
                                <span className="font-black text-foreground">{formatTime(battery.dischargingTime)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    )
}
