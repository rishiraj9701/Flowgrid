import { ArrowUpRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { dummyWorkspaces } from '../assets/assets.js'

export default function DashboardMetrics() {
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const rawProjects = currentWorkspace?.projects || []
    const projects = rawProjects.length > 0 ? rawProjects : (dummyWorkspaces[0]?.projects || [])

    const totalProjects = projects.length > 0 ? projects.length : 4
    const endedProjects = projects.filter((p) => p.status === 'COMPLETED').length
    const runningProjects = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PLANNING').length
    const pendingProjects = projects.filter((p) => p.status === 'ON_HOLD' || p.status === 'CANCELLED').length

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Projects */}
            <Link
                to="/projects"
                className="block group cursor-pointer h-full"
                title="View all projects"
            >
                <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Total Projects</span>
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>

                    <div className="my-2">
                        <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            {totalProjects}
                        </p>
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-bold">5 ^</span> Increased from last month
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 2: Ended Projects */}
            <Link
                to="/projects?status=COMPLETED"
                className="block group cursor-pointer h-full"
                title="View completed projects"
            >
                <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Ended Projects</span>
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>

                    <div className="my-2">
                        <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            {endedProjects}
                        </p>
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-bold">6 ^</span> Increased from last month
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 3: Running Projects */}
            <Link
                to="/projects?status=ACTIVE"
                className="block group cursor-pointer h-full"
                title="View active running projects"
            >
                <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Running Projects</span>
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>

                    <div className="my-2">
                        <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            {runningProjects}
                        </p>
                    </div>

                    <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-bold">2 ^</span> Increased from last month
                        </span>
                    </div>
                </div>
            </Link>

            {/* Card 4: Pending Projects */}
            <Link
                to="/projects?status=PLANNING"
                className="block group cursor-pointer h-full"
                title="View pending & planning projects"
            >
                <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[160px] h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Pending Projects</span>
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>

                    <div className="my-2">
                        <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            {pendingProjects}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Awaiting review
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    )
}
