import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, MessageSquare, MoreHorizontal, Flag } from 'lucide-react'
import { updateTaskAsync, deleteTaskAsync } from '../features/workspaceSlice'
import CreateTaskDialog from '../components/CreateTaskDialog'
import toast from 'react-hot-toast'

// Sample fallback tasks for offline/demo mode when workspace has no tasks
const fallbackTasks = [
    // To do
    {
        id: 'task-fb-1',
        title: 'Fix Chart Tooltip Coordinate Clipping on Mobile',
        category: 'QA',
        priority: 'MEDIUM',
        status: 'TODO',
        dueText: 'In 6 days',
        commentsCount: 0,
        assignees: [{ name: 'Priya Verma', initials: 'PV', bg: 'bg-rose-100 text-rose-700' }],
    },
    {
        id: 'task-fb-2',
        title: 'Export Analytics Reports to CSV and PDF',
        category: 'Backend',
        priority: 'LOW',
        status: 'TODO',
        dueText: 'In 9 days',
        commentsCount: 0,
        assignees: [{ name: 'Arjun Patel', initials: 'AP', bg: 'bg-amber-100 text-amber-700' }],
    },
    {
        id: 'task-fb-3',
        title: 'Implement Granular Project Audit Logging',
        category: 'Backend',
        priority: 'MEDIUM',
        status: 'TODO',
        dueText: 'In 12 days',
        commentsCount: 0,
        assignees: [
            { name: 'Arjun Patel', initials: 'AP', bg: 'bg-amber-100 text-amber-700' },
            { name: 'Sneha Gupta', initials: 'SG', bg: 'bg-purple-100 text-purple-700' },
        ],
    },
    {
        id: 'task-fb-4',
        title: 'AI Feedback Scoring & Rubric Generation Engine',
        category: 'Frontend',
        priority: 'HIGH',
        status: 'TODO',
        dueText: 'In 5 days',
        commentsCount: 0,
        assignees: [{ name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' }],
    },
    // In progress
    {
        id: 'task-fb-5',
        title: 'Implement Interactive KPI Metric Cards',
        category: 'Frontend',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueText: 'In 2 days',
        commentsCount: 2,
        hasBar: true,
        assignees: [
            { name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' },
            { name: 'Priya Verma', initials: 'PV', bg: 'bg-rose-100 text-rose-700' },
        ],
    },
    {
        id: 'task-fb-6',
        title: 'Prisma Connection Pool Optimization for Neon',
        category: 'Backend',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueText: 'In 3 days',
        commentsCount: 1,
        hasBar: true,
        assignees: [{ name: 'Rahul Mehta', initials: 'RM', bg: 'bg-emerald-100 text-emerald-700' }],
    },
    {
        id: 'task-fb-7',
        title: 'Audio Stream Transcription & Latency Benchmarks',
        category: 'Frontend',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueText: 'In 4 days',
        commentsCount: 1,
        hasBar: true,
        assignees: [
            { name: 'Ananya Singh', initials: 'AS', bg: 'bg-indigo-100 text-indigo-700' },
            { name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' },
        ],
    },
    {
        id: 'task-fb-8',
        title: 'Interactive Interview Session Control Console',
        category: 'Frontend',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueText: 'In 8 days',
        commentsCount: 0,
        hasBar: true,
        assignees: [{ name: 'Priya Verma', initials: 'PV', bg: 'bg-rose-100 text-rose-700' }],
    },
    // In review
    {
        id: 'task-fb-9',
        title: 'Optimize Analytics Aggregation Queries',
        category: 'QA',
        priority: 'HIGH',
        status: 'IN_REVIEW',
        dueText: 'Tomorrow',
        commentsCount: 1,
        assignees: [{ name: 'Ananya Singh', initials: 'AS', bg: 'bg-indigo-100 text-indigo-700' }],
    },
    {
        id: 'task-fb-10',
        title: 'Fix Token Refresh Race Condition on Parallel Requests',
        category: 'Backend',
        priority: 'HIGH',
        status: 'IN_REVIEW',
        dueText: 'In 2 days',
        commentsCount: 1,
        hasBar: true,
        assignees: [{ name: 'Ananya Singh', initials: 'AS', bg: 'bg-indigo-100 text-indigo-700' }],
    },
    // Done
    {
        id: 'task-fb-11',
        title: 'JWT Authentication & Session Refresh Architecture',
        category: 'Backend',
        priority: 'HIGH',
        status: 'DONE',
        dueText: 'Sep 20',
        commentsCount: 1,
        hasBar: true,
        assignees: [{ name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' }],
    },
    {
        id: 'task-fb-12',
        title: 'Design Real-time Recharts Trend Visualizations',
        category: 'Frontend',
        priority: 'MEDIUM',
        status: 'DONE',
        dueText: 'Oct 15',
        commentsCount: 1,
        hasBar: true,
        assignees: [
            { name: 'Priya Verma', initials: 'PV', bg: 'bg-rose-100 text-rose-700' },
            { name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' },
        ],
    },
    {
        id: 'task-fb-13',
        title: 'WCAG 2.1 AA Accessibility & Keyboard Navigation Audit',
        category: 'QA',
        priority: 'HIGH',
        status: 'DONE',
        dueText: 'Aug 15',
        commentsCount: 1,
        assignees: [
            { name: 'Sneha Gupta', initials: 'SG', bg: 'bg-purple-100 text-purple-700' },
            { name: 'Rishi Raj', initials: 'RR', bg: 'bg-[#fde3cf] text-[#b45309]' },
        ],
    },
]

export default function Tasks() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace)
    const authUser = useSelector((state) => state.auth?.user)

    const [activeFilter, setActiveFilter] = useState('All')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [openMenuId, setOpenMenuId] = useState(null)

    // Collect all tasks across all projects
    const allWorkspaceTasks = useMemo(() => {
        if (!currentWorkspace?.projects) return []
        return currentWorkspace.projects.flatMap((project) =>
            (project.tasks || []).map((t) => ({ ...t, projectName: project.name }))
        )
    }, [currentWorkspace])

    // Normalize real tasks and merge with fallback if empty
    const tasksList = useMemo(() => {
        if (allWorkspaceTasks.length > 0) {
            return allWorkspaceTasks.map((t) => {
                const due = t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Flexible'
                const assigneeName = t.assignee?.name || 'Alex'
                const inits = assigneeName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                return {
                    id: t.id,
                    projectId: t.projectId,
                    title: t.title,
                    category: t.type === 'FEATURE' ? 'Frontend' : t.type === 'BUG' ? 'QA' : 'Design',
                    priority: t.priority || 'MEDIUM',
                    status: t.status === 'DONE' ? 'DONE' : t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'TODO',
                    dueText: due,
                    commentsCount: (t.comments || []).length,
                    hasBar: t.status === 'DONE' || t.status === 'IN_PROGRESS',
                    assignees: [{ name: assigneeName, initials: inits, bg: 'bg-blue-100 text-blue-700' }],
                }
            })
        }
        return fallbackTasks
    }, [allWorkspaceTasks])

    // Filter tasks
    const filteredTasks = useMemo(() => {
        if (activeFilter === 'My tasks') {
            return tasksList.filter((t) => t.assignees.some((a) => a.name.includes(authUser?.name || 'Rishi Raj')))
        }
        if (activeFilter === 'High priority') {
            return tasksList.filter((t) => t.priority === 'HIGH')
        }
        if (activeFilter === 'Due this week') {
            return tasksList.filter((t) => t.dueText.includes('day') || t.dueText.includes('Tomorrow'))
        }
        return tasksList
    }, [tasksList, activeFilter, authUser])

    // Status columns definitions
    const columns = [
        { key: 'TODO', label: 'To do', dotColor: 'bg-slate-400', count: filteredTasks.filter((t) => t.status === 'TODO').length },
        { key: 'IN_PROGRESS', label: 'In progress', dotColor: 'bg-amber-500', count: filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length },
        { key: 'IN_REVIEW', label: 'In review', dotColor: 'bg-blue-500', count: filteredTasks.filter((t) => t.status === 'IN_REVIEW').length },
        { key: 'DONE', label: 'Done', dotColor: 'bg-emerald-500', count: filteredTasks.filter((t) => t.status === 'DONE').length },
    ]

    const handleMoveStatus = (task, newStatus) => {
        if (task.projectId) {
            dispatch(updateTaskAsync({ ...task, status: newStatus }))
            toast.success(`Moved to ${newStatus.replace('_', ' ')}`)
        } else {
            toast.success(`Moved to ${newStatus.replace('_', ' ')}`)
        }
        setOpenMenuId(null)
    }

    const handleDelete = (task) => {
        if (task.projectId) {
            dispatch(deleteTaskAsync([task.id]))
            toast.success('Task deleted')
        } else {
            toast.success('Task removed')
        }
        setOpenMenuId(null)
    }

    const categoryBadgeStyle = (cat) => {
        switch (cat) {
            case 'Frontend':
                return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
            case 'Backend':
                return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60'
            case 'Design':
                return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60'
            case 'Marketing':
                return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60'
            case 'QA':
                return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60'
            default:
                return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Tasks
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Drag a card to another stage, or use its menu to move it.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="size-4" strokeWidth={2.5} />
                    <span>New Task</span>
                </button>
            </div>

            {/* Filter Pill Strip & Tasks count indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="inline-flex items-center p-1 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs">
                    {['All', 'My tasks', 'High priority', 'Due this week'].map((pill) => (
                        <button
                            key={pill}
                            type="button"
                            onClick={() => setActiveFilter(pill)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                activeFilter === pill
                                    ? 'bg-[#0f172a] text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {pill}
                        </button>
                    ))}
                </div>

                <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {filteredTasks.length} tasks shown
                </span>
            </div>

            {/* 4 Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {columns.map((col) => {
                    const columnTasks = filteredTasks.filter((t) => t.status === col.key)

                    return (
                        <div
                            key={col.key}
                            className="bg-slate-100/60 dark:bg-[#111726]/40 border border-slate-200/70 dark:border-slate-800/60 rounded-[24px] p-3.5 space-y-3 min-h-[500px]"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${col.dotColor}`} />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        {col.label}
                                    </h3>
                                </div>
                                <span className="size-5 rounded-full bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs">
                                    {col.count}
                                </span>
                            </div>

                            {/* Column Task Cards */}
                            <div className="space-y-3">
                                {columnTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => {
                                            if (task.projectId) {
                                                navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                            }
                                        }}
                                        className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all group relative cursor-pointer"
                                    >
                                        {/* Top Tag Row */}
                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${categoryBadgeStyle(task.category)}`}>
                                                    {task.category}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[11px] font-semibold ${
                                                    task.priority === 'HIGH'
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : task.priority === 'MEDIUM'
                                                        ? 'text-amber-600 dark:text-amber-400'
                                                        : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    <Flag className="size-3" />
                                                    <span className="capitalize">{task.priority?.toLowerCase()}</span>
                                                </span>
                                            </div>

                                            {/* Actions Menu Trigger */}
                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMenuId === task.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-lg z-30">
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Move stage</p>
                                                        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map((st) => (
                                                            <button
                                                                key={st}
                                                                type="button"
                                                                onClick={() => handleMoveStatus(task, st)}
                                                                className="w-full text-left px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                                                            >
                                                                {st.replace('_', ' ')}
                                                            </button>
                                                        ))}
                                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(task)}
                                                            className="w-full text-left px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md"
                                                        >
                                                            Delete Task
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Task Title */}
                                        <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug">
                                            {task.title}
                                        </h4>

                                        {/* Green / Teal progress line if active */}
                                        {task.hasBar && (
                                            <div className="w-full h-1 bg-emerald-600 dark:bg-emerald-500 rounded-full my-2.5" />
                                        )}

                                        {/* Footer Row (Due date, comment count, avatars) */}
                                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3.5 text-slate-400" />
                                                    {task.dueText}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="size-3.5 text-slate-400" />
                                                    {task.commentsCount}
                                                </span>
                                            </div>

                                            {/* Assignee circles */}
                                            <div className="flex -space-x-1.5 items-center">
                                                {task.assignees.map((assignee, aIdx) => (
                                                    <div
                                                        key={aIdx}
                                                        className={`size-6 rounded-full ${assignee.bg} flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-[#111726] shadow-2xs`}
                                                        title={assignee.name}
                                                    >
                                                        {assignee.initials}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {columnTasks.length === 0 && (
                                    <div className="py-10 text-center text-xs text-slate-400">
                                        No tasks in this stage
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <CreateTaskDialog showCreateTask={isCreateOpen} setShowCreateTask={setIsCreateOpen} />
        </div>
    )
}
