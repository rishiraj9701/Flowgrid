import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    CheckCircle2,
    Sparkles,
    ArrowRight,
    LogIn,
    UserPlus,
    Calendar,
    BarChart3,
    Shield,
    Users,
    Layers,
    FolderKanban,
    ListTodo,
    TrendingUp,
    ChevronDown,
    Menu,
    X,
    Globe,
    CheckSquare,
    Star,
    AlertCircle,
    Check,
} from "lucide-react";
import { enableDemoMode } from "../features/authSlice";
import AuthDialog from "../components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

/* ─────────────────────────────────────────────
   Scroll-based reveal hook (bulletproof fallback)
─────────────────────────────────────────────── */
function useReveal(threshold = 0.05) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Respect reduced motion immediately
        const prefersReduced =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            setVisible(true);
            return;
        }

        // Immediate check: if element is already within viewport
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 60) {
            setVisible(true);
            return;
        }

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold, rootMargin: "0px 0px 80px 0px" }
        );
        obs.observe(el);

        // Fallback safeguard: guarantee content is never permanently hidden
        const timer = setTimeout(() => {
            setVisible(true);
        }, 900);

        return () => {
            obs.disconnect();
            clearTimeout(timer);
        };
    }, [threshold]);

    return [ref, visible];
}

/* ─────────────────────────────────────────────
   Section wrapper with gentle reveal animation
─────────────────────────────────────────────── */
function RevealSection({ children, className = "", delay = 0 }) {
    const [ref, visible] = useReveal();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0.001,
                transform: visible ? "translateY(0)" : "translateY(22px)",
                transition: `opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}


/* ─────────────────────────────────────────────
   Main Landing Component
─────────────────────────────────────────────── */
const Landing = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Landing page is strictly and permanently in dark mode
        document.documentElement.classList.add("dark");

        return () => {
            // Restore saved workspace theme when leaving the landing page
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "light") {
                document.documentElement.classList.remove("dark");
            } else {
                document.documentElement.classList.add("dark");
            }
        };
    }, []);


    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authTab, setAuthTab] = useState("login");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    /* scroll listener for nav shadow */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* close mobile menu on window resize */
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setMobileMenuOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const handleOpenAuth = (tab) => {
        setAuthTab(tab);
        setIsAuthOpen(true);
        setMobileMenuOpen(false);
    };

    const handleTryDemo = () => dispatch(enableDemoMode());

    /* smooth anchor scrolling */
    const scrollTo = (id) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    /* ── Features data ─── */
    const features = [
        {
            icon: FolderKanban,
            badge: "Structure",
            title: "Project Tracking",
            desc: "Organise initiatives inside dedicated workspaces with priorities, lifecycle statuses, target dates, and scope descriptions.",
            highlights: ["Priority & status filtering", "Workspace-isolated data", "Real-time timeline tracking"],
            color: "blue",
        },
        {
            icon: ListTodo,
            badge: "Execution",
            title: "Task Management",
            desc: "Break project scope into actionable tasks and bugs. Update statuses smoothly through Todo, In Progress, and Done.",
            highlights: ["One-click status transitions", "Assignee & due-date tracking", "Batch selection & bulk actions"],
            color: "indigo",
        },
        {
            icon: Users,
            badge: "Alignment",
            title: "Team & Permissions",
            desc: "Coordinate members across multi-tenant workspaces. Govern access with server-verified Owner, Admin, and Member roles.",
            highlights: ["Role-based access control", "Direct task assignment", "Task discussion comments"],
            color: "violet",
        },
        {
            icon: BarChart3,
            badge: "Insights",
            title: "Progress Analytics",
            desc: "Monitor workspace velocity at a glance with automated completion rates, status distributions, and deadline calendars.",
            highlights: ["Interactive Recharts metrics", "Issue-type breakdowns", "Month-view deadline calendar"],
            color: "sky",
        },
    ];

    const colorMap = {
        blue: {
            bg: "bg-blue-50 dark:bg-blue-950/40",
            text: "text-blue-600 dark:text-blue-400",
            badge: "bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
            border: "hover:border-blue-300 dark:hover:border-blue-700",
            glow: "group-hover:shadow-[0_12px_30px_-6px_rgba(59,130,246,0.15)]",
        },
        indigo: {
            bg: "bg-indigo-50 dark:bg-indigo-950/40",
            text: "text-indigo-600 dark:text-indigo-400",
            badge: "bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
            border: "hover:border-indigo-300 dark:hover:border-indigo-700",
            glow: "group-hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.15)]",
        },
        violet: {
            bg: "bg-violet-50 dark:bg-violet-950/40",
            text: "text-violet-600 dark:text-violet-400",
            badge: "bg-violet-100/70 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
            border: "hover:border-violet-300 dark:hover:border-violet-700",
            glow: "group-hover:shadow-[0_12px_30px_-6px_rgba(139,92,246,0.15)]",
        },
        sky: {
            bg: "bg-sky-50 dark:bg-sky-950/40",
            text: "text-sky-600 dark:text-sky-400",
            badge: "bg-sky-100/70 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
            border: "hover:border-sky-300 dark:hover:border-sky-700",
            glow: "group-hover:shadow-[0_12px_30px_-6px_rgba(14,165,233,0.15)]",
        },
    };

    /* ── Workflow steps ─── */
    const steps = [
        {
            num: "01",
            icon: Globe,
            title: "Set up your workspace",
            desc: "Create shared workspaces for teams or departments. Define projects with priority levels, target timelines, and clear scopes.",
        },
        {
            num: "02",
            icon: CheckSquare,
            title: "Assign & execute tasks",
            desc: "Break initiatives into tasks and bugs, designate assignees, schedule calendar deadlines, and update progress on intuitive boards.",
        },
        {
            num: "03",
            icon: TrendingUp,
            title: "Track delivery velocity",
            desc: "Inspect live completion charts, monitor deadline calendars, resolve bottlenecks early, and deliver milestones with team visibility.",
        },
    ];

    /* ── Capabilities list ─── */
    const capabilities = [
        "Multi-tenant workspaces",
        "Task boards with one-click transitions",
        "Visual project analytics & charts",
        "Month-view deadline calendar",
        "Role-based member permissions",
        "Instant offline demo sandbox",
    ];

    /* ── Platform pillars ─── */
    const showcaseItems = [
        {
            icon: FolderKanban,
            title: "Projects with full context",
            desc: "Every project links its status, owner, priority level, description, and task breakdown together in one clear view.",
        },
        {
            icon: ListTodo,
            title: "Actionable task tracking",
            desc: "Organise work by task, bug, or feature. Filter instantly by status or priority, and move items smoothly from Todo to Done.",
        },
        {
            icon: Calendar,
            title: "Deadline calendar view",
            desc: "Switch to calendar view to visualize milestone due dates. Overdue deliverables and upcoming deadlines are immediately highlighted.",
        },
        {
            icon: BarChart3,
            title: "Visual progress analytics",
            desc: "Built-in Recharts graphs display completion rates, status distributions, and category breakdowns without manual reporting.",
        },
        {
            icon: Shield,
            title: "Role-based access control",
            desc: "Owner, Admin, and Member roles are verified server-side on every request to ensure strict workspace data isolation.",
        },
        {
            icon: Sparkles,
            title: "Instant offline sandbox",
            desc: "Explore every feature in seconds without signing up. The browser sandbox comes preloaded with sample projects and tasks.",
        },
    ];

    /* ── FAQs ─── */
    const faqs = [
        {
            question: "What is Flowgrid?",
            answer:
                "Flowgrid is a modern project and task management workspace. It combines multi-tenant workspaces, structured project tracking, task boards with one-click status transitions, deadline calendars, and automated progress analytics into one focused web platform.",
        },
        {
            question: "Who is Flowgrid designed for?",
            answer:
                "Flowgrid is built for software engineers, product managers, and modern teams who need an uncluttered workspace to organize projects, assign tasks, track deadlines, and monitor velocity without unnecessary enterprise complexity.",
        },
        {
            question: "How does the offline demo sandbox work?",
            answer:
                "Click 'Try Demo' anywhere on this page to enter offline demo mode. It loads an isolated sample workspace with projects, tasks, and analytics right in your browser storage — allowing you to test all features without registering or connecting a backend.",
        },
        {
            question: "Can I manage projects and tasks collaboratively?",
            answer:
                "Yes. Workspace owners and admins can invite team members, assign tasks with specific priorities (Low, Medium, High), leave discussion comments, and track progress across Planning, Active, On Hold, and Completed states.",
        },
        {
            question: "How does role-based security work?",
            answer:
                "Flowgrid workspaces enforce three distinct roles: Owner, Admin, and Member. Permissions are verified server-side with JWT authentication, ensuring members only view and modify the projects and tasks permitted by their role.",
        },
        {
            question: "How do I get started with a permanent workspace?",
            answer:
                "Click 'Create Account' in the header to register with your email and password. Your workspace connects to the secure PostgreSQL database, enabling persistent multi-user collaboration and team management.",
        },
    ];

    return (
        <>
            <div className="dark landing-page relative min-h-screen bg-[#090b11] text-zinc-100 selection:bg-blue-600 selection:text-white overflow-x-clip transition-colors duration-300">

                {/* ── Continuous Page-Wide Ambient Lighting Layer ── */}
                <div className="landing-ambient-canvas" aria-hidden="true">
                    <div className="ambient-glow ambient-glow-hero-top" />
                    <div className="ambient-glow ambient-glow-hero-preview" />
                    <div className="ambient-glow ambient-glow-features" />
                    <div className="ambient-glow ambient-glow-problem" />
                    <div className="ambient-glow ambient-glow-benefits" />
                    <div className="ambient-glow ambient-glow-showcase" />
                    <div className="ambient-glow ambient-glow-cta" />
                    <div className="ambient-grid-guides" />
                    <div className="ambient-noise" />
                </div>

                {/* ════════════════════════════════════════════
                    A — REDESIGNED FLOATING GLASS ISLAND NAVBAR
                ════════════════════════════════════════════ */}
                <header
                    id="nav"
                    className="fixed top-0 inset-x-0 z-50 w-full pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300"
                >
                    <div
                        className={`max-w-6xl mx-auto rounded-2xl pointer-events-auto transition-all duration-300 flex items-center justify-between px-3.5 sm:px-5 ${
                            scrolled
                                ? "h-14 bg-white/85 dark:bg-[#0c0e17]/85 backdrop-blur-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-xl shadow-black/5 dark:shadow-black/50"
                                : "h-15 bg-white/70 dark:bg-[#0c0e17]/70 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs"
                        }`}
                    >
                        {/* Brand Logo */}
                        <button
                            type="button"
                            onClick={() => scrollTo("hero")}
                            className="flex items-center gap-2.5 focus:outline-none group cursor-pointer"
                            aria-label="Flowgrid home"
                        >
                            <div className="size-8.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-200">
                                <Layers className="size-4.5" />
                            </div>
                            <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Flowgrid
                            </span>
                        </button>

                        {/* Desktop Nav Links */}
                        <nav
                            className="hidden md:flex items-center gap-1"
                            aria-label="Main navigation"
                        >
                            {[
                                { label: "Features", id: "features" },
                                { label: "Why Flowgrid", id: "problem-solution" },
                                { label: "How It Works", id: "how-it-works" },
                                { label: "Benefits", id: "benefits" },
                                { label: "FAQ", id: "faq" },
                            ].map(({ label, id }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => scrollTo(id)}
                                    className="px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-full transition-colors duration-150 cursor-pointer"
                                >
                                    {label}
                                </button>
                            ))}
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3 lg:gap-4">
                            <button
                                type="button"
                                onClick={handleTryDemo}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <Sparkles className="size-3.5 text-amber-500 dark:text-amber-400" />
                                <span>Live Demo</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOpenAuth("login")}
                                className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white px-1 py-1 transition-colors cursor-pointer"
                            >
                                Sign In
                            </button>

                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleOpenAuth("register")}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </div>

                        {/* Mobile Actions: Get Started + Hamburger (NO THEME TOGGLE) */}
                        <div className="flex md:hidden items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleOpenAuth("register")}
                                className="text-xs font-semibold h-8 px-3"
                            >
                                Get Started
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="h-8 w-8 rounded-xl"
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                onClick={() => setMobileMenuOpen((o) => !o)}
                            >
                                {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Floating Dropdown Menu */}
                    <div
                        className={`md:hidden overflow-hidden transition-all duration-300 max-w-6xl mx-auto mt-2 rounded-2xl bg-white/95 dark:bg-[#0c0e17]/95 backdrop-blur-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl pointer-events-auto ${
                            mobileMenuOpen ? "max-h-[460px] opacity-100 p-4" : "max-h-0 opacity-0 p-0 pointer-events-none"
                        }`}
                    >
                        <div className="flex flex-col gap-1">
                            {[
                                { label: "Features", id: "features" },
                                { label: "Why Flowgrid", id: "problem-solution" },
                                { label: "How It Works", id: "how-it-works" },
                                { label: "Benefits", id: "benefits" },
                                { label: "FAQ", id: "faq" },
                            ].map(({ label, id }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => {
                                        scrollTo(id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 rounded-xl transition-colors cursor-pointer"
                                >
                                    {label}
                                </button>
                            ))}
                            <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleTryDemo();
                                    }}
                                    className="w-full text-xs font-semibold gap-1.5 justify-center"
                                >
                                    <Sparkles className="size-3.5 text-amber-500" />
                                    <span>Try Live Demo Sandbox</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenAuth("login")}
                                    className="w-full text-xs font-semibold justify-center"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleOpenAuth("register")}
                                    className="w-full text-xs font-semibold justify-center gap-1.5"
                                >
                                    <UserPlus className="size-3.5" />
                                    <span>Create Account</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>


                {/* ════════════════════════════════════════════
                    B — HERO & LAYERED PRODUCT PREVIEW
                    (Composed as one seamless, high-impact section)
                ════════════════════════════════════════════ */}
                <section
                    id="hero"
                    className="relative z-10 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-32 bg-transparent"
                >

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

                        {/* Enterprise Trust Line */}
                        <div className="hero-animate-1 flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-1 text-xs sm:text-sm font-medium text-zinc-400 mb-4 sm:mb-5 text-center">
                            <span className="inline-flex items-center gap-1.5">
                                <Check className="size-3.5 sm:size-4 text-blue-400 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                                <span>Free forever</span>
                            </span>
                            <span className="text-zinc-600 select-none" aria-hidden="true">·</span>
                            <span>Open source</span>
                            <span className="text-zinc-600 select-none" aria-hidden="true">·</span>
                            <span>No subscriptions</span>
                        </div>

                        {/* Responsive Headline with Flowgrid Blue Gradient */}
                        <h1
                            className="hero-animate-2 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl leading-[1.12] sm:leading-[1.15] mb-6 sm:mb-8"
                            style={{ textWrap: "balance" }}
                        >
                            Manage projects.{" "}
                            <span className="text-zinc-900 dark:text-white">Align teams.</span>{" "}
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                                Deliver better work.
                            </span>
                        </h1>

                        {/* Supporting Copy */}
                        <p className="hero-animate-3 text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8 sm:mb-10">
                            Organise projects, coordinate tasks, collaborate with your team, and
                            track progress with real-time clarity — all in one focused workspace.
                        </p>

                        {/* Action Buttons */}
                        <div className="hero-animate-4 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full max-w-sm sm:max-w-none sm:w-auto mb-6 sm:mb-8">
                            <Button
                                type="button"
                                size="lg"
                                id="hero-signin-btn"
                                onClick={() => handleOpenAuth("login")}
                                className="w-full sm:w-auto px-7"
                            >
                                <LogIn className="size-4" />
                                Sign In
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button
                                type="button"
                                variant="brand"
                                size="lg"
                                id="hero-create-btn"
                                onClick={() => handleOpenAuth("register")}
                                className="w-full sm:w-auto px-7"
                            >
                                <UserPlus className="size-4 text-blue-400" />
                                Create Account
                            </Button>
                        </div>

                        {/* Demo Action Pill */}
                        <div className="hero-animate-5 flex flex-col items-center mb-14 sm:mb-20 lg:mb-24">
                            <button
                                type="button"
                                id="hero-demo-btn"
                                onClick={handleTryDemo}
                                className="group inline-flex items-center gap-3 px-5 py-2 sm:py-2.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-blue-50/40 dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all shadow-sm text-xs sm:text-sm font-medium"
                            >
                                <span className="size-5 flex items-center justify-center rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                                    <Sparkles className="size-3" />
                                </span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Try Demo</span>
                                <span className="text-zinc-400 dark:text-zinc-500 font-normal hidden sm:inline">
                                    — Explore sample workspace offline without signing up
                                </span>
                                <ArrowRight className="size-3.5 text-zinc-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                            </button>
                            <p className="mt-2.5 text-xs text-zinc-400 dark:text-zinc-500">
                                Isolated local sandbox · Preloaded with sample projects &amp; metrics
                            </p>
                        </div>

                        {/* ── Product Dashboard Preview with Ambient Glow & Layered Frame ── */}
                        <div className="hero-animate-mockup w-full max-w-5xl mx-auto relative">
                            {/* Ambient blue/indigo halo behind mockup */}
                            <div
                                className="absolute -inset-3 sm:-inset-5 bg-gradient-to-r from-blue-500/20 via-indigo-500/25 to-sky-400/20 rounded-[28px] sm:rounded-[36px] blur-2xl opacity-75 animate-pulse-slow pointer-events-none -z-10"
                                aria-hidden="true"
                            />

                            {/* Outer framed container — Dark Charcoal / Near-Black Chrome Frame */}
                            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-gradient-to-b from-[#181c28] via-[#101420] to-[#0a0d16] border border-zinc-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65),0_0_35px_rgba(59,130,246,0.18)] transition-all duration-300">
                                {/* Subtle top highlight border */}
                                <div
                                    className="absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent pointer-events-none"
                                    aria-hidden="true"
                                />

                                {/* Inner dashboard preview window */}
                                <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800/90 bg-[#0c0e17]">
                                    {/* Browser chrome header */}
                                    <div className="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-zinc-800/90 bg-[#0f1320]/95">
                                        <div className="flex items-center gap-1.5">
                                            <span className="size-3 rounded-full bg-red-500/90" />
                                            <span className="size-3 rounded-full bg-amber-500/90" />
                                            <span className="size-3 rounded-full bg-green-500/90" />
                                        </div>

                                        <div className="flex items-center gap-2 px-6 sm:px-10 py-1 rounded-lg bg-[#0a0d16] border border-zinc-800/90 text-xs text-zinc-300 font-mono shadow-xs">
                                            <Shield className="size-3 text-emerald-400" />
                                            <span>app.flowgrid.io/workspace</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                                            <span className="size-1.5 rounded-full bg-emerald-400" />
                                            <span>Live Workspace</span>
                                        </div>
                                    </div>

                                    {/* Dashboard image preview (clean, uncropped, full sharpness, no scrollbar) */}
                                    <div className="relative w-full overflow-hidden bg-slate-50">
                                        <img
                                            src="/dashboard-preview.png"
                                            alt="Flowgrid Project Dashboard — showing active project cards, task statuses, and team metrics"
                                            className="w-full h-auto object-cover object-top block select-none pointer-events-none"
                                            loading="eager"
                                            width="1878"
                                            height="963"
                                        />

                                        {/* Floating micro-badge: Sprint Velocity */}
                                        <div className="hidden sm:flex items-center gap-3 absolute bottom-5 left-5 px-4 py-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 shadow-lg shadow-zinc-900/10 text-xs animate-float-slow text-left">
                                            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                <TrendingUp className="size-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900 dark:text-zinc-100">Project Velocity</div>
                                                <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">74% tasks completed on schedule</div>
                                            </div>
                                        </div>

                                        {/* Floating micro-badge: Team Collaboration */}
                                        <div className="hidden sm:flex items-center gap-3 absolute bottom-5 right-5 px-4 py-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800 shadow-lg shadow-zinc-900/10 text-xs text-left">
                                            <div className="flex -space-x-1.5">
                                                <div className="size-6 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">AL</div>
                                                <div className="size-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">SK</div>
                                                <div className="size-6 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900">+3</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px]">Active Team</div>
                                                <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">Real-time role access</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    C — CAPABILITY STRIP
                ════════════════════════════════════════════ */}
                <section
                    id="capabilities"
                    className="relative z-10 py-10 sm:py-14 bg-transparent"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                            {capabilities.map((cap) => (
                                <div
                                    key={cap}
                                    className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium"
                                >
                                    <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                    {cap}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    D — FEATURES SECTION
                ════════════════════════════════════════════ */}
                <section
                    id="features"
                    className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealSection className="text-center mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                <FolderKanban className="size-3.5" />
                                <span>Core Platform</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl mx-auto leading-tight mb-4">
                                Everything your team needs to{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                                    move work forward
                                </span>
                            </h2>
                            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                                Flowgrid brings projects, tasks, and teams together with clear ownership and instant progress visibility.
                            </p>
                        </RevealSection>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((f, i) => {
                                const c = colorMap[f.color];
                                return (
                                    <RevealSection key={f.title} delay={i * 70}>
                                        <div
                                            className={`h-full p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 ${c.border} shadow-sm hover:-translate-y-1 ${c.glow} transition-all duration-300 group flex flex-col justify-between`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-5">
                                                    <div
                                                        className={`size-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
                                                    >
                                                        <f.icon className="size-5" />
                                                    </div>
                                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}>
                                                        {f.badge}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                                    {f.title}
                                                </h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                                                    {f.desc}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                                                {f.highlights.map((h) => (
                                                    <div key={h} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <Check className="size-3.5 text-blue-500 shrink-0" />
                                                        <span>{h}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </RevealSection>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    E — PROBLEM & SOLUTION
                    (Preserves Flowgrid white/off-white palette; compares
                     traditional chaos vs Flowgrid structured clarity)
                ════════════════════════════════════════════ */}
                <section
                    id="problem-solution"
                    className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealSection className="text-center mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                <Sparkles className="size-3.5 text-amber-500" />
                                <span>Why Flowgrid</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl mx-auto leading-tight mb-4">
                                Less time chasing updates.{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                                    More time getting work done.
                                </span>
                            </h2>
                            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                                See how teams transform everyday project friction into clear, dependable momentum.
                            </p>
                        </RevealSection>

                        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                            {/* Column 1: The Challenge (Traditional Disconnect) */}
                            <RevealSection delay={40}>
                                <div className="h-full p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-rose-200/50 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-4">
                                            <AlertCircle className="size-4 text-rose-500" />
                                            <span>Without a centralized system</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                                            Work scattered across disconnected tools
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                            When tasks are trapped in chat threads, private docs, and overflowing spreadsheets, coordination breaks down and accountability blurs.
                                        </p>

                                        <div className="space-y-3.5">
                                            {[
                                                {
                                                    title: "Status ambiguity",
                                                    desc: "Teams waste hours asking 'is this done yet?' without a single source of truth.",
                                                },
                                                {
                                                    title: "Dropped task handoffs",
                                                    desc: "Crucial subtasks slip through the cracks when ownership isn't explicitly defined.",
                                                },
                                                {
                                                    title: "Blindspot deadlines",
                                                    desc: "Overdue tasks go unnoticed until delivery dates are already compromised.",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3"
                                                >
                                                    <span className="size-5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                                        ×
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500">
                                        Result: Friction, duplicated effort, and delayed delivery cycles.
                                    </div>
                                </div>
                            </RevealSection>

                            {/* Column 2: The Flowgrid Way (Unified Workspace) */}
                            <RevealSection delay={100}>
                                <div className="h-full p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm border border-blue-200/80 dark:border-blue-900/60 shadow-md shadow-blue-500/5 flex flex-col justify-between relative overflow-hidden">
                                    {/* Ambient card glow */}
                                    <div
                                        className="absolute -top-12 -right-12 size-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"
                                        aria-hidden="true"
                                    />

                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                                            <CheckCircle2 className="size-4 text-blue-500" />
                                            <span>The Flowgrid Unified Workspace</span>
                                        </div>

                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                                            Structured clarity from inception to delivery
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                                            Flowgrid centralizes workspaces, boards, role access, and analytics into a shared cockpit where work moves with momentum.
                                        </p>

                                        <div className="space-y-3.5">
                                            {[
                                                {
                                                    title: "Transparent project ownership",
                                                    desc: "Every initiative links its priority, scope, and linked tasks with complete context.",
                                                },
                                                {
                                                    title: "Frictionless task transitions",
                                                    desc: "Work moves smoothly from Todo to In Progress to Completed with one tap.",
                                                },
                                                {
                                                    title: "Proactive velocity & deadline tracking",
                                                    desc: "Built-in analytics and calendar views ensure deadlines are met with confidence.",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="p-4 rounded-xl bg-white/90 dark:bg-zinc-800/70 border border-blue-200/70 dark:border-blue-900/50 shadow-xs flex items-start gap-3"
                                                >
                                                    <span className="size-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                                                        ✓
                                                    </span>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-950/60 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Experience the difference</span>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenAuth("register")}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group"
                                        >
                                            Get started free
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>
                            </RevealSection>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    F — THREE-STEP WORKFLOW
                ════════════════════════════════════════════ */}
                <section id="how-it-works" className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealSection className="text-center mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                <TrendingUp className="size-3.5" />
                                <span>Workflow</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-2xl mx-auto leading-tight mb-4">
                                Three steps to an organised team
                            </h2>
                            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
                                Get your entire team aligned and productive with Flowgrid in minutes.
                            </p>
                        </RevealSection>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                            {/* Horizontal connecting line on desktop */}
                            <div
                                className="hidden md:block absolute top-[48px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 dark:from-blue-900/60 dark:via-indigo-900/60 dark:to-blue-900/60 pointer-events-none -z-0"
                                aria-hidden="true"
                            />

                            {steps.map((step, i) => (
                                <RevealSection key={step.num} delay={i * 90}>
                                    <div className="relative p-7 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group text-center h-full flex flex-col items-center">
                                        {/* Numbered icon badge */}
                                        <div className="relative mx-auto size-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                                            <step.icon className="size-6 text-blue-600 dark:text-blue-400" />
                                            <span className="absolute -top-2 -right-2 size-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                                                {i + 1}
                                            </span>
                                        </div>
                                        <div className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-2">
                                            Step {step.num}
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            {step.desc}
                                        </p>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    G — PRODUCT BENEFITS & INTERACTIVE MINI MOCKUP
                ════════════════════════════════════════════ */}
                <section
                    id="benefits"
                    className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                            {/* Left Column — Benefits list */}
                            <RevealSection>
                                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Everyday Value</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight mb-5">
                                    Built for everyday{" "}
                                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                                        productivity
                                    </span>
                                </h2>
                                <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                                    Every screen in Flowgrid is engineered around one standard: removing friction so your team can focus on shipping high-caliber work.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: FolderKanban,
                                            title: "Clear project visibility",
                                            desc: "See every project's status, priority, and progress at a glance without navigating complex menus.",
                                        },
                                        {
                                            icon: ListTodo,
                                            title: "Structured task workflows",
                                            desc: "Tasks move through defined statuses so nothing falls through the cracks and handoffs are transparent.",
                                        },
                                        {
                                            icon: Users,
                                            title: "One place for team work",
                                            desc: "Projects, tasks, comments, and members all live in one workspace, ending the tab-switching shuffle.",
                                        },
                                        {
                                            icon: BarChart3,
                                            title: "Built-in velocity reporting",
                                            desc: "Instant completion metrics, deadline tracking, and status charts update automatically.",
                                        },
                                    ].map((b) => (
                                        <div
                                            key={b.title}
                                            className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/60 dark:hover:bg-zinc-900/40 hover:shadow-xs transition-all"
                                        >
                                            <div className="shrink-0 size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5 border border-blue-100 dark:border-blue-900/50">
                                                <b.icon className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                                    {b.title}
                                                </h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {b.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </RevealSection>

                            {/* Right Column — Interactive mini sprint preview card */}
                            <RevealSection delay={90}>
                                <div className="relative">
                                    {/* Ambient subtle glow behind card */}
                                    <div
                                        className="absolute -inset-3 bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-sky-400/15 rounded-3xl blur-xl opacity-75 pointer-events-none -z-10"
                                        aria-hidden="true"
                                    />

                                    <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl shadow-blue-500/5 dark:shadow-none bg-white/90 dark:bg-zinc-900/70 backdrop-blur-sm">
                                        {/* Accent top gradient bar */}
                                        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

                                        {/* Mock dashboard UI inside card */}
                                        <div className="p-6 sm:p-7">
                                            {/* Header row */}
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                                                        Active Project
                                                    </div>
                                                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                                        Product Launch · Q4 Release
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="size-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">A</div>
                                                    <div className="size-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60">J</div>
                                                    <div className="size-7 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/60">+3</div>
                                                </div>
                                            </div>

                                            {/* Stat summary pills */}
                                            <div className="grid grid-cols-3 gap-3 mb-6">
                                                {[
                                                    { label: "Total Tasks", val: "42" },
                                                    { label: "Completed", val: "31" },
                                                    { label: "In Progress", val: "8" },
                                                ].map((s) => (
                                                    <div key={s.label} className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/80 text-center">
                                                        <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-0.5">{s.val}</div>
                                                        <div className="text-xs text-zinc-400 dark:text-zinc-400 font-medium">{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Progress meter */}
                                            <div className="mb-6">
                                                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Project Completion Rate</span>
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">74%</span>
                                                </div>
                                                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
                                                        style={{ width: "74%" }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Live task items */}
                                            <div className="space-y-2.5">
                                                {[
                                                    { title: "Design system token update", status: "Done", tag: "green" },
                                                    { title: "REST API & auth integration", status: "In Progress", tag: "blue" },
                                                    { title: "User onboarding validation", status: "Todo", tag: "zinc" },
                                                ].map((t) => (
                                                    <div
                                                        key={t.title}
                                                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`size-2 rounded-full ${t.tag === "green" ? "bg-emerald-500" : t.tag === "blue" ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                                                            <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200">{t.title}</span>
                                                        </div>
                                                        <span
                                                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                                                                t.tag === "green"
                                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                                                                    : t.tag === "blue"
                                                                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700"
                                                            }`}
                                                        >
                                                            {t.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </RevealSection>

                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    H — PLATFORM CAPABILITIES SHOWCASE
                ════════════════════════════════════════════ */}
                <section
                    id="showcase"
                    className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealSection className="text-center mb-12 sm:mb-16">
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                <Layers className="size-3.5" />
                                <span>Platform Capabilities</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
                                A workspace built around how modern teams work
                            </h2>
                            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
                                Flowgrid combines essential project tools into one coherent, responsive interface.
                            </p>
                        </RevealSection>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {showcaseItems.map((item, i) => (
                                <RevealSection key={item.title} delay={i * 50}>
                                    <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:bg-blue-50/15 dark:hover:bg-blue-950/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group h-full flex flex-col justify-between">
                                        <div>
                                            <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors shadow-xs">
                                                <item.icon className="size-5" />
                                            </div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </RevealSection>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ════════════════════════════════════════════
                    J — FAQ ACCORDION
                ════════════════════════════════════════════ */}
                <section
                    id="faq"
                    className="relative z-10 py-14 sm:py-16 lg:py-20 bg-transparent"
                >
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <RevealSection className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                                <AlertCircle className="size-3.5" />
                                <span>FAQ</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
                                Frequently asked questions
                            </h2>
                            <p className="text-base text-zinc-500 dark:text-zinc-400">
                                Answers to common questions about Flowgrid workspaces, tasks, and demo mode.
                            </p>
                        </RevealSection>

                        <Accordion type="single" collapsible className="space-y-3">
                            {faqs.map((faq, i) => (
                                <RevealSection key={faq.question} delay={i * 35}>
                                    <AccordionItem value={`faq-${i}`}>
                                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                                        <AccordionContent>{faq.answer}</AccordionContent>
                                    </AccordionItem>
                                </RevealSection>
                            ))}
                        </Accordion>
                    </div>
                </section>


                {/* ════════════════════════════════════════════
                    K — FOOTER
                ════════════════════════════════════════════ */}
                <footer className="relative z-10 border-t border-zinc-200/80 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-[#07090e] text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                            {/* Brand Column */}
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-2.5 mb-3.5">
                                    <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                        <Layers className="size-5" />
                                    </div>
                                    <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                                        Flowgrid
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
                                    A project management and team collaboration workspace. Organise projects, coordinate tasks, and track velocity in one place.
                                </p>
                            </div>

                            {/* Navigation Links */}
                            <div>
                                <div className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-3.5">
                                    Navigation
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Features", id: "features" },
                                        { label: "Why Flowgrid", id: "problem-solution" },
                                        { label: "How It Works", id: "how-it-works" },
                                        { label: "Benefits", id: "benefits" },
                                        { label: "FAQ", id: "faq" },
                                    ].map(({ label, id }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => scrollTo(id)}
                                            className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account & Demo */}
                            <div>
                                <div className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 mb-3.5">
                                    Access
                                </div>
                                <div className="space-y-2.5">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenAuth("login")}
                                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenAuth("register")}
                                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTryDemo}
                                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-white transition-colors text-left"
                                    >
                                        Try Sandbox Demo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <p>© {new Date().getFullYear()} Flowgrid. All rights reserved.</p>
                            <div className="flex items-center gap-3">
                                <span>React 19 &amp; Vite</span>
                                <span>·</span>
                                <span>Node.js &amp; Express</span>
                                <span>·</span>
                                <span>PostgreSQL &amp; Prisma</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Auth Dialog (Preserved 100%) */}
            <AuthDialog
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialTab={authTab}
            />
        </>
    );
};

export default Landing;
