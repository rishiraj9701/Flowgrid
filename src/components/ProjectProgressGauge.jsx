import { useSelector } from 'react-redux'

export default function ProjectProgressGauge() {
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const projects = currentWorkspace?.projects || []

    const completedCount = projects.filter((p) => p.status === 'COMPLETED').length
    const totalCount = projects.length || 1
    const completionPercent = projects.length > 0 ? Math.round((completedCount / totalCount) * 100) : 25

    return (
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Project Progress
                </h3>
            </div>

            {/* Gauge Canvas */}
            <div className="flex flex-col items-center justify-center my-2 relative">
                <div className="relative w-64 h-32 flex items-end justify-center overflow-hidden">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                        <defs>
                            {/* Striped pattern for pending segment */}
                            <pattern id="gaugeStripes" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="2.5" />
                            </pattern>
                        </defs>

                        {/* Background track arc */}
                        <path
                            d="M 20 95 A 80 80 0 0 1 180 95"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="24"
                            strokeLinecap="round"
                            className="dark:stroke-slate-800"
                        />

                        {/* Completed segment (Navy/Deep Indigo) */}
                        <path
                            d="M 20 95 A 80 80 0 0 1 115 17"
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="24"
                            strokeLinecap="round"
                            className="dark:stroke-blue-600"
                        />

                        {/* In Progress segment (Teal / Light Indigo) */}
                        <path
                            d="M 115 17 A 80 80 0 0 1 155 45"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="24"
                            className="dark:stroke-indigo-400"
                        />

                        {/* Pending striped segment */}
                        <path
                            d="M 155 45 A 80 80 0 0 1 180 95"
                            fill="none"
                            stroke="url(#gaugeStripes)"
                            strokeWidth="24"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Center stats text */}
                    <div className="absolute bottom-1 text-center">
                        <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            {completionPercent}%
                        </span>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                            Project Ended
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="size-2.5 rounded-full bg-[#0f172a] dark:bg-blue-600" />
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="size-2.5 rounded-full bg-blue-500 dark:bg-indigo-400" />
                        <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="size-2.5 rounded-sm border border-slate-400 bg-slate-200 dark:bg-slate-700" />
                        <span>Pending</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
