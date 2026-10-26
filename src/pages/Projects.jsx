import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, FolderOpen } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { dummyWorkspaces } from '../assets/assets.js'

export default function Projects() {
    const [searchParams] = useSearchParams()
    const urlStatus = searchParams.get('status')
    const urlPriority = searchParams.get('priority')

    const rawProjects = useSelector(
        (state) => state?.workspace?.currentWorkspace?.projects || []
    )
    const projects = useMemo(
        () => (rawProjects.length > 0 ? rawProjects : (dummyWorkspaces[0]?.projects || [])),
        [rawProjects]
    )

    const [searchTerm, setSearchTerm] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [filters, setFilters] = useState({
        status: urlStatus || 'ALL',
        priority: urlPriority || 'ALL',
    })

    useEffect(() => {
        if (urlStatus) {
            setFilters((prev) => ({ ...prev, status: urlStatus }))
        }
    }, [urlStatus])

    useEffect(() => {
        if (urlPriority) {
            setFilters((prev) => ({ ...prev, priority: urlPriority }))
        }
    }, [urlPriority])

    const filteredProjects = useMemo(() => {
        let filtered = projects

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (project) =>
                    project.name.toLowerCase().includes(q) ||
                    project.description?.toLowerCase().includes(q)
            )
        }

        if (filters.status !== 'ALL') {
            filtered = filtered.filter((project) => project.status === filters.status)
        }

        if (filters.priority !== 'ALL') {
            filtered = filtered.filter(
                (project) => project.priority === filters.priority
            )
        }

        return filtered
    }, [projects, searchTerm, filters])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Projects
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage and track your projects
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="size-4" strokeWidth={2.5} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Search and Filters Strip */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" strokeWidth={2} />
                    <input
                        type="text"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                        placeholder="Search projects by name..."
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2.5 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none cursor-pointer shadow-2xs"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PLANNING">Planning</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="px-4 py-2.5 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none cursor-pointer shadow-2xs"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white dark:bg-[#111726] rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs">
                        <div className="size-14 mx-auto mb-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <FolderOpen className="size-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            No projects found
                        </h3>
                        <p className="text-slate-400 mb-5 text-xs">
                            {searchTerm || filters.status !== 'ALL' || filters.priority !== 'ALL'
                                ? 'Try adjusting your search query or filters'
                                : 'Create your first project to get started'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2"
                        >
                            <Plus className="size-3.5" strokeWidth={2.5} />
                            <span>Create Project</span>
                        </button>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                )}
            </div>

            <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    )
}
