import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import InviteMemberDialog from '../components/InviteMemberDialog'

// Complete fallback team roster for offline/demo mode
const fallbackTeam = [
        {
            id: 'm1',
            name: 'Rishi Raj',
            email: 'rishi.raj@flowgrid.app',
            role: 'Project Lead',
            department: 'Management',
            initials: 'RR',
            bg: 'bg-[#fde3cf] text-[#b45309]',
            openTasks: 0,
            completedTasks: 48,
            workload: 64,
            status: 'online',
        },
        {
            id: 'm2',
            name: 'Priya Verma',
            email: 'priya@flowgrid.app',
            role: 'Product Designer',
            department: 'Design',
            initials: 'PV',
            bg: 'bg-rose-100 text-rose-700',
            openTasks: 1,
            completedTasks: 39,
            workload: 72,
            status: 'online',
        },
        {
            id: 'm3',
            name: 'Rahul Mehta',
            email: 'rahul@flowgrid.app',
            role: 'Backend Engineer',
            department: 'Engineering',
            initials: 'RM',
            bg: 'bg-emerald-100 text-emerald-700',
            openTasks: 2,
            completedTasks: 51,
            workload: 88,
            status: 'online',
        },
        {
            id: 'm4',
            name: 'Ananya Singh',
            email: 'ananya@flowgrid.app',
            role: 'Frontend Engineer',
            department: 'Engineering',
            initials: 'AS',
            bg: 'bg-indigo-100 text-indigo-700',
            openTasks: 2,
            completedTasks: 33,
            workload: 56,
            status: 'away',
        },
        {
            id: 'm5',
            name: 'Arjun Patel',
            email: 'arjun@flowgrid.app',
            role: 'Frontend Engineer',
            department: 'Engineering',
            initials: 'AP',
            bg: 'bg-amber-100 text-amber-700',
            openTasks: 2,
            completedTasks: 42,
            workload: 79,
            status: 'online',
        },
        {
            id: 'm6',
            name: 'Sneha Gupta',
            email: 'sneha@flowgrid.app',
            role: 'QA Engineer',
            department: 'Engineering',
            initials: 'SG',
            bg: 'bg-purple-100 text-purple-700',
            openTasks: 1,
            completedTasks: 27,
            workload: 41,
            status: 'offline',
        },
        {
            id: 'm7',
            name: 'Neha Kapoor',
            email: 'neha@flowgrid.app',
            role: 'Brand Designer',
            department: 'Design',
            initials: 'NK',
            bg: 'bg-sky-100 text-sky-700',
            openTasks: 2,
            completedTasks: 24,
            workload: 50,
            status: 'away',
        },
        {
            id: 'm8',
            name: 'Rohan Mishra',
            email: 'rohan@flowgrid.app',
            role: 'Marketing Lead',
            department: 'Marketing',
            initials: 'RM',
            bg: 'bg-amber-100 text-amber-800',
            openTasks: 1,
            completedTasks: 30,
            workload: 67,
            status: 'online',
        },
        {
            id: 'm9',
            name: 'Vikram Joshi',
            email: 'vikram@flowgrid.app',
            role: 'Content Strategist',
            department: 'Marketing',
            initials: 'VJ',
            bg: 'bg-emerald-100 text-emerald-800',
            openTasks: 2,
            completedTasks: 19,
            workload: 35,
            status: 'offline',
        },
    ]

export default function Team() {
    const isDemoMode = useSelector((state) => state.auth?.isDemoMode)
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const realMembers = useMemo(() => currentWorkspace?.members || [], [currentWorkspace])

    const [activeFilter, setActiveFilter] = useState('All')
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // In demo mode, show all 9 fallback team members; otherwise merge real members
    const teamList = useMemo(() => {
        if (!isDemoMode && realMembers.length > 0) {
            return realMembers.map((m, idx) => {
                const f = fallbackTeam[idx % fallbackTeam.length]
                const name = m.user?.name || f.name
                const email = m.user?.email || f.email
                const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                return {
                    id: m.id || `member-${idx}`,
                    name,
                    email,
                    role: m.role || f.role,
                    department: f.department,
                    initials: initials || f.initials,
                    bg: f.bg,
                    openTasks: f.openTasks,
                    completedTasks: f.completedTasks,
                    workload: f.workload,
                    status: f.status,
                }
            })
        }
        return fallbackTeam
    }, [isDemoMode, realMembers])

    // Filter by department
    const filteredTeam = useMemo(() => {
        return teamList.filter((m) => {
            return activeFilter === 'All' || m.department === activeFilter
        })
    }, [teamList, activeFilter])


    const departmentStyle = (dept) => {
        switch (dept) {
            case 'Management':
                return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
            case 'Design':
                return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60'
            case 'Engineering':
                return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60'
            case 'Marketing':
                return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60'
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Team
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Everyone on the workspace, what they&apos;re carrying and who&apos;s around.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="size-4" strokeWidth={2.5} />
                    <span>Invite member</span>
                </button>
            </div>

            {/* Filter Strip & Online Counter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="inline-flex items-center p-1 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
                    {['All', 'Engineering', 'Design', 'Marketing', 'Management'].map((dept) => (
                        <button
                            key={dept}
                            type="button"
                            onClick={() => setActiveFilter(dept)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                activeFilter === dept
                                    ? 'bg-[#0f172a] text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                <span className="text-xs font-bold text-slate-900 dark:text-white">
                    5 online now
                </span>
            </div>

            {/* 4-Column Grid of Member Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredTeam.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center justify-between min-h-[350px]"
                    >
                        {/* Avatar with Status Dot */}
                        <div className="relative mb-3">
                            <div className={`size-16 rounded-full ${member.bg} flex items-center justify-center text-base font-extrabold shadow-sm`}>
                                {member.initials}
                            </div>
                            <span
                                className={`size-3.5 rounded-full ring-2 ring-white dark:ring-[#111726] absolute bottom-0 right-0 ${
                                    member.status === 'online'
                                        ? 'bg-emerald-500'
                                        : member.status === 'away'
                                        ? 'bg-amber-400'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                                title={member.status}
                            />
                        </div>

                        {/* Name & Role */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                {member.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {member.role}
                            </p>
                            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${departmentStyle(member.department)}`}>
                                {member.department}
                            </span>
                        </div>

                        {/* Stats Row */}
                        <div className="w-full my-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="grid grid-cols-2 gap-2 text-center mb-3">
                                <div>
                                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {member.openTasks}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">Open tasks</p>
                                </div>
                                <div>
                                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {member.completedTasks}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">Completed</p>
                                </div>
                            </div>

                            {/* Workload Progress Bar */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span>Workload</span>
                                    <span>{member.workload}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${
                                            member.workload > 80
                                                ? 'bg-amber-500'
                                                : 'bg-emerald-600 dark:bg-emerald-500'
                                        }`}
                                        style={{ width: `${member.workload}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Message & Profile */}
                        <div className="w-full flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => toast.success(`Direct message opened with ${member.name}`)}
                                className="flex-1 py-2 px-3 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                            >
                                Message
                            </button>
                            <button
                                type="button"
                                onClick={() => toast(`${member.name}'s profile details`, { icon: '👤' })}
                                className="flex-1 py-2 px-3 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                            >
                                Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    )
}
