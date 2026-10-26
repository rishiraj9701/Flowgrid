import { useState, useRef, useEffect, useMemo } from 'react'
import {
    SearchIcon,
    PanelLeft,
    MoonIcon,
    SunIcon,
    Folder,
    CheckSquare,
    X,
    ArrowRight,
    Mail,
    Bell,
    User,
    LogOut,
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toggleTheme } from '../features/themeSlice'
import { logoutUser, exitDemoMode } from '../features/authSlice'
import AuthDialog from './AuthDialog'

const Navbar = ({ setIsSidebarOpen }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { theme } = useSelector((state) => state.theme)
    const { currentWorkspace } = useSelector((state) => state.workspace)
    const { isAuthenticated, isDemoMode, user } = useSelector((state) => state.auth)

    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const searchRef = useRef(null)
    const inputRef = useRef(null)
    const profileRef = useRef(null)

    // Keyboard shortcut Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
                setShowProfileMenu(false)
                inputRef.current?.blur()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsOpen(false)
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filter projects & tasks
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q || !currentWorkspace) {
            return { projects: [], tasks: [] }
        }

        const projects = (currentWorkspace.projects || []).filter(
            (p) =>
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        )

        const tasks = (currentWorkspace.projects || []).flatMap((p) =>
            (p.tasks || [])
                .filter(
                    (t) =>
                        t.title?.toLowerCase().includes(q) ||
                        t.description?.toLowerCase().includes(q)
                )
                .map((t) => ({ ...t, projectName: p.name }))
        )

        return { projects: projects.slice(0, 5), tasks: tasks.slice(0, 8) }
    }, [query, currentWorkspace])

    const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0
    const isSearching = query.trim().length > 0

    const handleSelectProject = (projectId) => {
        navigate(`/projectsDetail?id=${projectId}&tab=tasks`)
        setIsOpen(false)
        setQuery('')
    }

    const handleSelectTask = (projectId, taskId) => {
        navigate(`/taskDetails?projectId=${projectId}&taskId=${taskId}`)
        setIsOpen(false)
        setQuery('')
    }

    // User display details
    const displayName = user?.name || (isDemoMode ? 'Rishi Raj' : 'Rishi Raj')
    const displayEmail = user?.email || (isDemoMode ? 'rishi.raj@flowgrid.app' : 'rishi.raj@flowgrid.app')
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <header className="w-full pt-3 pb-2 px-3 sm:px-6 z-30 shrink-0">
            <div className="flex items-center justify-between gap-3 sm:gap-4 max-w-[1400px] mx-auto">
                {/* Left section: Mobile trigger & pill search input */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                        aria-label="Open navigation sidebar"
                    >
                        <PanelLeft size={18} strokeWidth={1.8} />
                    </button>

                    {/* Pill Search Field */}
                    <div className="relative flex-1" ref={searchRef}>
                        <div className="relative flex items-center">
                            <SearchIcon
                                className="absolute left-3.5 text-slate-400 size-4 pointer-events-none"
                                strokeWidth={2}
                            />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value)
                                    if (!isOpen) setIsOpen(true)
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Search projects & people"
                                className="pl-10 pr-16 py-2.5 w-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-full text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('')
                                        inputRef.current?.focus()
                                    }}
                                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : (
                                <kbd className="hidden sm:inline-flex items-center absolute right-3 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                                    Ctrl K
                                </kbd>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {isOpen && isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-900/10 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                {hasResults ? (
                                    <div className="p-3 space-y-3">
                                        {searchResults.projects.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
                                                    Projects ({searchResults.projects.length})
                                                </p>
                                                <div className="space-y-1 mt-1">
                                                    {searchResults.projects.map((proj) => (
                                                        <div
                                                            key={proj.id}
                                                            onClick={() => handleSelectProject(proj.id)}
                                                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition text-xs group"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                                                    <Folder className="size-4" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                                        {proj.name}
                                                                    </p>
                                                                    {proj.description && (
                                                                        <p className="text-[11px] text-slate-400 truncate">
                                                                            {proj.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="size-3.5 text-slate-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {searchResults.tasks.length > 0 && (
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
                                                    Tasks ({searchResults.tasks.length})
                                                </p>
                                                <div className="space-y-1 mt-1">
                                                    {searchResults.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleSelectTask(task.projectId, task.id)}
                                                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition text-xs group"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                    <CheckSquare className="size-4" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                                        {task.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-400 truncate">
                                                                        In {task.projectName} • {task.status?.replace('_', ' ')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-xs text-slate-400">
                                        No results match &ldquo;{query}&rdquo;
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section: Quick actions, notifications, user profile */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mail / Inbox button with red dot */}
                    <button
                        type="button"
                        onClick={() => navigate('/tasks')}
                        className="relative size-10 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-2xs"
                        aria-label="Messages"
                        title="Messages"
                    >
                        <Mail className="size-4.5" strokeWidth={1.8} />
                        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#111726]" />
                    </button>

                    {/* Notification Bell button with red dot */}
                    <button
                        type="button"
                        onClick={() => navigate('/calendar')}
                        className="relative size-10 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-2xs"
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <Bell className="size-4.5" strokeWidth={1.8} />
                        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#111726]" />
                    </button>

                    {/* Dark/Light Theme Toggle */}
                    <button
                        type="button"
                        onClick={() => dispatch(toggleTheme())}
                        className="size-10 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-2xs"
                        aria-label="Toggle theme"
                        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? (
                            <MoonIcon className="size-4.5 text-slate-700" strokeWidth={1.8} />
                        ) : (
                            <SunIcon className="size-4.5 text-amber-400" strokeWidth={1.8} />
                        )}
                    </button>

                    {/* User Profile Area */}
                    <div className="relative" ref={profileRef}>
                        <div
                            onClick={() => setShowProfileMenu((prev) => !prev)}
                            className="flex items-center gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-full hover:bg-white/80 dark:hover:bg-[#111726]/80 cursor-pointer transition-colors border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 select-none"
                        >
                            <div className="size-9 rounded-full bg-[#fde3cf] dark:bg-amber-950/60 text-[#b45309] dark:text-amber-300 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-slate-800 shadow-2xs">
                                {initials}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                                    {displayName}
                                </span>
                                <span className="text-[11px] text-slate-400 leading-tight">
                                    {displayEmail}
                                </span>
                            </div>
                        </div>

                        {/* Profile Dropdown Menu */}
                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
                                    {isDemoMode && (
                                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            Offline Demo Mode
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigate('/settings')
                                        setShowProfileMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <User className="size-4 text-slate-400" />
                                    <span>Account Settings</span>
                                </button>
                                {!isAuthenticated && isDemoMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAuthDialogOpen(true)
                                            setShowProfileMenu(false)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                                    >
                                        <span>Sign In / Create Account</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isDemoMode) {
                                            dispatch(exitDemoMode())
                                        } else {
                                            dispatch(logoutUser())
                                        }
                                        setShowProfileMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                                >
                                    <LogOut className="size-4" />
                                    <span>{isDemoMode ? 'Exit Demo' : 'Sign Out'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
        </header>
    )
}

export default Navbar
