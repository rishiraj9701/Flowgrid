import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    LogIn,
    UserPlus,
    LayoutDashboard,
    Calendar,
    BarChart3,
    Shield,
    Users,
    Zap,
    Moon,
    Sun,
    Layers,
    Kanban,
} from "lucide-react";
import { enableDemoMode } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";
import AuthDialog from "../components/AuthDialog";

const Landing = () => {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState("login");

    const handleOpenAuth = (tab) => {
        setAuthTab(tab);
        setIsAuthOpen(true);
    };

    const handleTryDemo = () => {
        dispatch(enableDemoMode());
    };

    return (
        <>
            <div className="landing-page min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white transition-colors duration-200 flex flex-col justify-between">
                {/* Top Navigation */}
                <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Brand Logo & Name */}
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
                                <Layers className="size-5" />
                            </div>
                            <div>
                                <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Flowgrid
                                </span>
                            </div>
                        </div>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => dispatch(toggleTheme())}
                            className="size-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? (
                                <Moon className="size-4" />
                            ) : (
                                <Sun className="size-4 text-amber-400" />
                            )}
                        </button>

                        {/* Sign In Button */}
                        <button
                            type="button"
                            onClick={() => handleOpenAuth("login")}
                            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl transition"
                        >
                            Sign In
                        </button>

                        {/* Create Account Button */}
                        <button
                            type="button"
                            onClick={() => handleOpenAuth("register")}
                            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition flex items-center gap-1.5"
                        >
                            <UserPlus className="size-3.5" />
                            <span>Create Account</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Hero Section */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col items-center">
                {/* Product Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 mb-6 shadow-2xs">
                    <Sparkles className="size-3.5 text-blue-500" />
                    <span>Next-Gen Full-Stack SaaS Workspace</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-center text-zinc-900 dark:text-white max-w-4xl leading-[1.15]">
                    Manage projects. Align teams. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                        Deliver better work.
                    </span>
                </h1>

                {/* Supporting Text */}
                <p className="mt-5 text-base sm:text-lg text-center text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Organize projects, coordinate tasks, collaborate with your team, and track progress in one place.
                </p>

                {/* Primary Action Buttons Container */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center">
                    <button
                        type="button"
                        onClick={() => handleOpenAuth("login")}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        <LogIn className="size-4" />
                        <span>Sign In</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOpenAuth("register")}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="size-4 text-blue-400" />
                        <span>Create Account</span>
                    </button>
                </div>

                {/* Try Demo Action — Displayed Underneath */}
                <div className="mt-6 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={handleTryDemo}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition shadow-sm text-xs sm:text-sm font-medium cursor-pointer"
                    >
                        <span className="flex items-center justify-center size-5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Sparkles className="size-3" />
                        </span>
                        <span>Try Demo</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                            — Explore sample workspace offline without signing up
                        </span>
                        <ArrowRight className="size-3.5 text-zinc-400 group-hover:translate-x-0.5 transition" />
                    </button>
                    <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500">
                        Isolated local sandbox • Preloaded with Nexus sample projects & metrics
                    </p>
                </div>

                {/* Feature Highlights Grid */}
                <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                    {/* Card 1 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs hover:border-blue-500/40 dark:hover:border-blue-500/40 transition group">
                        <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Kanban className="size-5" />
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5">
                            Interactive Task Boards
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Categorize tasks by type and priority with instant transitions from Todo to Done.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition group">
                        <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <BarChart3 className="size-5" />
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5">
                            Visual Analytics
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Monitor team velocity and project completion rates with live Recharts graphics.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition group">
                        <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Calendar className="size-5" />
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5">
                            Deadline Calendar
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Keep timelines synchronized with milestone calendar views and overdue indicators.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/40 transition group">
                        <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Shield className="size-5" />
                        </div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1.5">
                            Multi-Tenant Isolation
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Role-based access control protecting each workspace with strict server authorization.
                        </p>
                    </div>
                </div>
            </main>

                {/* Footer */}
                <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p>© {new Date().getFullYear()} Flowgrid. All rights reserved.</p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>React 19 & Vite</span>
                            <span>•</span>
                            <span>Node.js & Express</span>
                            <span>•</span>
                            <span>PostgreSQL & Prisma</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Auth Dialog Modal - rendered outside landing-page to preserve application typography */}
            <AuthDialog
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialTab={authTab}
            />
        </>
    );
};

export default Landing;
