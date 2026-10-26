import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import InviteMemberDialog from './InviteMemberDialog'

export default function TeamCollaboration() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const realMembers = currentWorkspace?.members || []

    const fallbackMembers = [
        {
            initials: 'RR',
            bg: 'bg-[#fde3cf] text-[#b45309] dark:bg-amber-950/60 dark:text-amber-300',
            name: 'Rishi Raj',
            task: 'Interactive KPI Metric Cards',
            status: 'In Progress',
            statusStyle: 'border-amber-600/60 text-amber-600 dark:text-amber-400',
        },
        {
            initials: 'PV',
            bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            name: 'Priya Verma',
            task: 'Trend Visualizations',
            status: 'Completed',
            statusStyle: 'border-emerald-600/60 text-emerald-600 dark:text-emerald-400',
        },
        {
            initials: 'RM',
            bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            name: 'Rahul Mehta',
            task: 'JWT Authentication Architecture',
            status: 'Completed',
            statusStyle: 'border-emerald-600/60 text-emerald-600 dark:text-emerald-400',
        },
        {
            initials: 'AS',
            bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
            name: 'Ananya Singh',
            task: 'Adaptive Question Prompt Templates',
            status: 'Completed',
            statusStyle: 'border-emerald-600/60 text-emerald-600 dark:text-emerald-400',
        },
    ]

    const membersToDisplay = realMembers.length > 0
        ? realMembers.slice(0, 4).map((m, idx) => {
              const f = fallbackMembers[idx % fallbackMembers.length]
              const name = m.user?.name || f.name
              const inits = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              return {
                  initials: inits || f.initials,
                  bg: f.bg,
                  name,
                  task: f.task,
                  status: f.status,
                  statusStyle: f.statusStyle,
              }
          })
        : fallbackMembers

    return (
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Team Collaboration
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-800 dark:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white transition-all cursor-pointer"
                    >
                        <Plus className="size-3" strokeWidth={2.5} />
                        <span>Add Member</span>
                    </button>
                </div>

                {/* Member Rows */}
                <div className="space-y-3.5">
                    {membersToDisplay.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`size-9 rounded-full ${m.bg} flex items-center justify-center text-xs font-bold shrink-0`}>
                                    {m.initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                        {m.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        Working on <span className="font-semibold text-slate-700 dark:text-slate-200">{m.task}</span>
                                    </p>
                                </div>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold shrink-0 ${m.statusStyle}`}>
                                {m.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    )
}
