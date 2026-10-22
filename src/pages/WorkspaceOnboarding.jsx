import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Plus,
    Users,
    FolderKanban,
    Shield,
    RefreshCw,
    LogOut,
    Moon,
    Sun,
    Layers,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { createWorkspaceAsync, selectWorkspaceAsync, fetchWorkspacesAsync } from "../features/workspaceSlice";
import { logoutUser } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";
import toast from "react-hot-toast";

const WorkspaceOnboarding = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const { workspaces } = useSelector((state) => state.workspace);
    const { theme } = useSelector((state) => state.theme);

    const [wsName, setWsName] = useState("");
    const [wsDesc, setWsDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        const trimmed = wsName.trim();
        if (!trimmed) {
            toast.error("Workspace name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(
                createWorkspaceAsync({
                    name: trimmed,
                    description: wsDesc.trim() || null,
                })
            ).unwrap();
            toast.success("Workspace created successfully!");
            navigate("/");
        } catch (error) {
            console.error("Workspace creation failed:", error);
            toast.error(typeof error === "string" ? error : "Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectWorkspace = async (workspaceId) => {
        try {
            await dispatch(selectWorkspaceAsync(workspaceId)).unwrap();
            navigate("/");
        } catch (error) {
            console.error("Failed to select workspace:", error);
            toast.error("Failed to load workspace");
        }
    };

    const handleRefreshInvitations = async () => {
        setIsRefreshing(true);
        try {
            const result = await dispatch(fetchWorkspacesAsync()).unwrap();
            const count = result?.length || 0;
            if (count > 0) {
                toast.success(`Found ${count} accessible workspace${count > 1 ? "s" : ""}`);
            } else {
                toast("No new workspace invitations found yet for " + (user?.email || "your email"), {
                    icon: "ℹ️",
                });
            }
        } catch {
            toast.error("Failed to refresh workspaces");
        } finally {
            setIsRefreshing(false);
        }
    };

    const hasWorkspaces = workspaces && workspaces.length > 0;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-600 selection:text-white flex flex-col justify-between transition-colors">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
                            <Layers className="size-5" />
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                            Flowgrid
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <span>Signed in as</span>
                            <span className="font-semibold text-zinc-900 dark:text-white truncate max-w-[160px]">
                                {user?.name || user?.email}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => dispatch(toggleTheme())}
                            className="size-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition"
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? (
                                <Moon className="size-4" />
                            ) : (
                                <Sun className="size-4 text-amber-400" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => dispatch(logoutUser())}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            <LogOut className="size-3.5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Title */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-3">
                        <Building2 className="size-3" />
                        <span>Workspace Hub</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                        {hasWorkspaces ? "Select or Create a Workspace" : "Set Up Your Workspace"}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        {hasWorkspaces
                            ? "Jump directly into an active team workspace or create a separate one for your new project."
                            : "Create your team's primary workspace to begin organizing projects, tasks, and members."}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Section 1: Existing Workspaces (if user belongs to any) */}
                    {hasWorkspaces && (
                        <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Building2 className="size-4 text-blue-500" />
                                        Your Workspaces ({workspaces.length})
                                    </h2>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Workspaces where you have active membership.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {workspaces.map((ws) => (
                                    <div
                                        key={ws.id}
                                        onClick={() => handleSelectWorkspace(ws.id)}
                                        className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition shadow-2xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                                    {ws.name}
                                                </h3>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                                                    {ws.currentUserRole || "MEMBER"}
                                                </span>
                                            </div>
                                            {ws.description && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                                                    {ws.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <FolderKanban className="size-3.5" />
                                                    {ws._count?.projects || ws.projects?.length || 0} projects
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="size-3.5" />
                                                    {ws._count?.members || ws.members?.length || 1} members
                                                </span>
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-0.5 transition">
                                                Open <ArrowRight className="size-3" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Two Column Layout: Create Workspace & Join Workspace */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Create Workspace Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <Plus className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                            Create a Workspace
                                        </h2>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Start a workspace where you are the Owner.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateWorkspace} className="mt-4 space-y-3.5">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Workspace Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={wsName}
                                            onChange={(e) => setWsName(e.target.value)}
                                            placeholder="e.g. Acme Studio, Alpha Engineering"
                                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={wsDesc}
                                            onChange={(e) => setWsDesc(e.target.value)}
                                            placeholder="Brief description of this workspace's purpose"
                                            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="size-4" />
                                                <span>Create Workspace</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <p className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">
                                🔒 Workspace data is isolated in PostgreSQL and accessible only to authorized members.
                            </p>
                        </div>

                        {/* Join an Existing Workspace Card */}
                        <div className="rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                        <Shield className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                            Join an Existing Workspace
                                        </h2>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Secure, invitation-only organization access.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 text-xs space-y-3">
                                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        Workspaces in Flowgrid are private to ensure complete team data isolation.
                                    </p>
                                    <div>
                                        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                                            Your Registered Email:
                                        </span>
                                        <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold inline-block">
                                            {user?.email || "loading..."}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                                        Ask your Workspace Owner or Admin to add this email under{" "}
                                        <strong className="text-zinc-700 dark:text-zinc-300">Team Members</strong>.
                                        Once added, click the button below to synchronize your memberships.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <button
                                    type="button"
                                    onClick={handleRefreshInvitations}
                                    disabled={isRefreshing}
                                    className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                                    <span>Check for Invitations / Refresh</span>
                                </button>
                                <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500">
                                    Direct email verification protects against unauthorized workspace discovery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
                <p>Flowgrid • Secure Multi-Tenant Architecture</p>
            </footer>
        </div>
    );
};

export default WorkspaceOnboarding;
