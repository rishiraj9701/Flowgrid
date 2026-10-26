export default function AnalyticsSummary() {
    const days = [
        { day: 'S', height: '48%', type: 'striped', label: 'Sunday · 48%' },
        { day: 'M', height: '84%', type: 'solid-dark', label: 'Monday · 84%' },
        { day: 'T', height: '74%', type: 'active-peak', label: 'Tuesday · 74%' },
        { day: 'W', height: '94%', type: 'solid-dark', label: 'Wednesday · 94%' },
        { day: 'T', height: '88%', type: 'striped', label: 'Thursday · 88%' },
        { day: 'F', height: '64%', type: 'striped', label: 'Friday · 64%' },
        { day: 'S', height: '78%', type: 'striped', label: 'Saturday · 78%' },
    ]

    return (
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Project Analytics
                </h3>
            </div>

            {/* Pill Bar Chart Canvas */}
            <div className="relative pt-10 pb-2">
                <div className="flex items-end justify-between gap-2 sm:gap-3.5 h-44 px-1">
                    {days.map((item, idx) => {
                        const isPeak = item.type === 'active-peak'
                        const isSolid = item.type === 'solid-dark'

                        return (
                            <div
                                key={idx}
                                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            >
                                {/* Tooltip for peak day or hovered day */}
                                {isPeak && (
                                    <div className="mb-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-900 dark:text-white shadow-xs animate-bounce-subtle">
                                        74%
                                    </div>
                                )}

                                {/* Pill Bar */}
                                <div
                                    className={`w-full max-w-[42px] rounded-full transition-all duration-300 relative group-hover:scale-y-[1.03] ${
                                        isPeak
                                            ? 'bg-gradient-to-b from-blue-400 to-indigo-600 shadow-sm'
                                            : isSolid
                                            ? 'bg-[#0f172a] dark:bg-slate-800'
                                            : 'flowgrid-pill-chart-striped border border-slate-200/60 dark:border-slate-700/60'
                                    }`}
                                    style={{ height: item.height }}
                                    title={item.label}
                                />

                                {/* Day Label */}
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {item.day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
