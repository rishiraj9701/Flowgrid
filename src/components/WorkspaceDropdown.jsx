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
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    <img src={currentWorkspace?.image_url || "/favicon.ico"} alt={currentWorkspace?.name || "Workspace"} className="w-8 h-8 rounded shadow object-cover" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2 max-h-60 overflow-y-auto">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            Workspaces
                        </p>
                        {workspaces.map((ws) => (
                            <div key={ws.id} onClick={() => onSelectWorkspace(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                <img src={ws.image_url || "/favicon.ico"} alt={ws.name} className="w-6 h-6 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {ws.membersCount || ws._count?.members || ws.members?.length || 1} members
                                    </p>
                                </div>
                                {currentWorkspace?.id === ws.id && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div 
                        onClick={() => {
                            setIsOpen(false);
                            setIsCreateModalOpen(true);
                        }}
                        className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" 
                    >
                        <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 font-medium">
                            <Plus className="w-4 h-4" /> Create Workspace
                        </p>
                    </div>

                    <div 
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/workspaces');
                        }}
                        className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800 border-t border-gray-100 dark:border-zinc-800" 
                    >
                        <p className="flex items-center text-xs gap-2 my-1 w-full text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white font-medium">
                            <Layers className="w-4 h-4" /> All Workspaces & Join
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
