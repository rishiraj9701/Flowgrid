import { useEffect, useRef, useState, useMemo } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import WorkspaceDropdown from './WorkspaceDropdown'
import WorkspaceSettingsDialog from './WorkspaceSettingsDialog'
import { logoutUser, exitDemoMode } from '../features/authSlice'
import {
    LayoutDashboard,
    CheckSquare,
    Calendar,
    BarChart3,
    Users,
    FolderOpen,
    Settings,
    HelpCircle,
    LogOut,
    Layers,
} from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { currentWorkspace } = useSelector((state) => state.workspace)
    const { isDemoMode } = useSelector((state) => state.auth)

    // Calculate total open tasks for badge counter
    const openTasksCount = useMemo(() => {
        if (!currentWorkspace?.projects) return 10
        const total = currentWorkspace.projects.reduce((acc, p) => {
            return acc + (p.tasks || []).filter((t) => t.status !== 'DONE').length
        }, 0)
        return total > 0 ? total : 10
    }, [currentWorkspace])

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Tasks', href: '/tasks', icon: CheckSquare, badge: openTasksCount },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Projects', href: '/projects', icon: FolderOpen },
        { name: 'Team', href: '/team', icon: Users },
    ]

    const generalItems = [
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Help', href: '/help', icon: HelpCircle },
    ]

    const sidebarRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setIsSidebarOpen])

    const handleLogout = () => {
        if (isDemoMode) {
            dispatch(exitDemoMode())
        } else {
            dispatch(logoutUser())
        }
        navigate('/')
    }

    return (
        <>
            <aside
                ref={sidebarRef}
                className={`z-40 w-64 xl:w-68 shrink-0 flex flex-col bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-300 max-lg:fixed max-lg:top-3 max-lg:bottom-3 max-lg:left-3 ${
                    isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-[115%] lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col min-h-0 flex-1">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-3">
                        <Link
                            to="/"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 focus:outline-none group"
                            aria-label="Flowgrid home"
                        >
                            <div className="size-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                                <Layers className="size-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Flowgrid
                            </span>
                        </Link>
                    </div>

                    {/* Workspace Selector */}
                    <div className="mb-4">
                        <WorkspaceDropdown />
                    </div>

                    {/* Navigation scrollable area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-0.5">
                        {/* MENU Group */}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                                Menu
                            </p>
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        end={item.href === '/'}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${
                                                isActive
                                                    ? 'bg-slate-100/90 dark:bg-slate-800/70 text-slate-900 dark:text-white font-bold shadow-2xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {/* Active indicator pill on left edge */}
                                                {isActive && (
                                                    <span className="absolute -left-2 top-2 bottom-2 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                                )}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <item.icon
                                                        className={`size-4.5 shrink-0 transition-colors ${
                                                            isActive
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                        }`}
                                                        strokeWidth={isActive ? 2.2 : 1.8}
                                                    />
                                                    <span className="truncate">{item.name}</span>
                                                </div>

                                                {item.badge !== undefined && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        isActive
                                                            ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                                            : 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-300'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>

                        {/* GENERAL Group */}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
                                General
                            </p>
                            <nav className="space-y-1">
                                {generalItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${
                                                isActive
                                                    ? 'bg-slate-100/90 dark:bg-slate-800/70 text-slate-900 dark:text-white font-bold shadow-2xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span className="absolute -left-2 top-2 bottom-2 w-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                                )}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <item.icon
                                                        className={`size-4.5 shrink-0 transition-colors ${
                                                            isActive
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                        }`}
                                                        strokeWidth={isActive ? 2.2 : 1.8}
                                                    />
                                                    <span className="truncate">{item.name}</span>
                                                </div>
                                            </>
                                        )}
                                    </NavLink>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 transition-all text-left"
                                >
                                    <LogOut className="size-4.5 text-slate-400 group-hover:text-rose-500" strokeWidth={1.8} />
                                    <span>{isDemoMode ? 'Exit Demo' : 'Logout'}</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

            </aside>

            {/* Workspace Settings Dialog */}
            <WorkspaceSettingsDialog
                isDialogOpen={isSettingsOpen}
                setIsDialogOpen={setIsSettingsOpen}
            />
        </>
    )
}

export default Sidebar
