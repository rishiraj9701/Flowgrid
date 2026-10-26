import { useState } from 'react'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

export default function Calendar() {
    const [selectedDate, setSelectedDate] = useState(26)
    const [currentMonth, setCurrentMonth] = useState('October 2026')


    // Days grid for October 2026 (matching reference exact layout)
    // Starting on Thursday (Oct 1) -> empty Sun, Mon, Tue, Wed (27, 28, 29, 30 prev month)
    const calendarDays = [
        { day: 27, isPrev: true },
        { day: 28, isPrev: true },
        { day: 29, isPrev: true },
        { day: 30, isPrev: true },
        { day: 1 },
        { day: 2 },
        { day: 3 },
        { day: 4 },
        { day: 5 },
        { day: 6 },
        { day: 7 },
        { day: 8 },
        { day: 9 },
        { day: 10 },
        { day: 11 },
        { day: 12 },
        { day: 13 },
        { day: 14 },
        { day: 15 },
        { day: 16 },
        { day: 17 },
        { day: 18 },
        { day: 19 },
        {
            day: 20,
            events: [{ title: 'Design sprint', type: 'Team', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' }],
        },
        { day: 21 },
        { day: 22 },
        {
            day: 23,
            events: [{ title: 'Nexus Sprint...', type: 'Meeting', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' }],
        },
        {
            day: 24,
            events: [{ title: 'Monorepo c...', type: 'Review', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' }],
        },
        { day: 25 },
        {
            day: 26,
            isToday: true,
            events: [
                { title: 'Daily stand-...', type: 'Team', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
                { title: 'Nexus Sprint...', type: 'Meeting', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
            ],
        },
        {
            day: 27,
            events: [
                { title: 'Design revie...', type: 'Review', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
                { title: 'Regression ...', type: 'Deadline', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
            ],
        },
        {
            day: 28,
            events: [{ title: 'Sprint planni...', type: 'Team', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' }],
        },
        {
            day: 29,
            events: [{ title: 'Passkey de...', type: 'Review', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' }],
        },
        { day: 30 },
        {
            day: 31,
            events: [{ title: 'Lunch & lear...', type: 'Social', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' }],
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Calendar
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Meetings, reviews and deadlines across the team.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setSelectedDate(26)}
                    className="px-5 py-2 rounded-full border border-slate-900 dark:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                    <CalendarIcon className="size-4" />
                    <span>Today</span>
                </button>
            </div>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Calendar Grid Card */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs">
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                            {currentMonth}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth((prev) => (prev === 'October 2026' ? 'September 2026' : 'October 2026'))}
                                className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth((prev) => (prev === 'October 2026' ? 'November 2026' : 'October 2026'))}
                                className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day Names Row */}
                    <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                            <div key={d} className="py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((item, idx) => {
                            const isSelected = item.day === selectedDate && !item.isPrev

                            return (
                                <div
                                    key={idx}
                                    onClick={() => !item.isPrev && setSelectedDate(item.day)}
                                    className={`min-h-[85px] sm:min-h-[105px] rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
                                        item.isPrev
                                            ? 'text-slate-300 dark:text-slate-600 bg-transparent'
                                            : isSelected
                                            ? 'bg-white dark:bg-slate-800 ring-2 ring-emerald-600 dark:ring-blue-500 shadow-sm'
                                            : 'bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700 dark:text-blue-400' : ''}`}>
                                        {item.day}
                                    </span>

                                    {/* Events inside day cell */}
                                    <div className="space-y-1">
                                        {item.events?.map((ev, evIdx) => (
                                            <div
                                                key={evIdx}
                                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate ${ev.bg}`}
                                                title={ev.title}
                                            >
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Bottom Legend */}
                    <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>Meeting</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span>Team</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-amber-500" />
                            <span>Review</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-rose-500" />
                            <span>Deadline</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-purple-500" />
                            <span>Social</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Today & Coming Up */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Today Header */}
                    <div>
                        <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                            Today · Monday
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                            October 26
                        </h2>
                    </div>

                    {/* Event Cards with colored left border */}
                    <div className="space-y-3">
                        {/* Event 1 */}
                        <div className="bg-white dark:bg-[#111726] border-l-4 border-l-blue-600 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                            <p className="text-[11px] font-semibold text-slate-400">10:00 am - 10:30 am</p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Daily stand-up</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Team</p>
                            <div className="flex -space-x-1.5 items-center mt-3">
                                <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    RM
                                </div>
                                <div className="size-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    AS
                                </div>
                                <div className="size-6 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    PV
                                </div>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="bg-white dark:bg-[#111726] border-l-4 border-l-emerald-600 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                            <p className="text-[11px] font-semibold text-slate-400">2:00 pm - 4:00 pm</p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Nexus Analytics Sprint Review</h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Meeting</p>
                            <div className="flex -space-x-1.5 items-center mt-3">
                                <div className="size-6 rounded-full bg-[#fde3cf] text-[#b45309] text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    RR
                                </div>
                                <div className="size-6 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                    PV
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coming Up Section */}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Coming up
                        </h3>

                        <div className="space-y-3">
                            {[
                                { date: 'OCT 26', title: 'Daily stand-up', time: 'Today · 10:00 am' },
                                { date: 'OCT 26', title: 'Nexus Analytics Sprint Review', time: 'Today · 2:00 pm' },
                                { date: 'OCT 27', title: 'Design review — auth flow', time: 'Tomorrow · 11:00 am' },
                                { date: 'OCT 27', title: 'Regression sign-off', time: 'Tomorrow · 5:00 pm' },
                                { date: 'OCT 28', title: 'Sprint planning', time: 'Wednesday · 9:30 am' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white dark:hover:bg-[#111726] transition-colors"
                                >
                                    <div className="size-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                                            {item.date.split(' ')[0]}
                                        </span>
                                        <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">
                                            {item.date.split(' ')[1]}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                            {item.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-400">
                                            {item.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
