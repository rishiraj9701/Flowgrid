import { useState } from 'react'
import { Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import toast from 'react-hot-toast'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'

export default function Analytics() {
    const [timeRange, setTimeRange] = useState('30D')

    // Sparklines data for top metric cards
    const sparklineData = [
        { v: 18 }, { v: 22 }, { v: 20 }, { v: 28 }, { v: 24 }, { v: 30 }, { v: 36 },
    ]

    // Dual throughput data (Current vs Previous period)
    const throughputData = [
        { date: 'Sep 27', current: 7.2, previous: 6.8 },
        { date: 'Sep 30', current: 7.4, previous: 7.1 },
        { date: 'Oct 4', current: 6.9, previous: 7.3 },
        { date: 'Oct 8', current: 7.6, previous: 7.0 },
        { date: 'Oct 12', current: 8.1, previous: 7.4 },
        { date: 'Oct 15', current: 8.3, previous: 7.8 },
        { date: 'Oct 19', current: 7.8, previous: 8.0 },
        { date: 'Oct 23', current: 8.2, previous: 7.9 },
        { date: 'Oct 26', current: 7.9, previous: 8.1 },
    ]

    // Donut project breakdown
    const donutData = [
        { name: 'Nexus Analytics Dashboard', hours: '320h', value: 320, color: '#0f172a' },
        { name: 'SaaS Platform Development', hours: '280h', value: 280, color: '#10b981' },
        { name: 'Portfolio Website Redesign', hours: '240h', value: 240, color: '#06b6d4' },
        { name: 'AI Interview Preparation', hours: '160h', value: 160, color: '#f59e0b' },
    ]

    // 20-week activity heatmap generator
    const activityWeeks = Array.from({ length: 20 }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
            // Generate realistic heatmap intensity
            const seed = (w * 7 + d * 3) % 11
            if (seed > 8) return 'bg-[#0f172a] dark:bg-emerald-400'
            if (seed > 5) return 'bg-emerald-600 dark:bg-emerald-600'
            if (seed > 3) return 'bg-emerald-400 dark:bg-emerald-700'
            if (seed > 1) return 'bg-emerald-200 dark:bg-emerald-900/60'
            return 'bg-slate-100 dark:bg-slate-800'
        })
    )

    // Top contributors
    const contributors = [
        { name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]', score: 58, pct: 100 },
        { name: 'Rahul Mehta', initials: 'RM', bg: 'bg-emerald-100 text-emerald-700', score: 51, pct: 88 },
        { name: 'Arjun Patel', initials: 'AP', bg: 'bg-amber-100 text-amber-700', score: 46, pct: 80 },
        { name: 'Priya Verma', initials: 'PV', bg: 'bg-rose-100 text-rose-700', score: 42, pct: 74 },
        { name: 'Ananya Singh', initials: 'AS', bg: 'bg-indigo-100 text-indigo-700', score: 34, pct: 60 },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        How the team is shipping, and where the time goes.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time range pills */}
                    <div className="inline-flex items-center p-1 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
                        {['7D', '30D', '90D'].map((range) => (
                            <button
                                key={range}
                                type="button"
                                onClick={() => setTimeRange(range)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                    timeRange === range
                                        ? 'bg-[#0f172a] text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => toast.success('Exporting Analytics CSV report...')}
                        className="px-4 py-2 rounded-full border border-slate-900 dark:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                        <Download className="size-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* 4 Metric Cards with Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tasks completed', value: '216', change: '^ 0.5% vs previous 30d', positive: true },
                    { label: 'Hours tracked', value: '1,197', change: '^ 5.7% vs previous 30d', positive: true },
                    { label: 'On-time delivery', value: '91%', change: '^ 2.2% vs previous 30d', positive: true },
                    { label: 'Avg. cycle time', value: '2.9 d', change: 'v 6.5% vs previous 30d', positive: false },
                ].map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 shadow-xs flex flex-col justify-between overflow-hidden relative"
                    >
                        <div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {card.label}
                            </span>
                            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 leading-none">
                                {card.value}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                                {card.positive ? (
                                    <ArrowUpRight className="size-3" />
                                ) : (
                                    <ArrowDownRight className="size-3" />
                                )}
                                {card.change}
                            </span>
                        </div>

                        {/* Subtle sparkline curve */}
                        <div className="h-10 w-full mt-2 -mb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id={`sparkGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="v"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill={`url(#sparkGrad-${idx})`}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Row: Throughput Area Chart & Time by Project Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Throughput Area Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Throughput
                            </h3>
                            <p className="text-xs text-slate-400">
                                Tasks completed per day, 7-day average, against the previous period
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                                <span className="w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
                                <span>This period</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="w-3.5 h-0.5 border-t border-dashed border-slate-400" />
                                <span>Previous</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={throughputData}>
                                <defs>
                                    <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 12]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} ticks={[0, 3, 6, 9, 12]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="current"
                                    stroke="#10b981"
                                    strokeWidth={2.5}
                                    fill="url(#throughputGrad)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="previous"
                                    stroke="#94a3b8"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 4"
                                    fill="none"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Time by Project Donut Chart */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                            Time by project
                        </h3>

                        {/* Donut Chart with Center Label */}
                        <div className="relative h-48 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        dataKey="value"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute text-center">
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                                    1,197h
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    tracked · 30d
                                </p>
                            </div>
                        </div>

                        {/* Breakdown list */}
                        <div className="space-y-2 mt-2">
                            {donutData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {item.hours}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: 20-week Activity Heatmap & Top Contributors */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* 20-Week Activity Heatmap */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Activity
                            </h3>
                            <p className="text-xs text-slate-400">
                                Commits, comments and status changes, last 20 weeks
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span>Less</span>
                            <span className="size-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                            <span className="size-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900/60" />
                            <span className="size-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
                            <span className="size-2.5 rounded-xs bg-[#0f172a] dark:bg-emerald-400" />
                            <span>More</span>
                        </div>
                    </div>

                    {/* Matrix Grid */}
                    <div className="overflow-x-auto pb-2">
                        <div className="flex gap-1.5 min-w-[500px]">
                            {activityWeeks.map((week, wIdx) => (
                                <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                                    {week.map((colorClass, dIdx) => (
                                        <div
                                            key={dIdx}
                                            className={`size-4 sm:size-5 rounded-md ${colorClass} transition-transform hover:scale-110 cursor-pointer`}
                                            title={`Week ${wIdx + 1}, Day ${dIdx + 1}`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Contributors */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                            Top contributors
                        </h3>

                        <div className="space-y-4">
                            {contributors.map((c, i) => (
                                <div key={i} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className={`size-8 rounded-full ${c.bg} flex items-center justify-center text-xs font-bold shrink-0`}>
                                            {c.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {c.name}
                                            </p>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                                                    style={{ width: `${c.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {c.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
