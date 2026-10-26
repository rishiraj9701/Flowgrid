import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, X, Layers } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createWorkspaceAsync, selectWorkspaceAsync } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function WorkspaceDropdown() {
    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [newWsDesc, setNewWsDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        dispatch(selectWorkspaceAsync(organizationId));
        setIsOpen(false);
        navigate('/');
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const trimmed = newWsName.trim();
        if (!trimmed) {
            toast.error("Workspace name is required");
            return;
        }

        setIsCreating(true);
        try {
            await dispatch(createWorkspaceAsync({
                name: trimmed,
                description: newWsDesc.trim() || null,
            })).unwrap();
            toast.success("Workspace created successfully!");
            setNewWsName("");
            setNewWsDesc("");
            setIsCreateModalOpen(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to create workspace:", error);
            toast.error(typeof error === "string" ? error : "Failed to create workspace");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="relative mb-2" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl text-left bg-slate-100/90 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 border border-slate-200/90 dark:border-slate-800 transition-colors cursor-pointer group shadow-2xs"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <img
                        src={currentWorkspace?.image_url || "/favicon.ico"}
                        alt={currentWorkspace?.name || "Workspace"}
                        className="size-7 rounded-xl shadow-2xs border border-slate-200/80 dark:border-slate-700 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate leading-tight">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="size-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 ml-1.5" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl top-full left-0 mt-1.5 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1.5 max-h-60 overflow-y-auto">
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider px-2 py-1">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                onClick={() => onSelectWorkspace(ws.id)}
                                className="flex items-center gap-2.5 px-2.5 py-1.5 cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
                            >
                                <img
                                    src={ws.image_url || "/favicon.ico"}
                                    alt={ws.name}
                                    className="size-6 rounded-md object-cover border border-zinc-200/80 dark:border-zinc-700 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                        {ws.membersCount || ws._count?.members || ws.members?.length || 1} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/80" />

                    <div
                        onClick={() => {
                            setIsOpen(false);
                            setIsCreateModalOpen(true);
                        }}
                        className="px-2 py-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors"
                    >
                        <p className="flex items-center text-xs gap-2 px-1 py-0.5 text-blue-600 dark:text-blue-400 font-medium">
                            <Plus className="size-3.5" /> Create Workspace
                        </p>
                    </div>

                    <div
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/workspaces');
                        }}
                        className="px-2 py-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border-t border-zinc-100 dark:border-zinc-800/80 transition-colors"
                    >
                        <p className="flex items-center text-xs gap-2 px-1 py-0.5 text-zinc-600 dark:text-zinc-400 font-medium">
                            <Layers className="size-3.5" /> All Workspaces &amp; Join
                        </p>
                    </div>
                </div>
            )}

            {/* Create Workspace Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 overflow-hidden text-zinc-900 dark:text-white">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-base">Create New Workspace</h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Workspace Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Studio, Tech Launch"
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Description (optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Brief description of this workspace"
                                    value={newWsDesc}
                                    onChange={(e) => setNewWsDesc(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                                >
                                    {isCreating ? "Creating..." : "Create Workspace"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
