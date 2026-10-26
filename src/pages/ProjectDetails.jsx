import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    ArrowLeft,
    Plus,
    Calendar,
    BarChart3,
    CheckSquare,
    Settings,
    Zap,
} from 'lucide-react'
import ProjectAnalytics from '../components/ProjectAnalytics'
import ProjectSettings from '../components/ProjectSettings'
import CreateTaskDialog from '../components/CreateTaskDialog'
import ProjectCalendar from '../components/ProjectCalendar'
import ProjectTasks from '../components/ProjectTasks'
import { dummyWorkspaces } from '../assets/assets.js'

export default function ProjectDetails() {
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = searchParams.get('tab')
    const id = searchParams.get('id')

    const navigate = useNavigate()
    const rawProjects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || [])
    const projects = useMemo(
        () => (rawProjects.length > 0 ? rawProjects : (dummyWorkspaces[0]?.projects || [])),
        [rawProjects]
    )

    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [showCreateTask, setShowCreateTask] = useState(false)
    const [activeTab, setActiveTab] = useState(tab || 'tasks')

    useEffect(() => {
        if (tab) setActiveTab(tab)
    }, [tab])

    useEffect(() => {
        const pool = projects.length > 0 ? projects : (dummyWorkspaces[0]?.projects || [])
        const proj = pool.find((p) => p.id === id) || (dummyWorkspaces[0]?.projects || []).find((p) => p.id === id)
        if (proj) {
            setProject(proj)
            setTasks(proj?.tasks || [])
        }
    }, [id, projects])

    const statusColors = {
        PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60',
        ON_HOLD: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60',
        COMPLETED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60',
        CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60',
    }

    if (!project) {
        return (
            <div className="py-20 text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">Project not found</p>
                <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="mt-4 px-5 py-2.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold"
                >
                    Back to Projects
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Back to projects"
                        onClick={() => navigate('/projects')}
                        className="size-10 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                    >
                        <ArrowLeft className="size-4" strokeWidth={2} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {project.name}
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors[project.status] || 'bg-slate-100'}`}>
                                {project.status?.replace('_', ' ').toLowerCase()}
                            </span>
                        </div>
                        {project.description && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreateTask(true)}
                    className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="size-4" strokeWidth={2.5} />
                    <span>New Task</span>
                </button>
            </div>

            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                    { label: 'Total Tasks', value: tasks.length, color: 'text-slate-900 dark:text-white' },
                    { label: 'Completed', value: tasks.filter((t) => t.status === 'DONE').length, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length, color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Team Members', value: project.members?.length || 0, color: 'text-blue-600 dark:text-blue-400' },
                ].map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[22px] p-4 sm:p-5 shadow-xs flex items-center justify-between"
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-400">{card.label}</p>
                            <p className={`text-2xl font-extrabold tracking-tight mt-1 leading-none ${card.color}`}>
                                {card.value}
                            </p>
                        </div>
                        <div className="size-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Zap className="size-4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Pill Strip */}
            <div>
                <div className="inline-flex items-center p-1 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
                    {[
                        { key: 'tasks', label: 'Tasks', icon: CheckSquare },
                        { key: 'calendar', label: 'Calendar', icon: Calendar },
                        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { key: 'settings', label: 'Settings', icon: Settings },
                    ].map((tabItem) => (
                        <button
                            key={tabItem.key}
                            type="button"
                            onClick={() => {
                                setActiveTab(tabItem.key)
                                setSearchParams({ id: id, tab: tabItem.key })
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === tabItem.key
                                    ? 'bg-[#0f172a] text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <tabItem.icon className="size-3.5" strokeWidth={2} />
                            <span>{tabItem.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    {activeTab === 'tasks' && <ProjectTasks tasks={tasks} />}
                    {activeTab === 'calendar' && <ProjectCalendar tasks={tasks} />}
                    {activeTab === 'analytics' && <ProjectAnalytics tasks={tasks} project={project} />}
                    {activeTab === 'settings' && <ProjectSettings project={project} />}
                </div>
            </div>

            <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />
        </div>
    )
}
