import { useState, useEffect } from 'react'
import { Play, Pause, Square } from 'lucide-react'

export default function TimeTracker() {
    const [seconds, setSeconds] = useState(5048) // Default to 01:24:08
    const [isRunning, setIsRunning] = useState(true)

    useEffect(() => {
        let interval = null
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1)
            }, 1000)
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval)
    }, [isRunning])

    const formatTime = (totalSec) => {
        const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0')
        const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
        const secs = String(totalSec % 60).padStart(2, '0')
        return `${hrs}:${mins}:${secs}`
    }

    const handleReset = () => {
        setIsRunning(false)
        setSeconds(0)
    }

    return (
        <div className="flowgrid-contour-bg rounded-[26px] p-5 sm:p-6 text-white border border-slate-800 shadow-md flex flex-col justify-between h-full relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-300 tracking-wide">
                    Time Tracker
                </h3>
            </div>

            {/* Giant Digital Timer */}
            <div className="relative z-10 py-6 text-center">
                <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm select-none">
                    {formatTime(seconds)}
                </span>
            </div>

            {/* Play/Pause & Stop Action Buttons */}
            <div className="relative z-10 flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={() => setIsRunning(!isRunning)}
                    className="size-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                    title={isRunning ? 'Pause' : 'Start'}
                >
                    {isRunning ? (
                        <Pause className="size-5 fill-slate-900" />
                    ) : (
                        <Play className="size-5 fill-slate-900 translate-x-0.5" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="size-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                    aria-label="Stop and reset timer"
                    title="Stop & Reset"
                >
                    <Square className="size-4.5 fill-white" />
                </button>
            </div>
        </div>
    )
}
