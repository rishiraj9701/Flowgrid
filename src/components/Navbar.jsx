import { useState, useRef, useEffect, useMemo } from "react";
import { SearchIcon, PanelLeft, MoonIcon, SunIcon, Folder, CheckSquare, X, ArrowRight, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "../features/themeSlice";
import { logoutUser, exitDemoMode } from "../features/authSlice";
import AuthDialog from "./AuthDialog";

const Navbar = ({ setIsSidebarOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector((state) => state.theme);
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { isAuthenticated, isDemoMode, user } = useSelector((state) => state.auth);

    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Global keyboard shortcut: Ctrl+K / Cmd+K to focus search input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter projects and tasks across the active workspace
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || !currentWorkspace) {
            return { projects: [], tasks: [] };
        }

        const projects = (currentWorkspace.projects || []).filter(
            (p) =>
                p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
        );

        const tasks = (currentWorkspace.projects || []).flatMap((p) =>
            (p.tasks || [])
                .filter(
                    (t) =>
                        t.title?.toLowerCase().includes(q) ||
                        t.description?.toLowerCase().includes(q)
                )
                .map((t) => ({ ...t, projectName: p.name }))
        );

        return { projects: projects.slice(0, 5), tasks: tasks.slice(0, 8) };
    }, [query, currentWorkspace]);

    const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0;
    const isSearching = query.trim().length > 0;

    const handleSelectProject = (projectId) => {
        navigate(`/projectsDetail?id=${projectId}&tab=tasks`);
        setIsOpen(false);
        setQuery("");
    };

    const handleSelectTask = (projectId, taskId) => {
        navigate(`/taskDetails?projectId=${projectId}&taskId=${taskId}`);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-6 xl:px-12 py-2.5 flex-shrink-0 z-30">
            <div className="flex items-center justify-between max-w-6xl mx-auto gap-4">
                {/* Left section: Sidebar Trigger & Search Bar */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Mobile Sidebar Trigger */}
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="sm:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        aria-label="Open sidebar"
                    >
                        <PanelLeft size={18} />
                    </button>

                    {/* Global Search Input & Dropdown */}
                    <div className="relative flex-1 max-w-md" ref={searchRef}>
                        <div className="relative flex items-center">
                            <SearchIcon className="absolute left-3 text-zinc-400 size-3.5 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (!isOpen) setIsOpen(true);
                                }}
                                onFocus={() => setIsOpen(true)}
                                placeholder="Search projects, tasks..."
                                className="pl-9 pr-16 py-1.5 w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition"
                            />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute right-2.5 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400"
                                    aria-label="Clear search"
                                >
                                    <X className="size-3" />
                                </button>
                            ) : (
                                <kbd className="hidden sm:inline-block absolute right-2.5 text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400 font-mono">
                                    Ctrl+K
                                </kbd>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        {isOpen && isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {hasResults ? (
                                    <div className="p-2 space-y-3">
                                        {/* Projects Section */}
                                        {searchResults.projects.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1">
                                                    Projects ({searchResults.projects.length})
                                                </p>
                                                <div className="space-y-0.5 mt-1">
                                                    {searchResults.projects.map((proj) => (
                                                        <div
                                                            key={proj.id}
                                                            onClick={() => handleSelectProject(proj.id)}
                                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition text-xs group"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-1 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                                                    <Folder className="size-3.5" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                                        {proj.name}
                                                                    </p>
                                                                    {proj.description && (
                                                                        <p className="text-[11px] text-zinc-400 truncate">
                                                                            {proj.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="size-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition shrink-0 ml-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Tasks Section */}
                                        {searchResults.tasks.length > 0 && (
                                            <div className={searchResults.projects.length > 0 ? "pt-2 border-t border-zinc-100 dark:border-zinc-800/60" : ""}>
                                                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1">
                                                    Tasks ({searchResults.tasks.length})
                                                </p>
                                                <div className="space-y-0.5 mt-1">
                                                    {searchResults.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => handleSelectTask(task.projectId, task.id)}
                                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition text-xs group"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                                    <CheckSquare className="size-3.5" />
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                                        {task.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-zinc-400 truncate">
                                                                        In {task.projectName} • {task.status?.replace("_", " ")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0 ml-2">
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                        <p>No projects or tasks match &ldquo;{query}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right section: Theme Toggle, Auth & User Info */}
                <div className="flex items-center gap-2.5">
                    {/* Demo / Auth Status Indicator */}
                    {isDemoMode ? (
                        <div className="flex items-center gap-2">
                            <span
                                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/25 backdrop-blur-xs select-none shadow-2xs hover:bg-amber-500/15 dark:hover:bg-amber-400/15 transition-colors cursor-default"
                                title="Running in Demo Mode"
                            >
                                <span className="relative flex size-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
                                </span>
                                Demo Mode
                            </span>
                            <button
                                type="button"
                                onClick={() => dispatch(exitDemoMode())}
                                className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                title="Exit Demo Mode and return to Landing page"
                            >
                                Exit Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAuthDialogOpen(true)}
                                className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
                            >
                                Sign In
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden md:inline truncate max-w-[120px]">
                                {user?.name || "User"}
                            </span>
                            <button
                                type="button"
                                onClick={() => dispatch(logoutUser())}
                                className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => dispatch(toggleTheme())}
                        className="size-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition"
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? (
                            <MoonIcon className="size-4 text-zinc-700 dark:text-zinc-200" />
                        ) : (
                            <SunIcon className="size-4 text-amber-400" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (!isAuthenticated) setIsAuthDialogOpen(true);
                        }}
                        className="size-8 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 transition cursor-pointer shadow-xs"
                        aria-label="User profile"
                        title={isAuthenticated ? user?.name || "Profile" : "Sign In"}
                    >
                        <User className="size-4" />
                    </button>
                </div>
            </div>

            {/* Auth Dialog Modal */}
            <AuthDialog
                isOpen={isAuthDialogOpen}
                onClose={() => setIsAuthDialogOpen(false)}
            />
        </div>
    );
};

export default Navbar;
