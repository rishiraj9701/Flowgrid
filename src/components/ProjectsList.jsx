import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import CreateProjectDialog from './CreateProjectDialog'

export default function ProjectsList() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const realProjects = currentWorkspace?.projects || []

    // Built-in geometric icons for project categories
    const iconStyles = [
        {
            render: () => (
                <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center p-1.5 shrink-0">
                    <svg viewBox="0 0 24 24" className="size-5 text-blue-600 dark:text-blue-400 stroke-current stroke-2">
                        <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2.5" />
                        <line x1="2" y1="14" x2="14" y2="2" strokeWidth="2.5" />
                        <line x1="10" y1="22" x2="22" y2="10" strokeWidth="2.5" />
                    </svg>
                </div>
            ),
        },
        {
            render: () => (
                <div className="size-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 flex items-center justify-center shrink-0">
                    <div className="size-4.5 rounded-full bg-teal-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-teal-700 w-1/2 h-1/2" />
                    </div>
                </div>
            ),
        },
        {
            render: () => (
                <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center shrink-0">
                    <div className="relative size-4.5">
                        <div className="absolute inset-0 m-auto w-4.5 h-1.5 bg-amber-500 rounded-sm" />
                        <div className="absolute inset-0 m-auto w-1.5 h-4.5 bg-rose-500 rounded-sm" />
                    </div>
                </div>
            ),
        },
        {
            render: () => (
                <div className="size-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-800 flex items-center justify-center shrink-0">
                    <div className="size-4.5 rounded-full bg-orange-500 relative">
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-300 rounded-tr-full" />
                    </div>
                </div>
            ),
        },
        {
            render: () => (
                <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-center shrink-0">
                    <div className="flex -space-x-1">
                        <div className="size-2.5 rounded-full bg-indigo-600" />
                        <div className="size-2.5 rounded-full bg-blue-500" />
                    </div>
                </div>
            ),
        },
    ]

    // Fallback items if workspace has fewer projects
    const fallbackProjects = [
        { id: 'proj_analytics_01', name: 'Nexus Analytics Dashboard', due: 'Nov 20, 2026' },
        { id: 'proj_saas_02', name: 'SaaS Platform Development', due: 'Dec 20, 2026' },
        { id: 'proj_portfolio_03', name: 'Portfolio Website Redesign', due: 'Sep 30, 2026' },
        { id: 'proj_ai_prep_04', name: 'AI Interview Preparation', due: 'Jan 30, 2027' },
    ]

    const displayedProjects = realProjects.length > 0
        ? realProjects.slice(0, 5).map((p, idx) => ({
              id: p.id,
              name: p.name,
              due: p.end_date ? new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : fallbackProjects[idx % fallbackProjects.length].due,
          }))
        : fallbackProjects

    return (
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Project
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-800 dark:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white transition-all cursor-pointer"
                    >
                        <Plus className="size-3" strokeWidth={2.5} />
                        <span>New</span>
                    </button>
                </div>

                {/* Projects List */}
                <div className="space-y-3.5">
                    {displayedProjects.map((proj, idx) => {
                        const IconComponent = iconStyles[idx % iconStyles.length]
                        return (
                            <Link
                                key={proj.id}
                                to={`/projectsDetail?id=${proj.id}&tab=tasks`}
                                className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                {IconComponent.render()}
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {proj.name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                        Due date: {proj.due}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    )
}
