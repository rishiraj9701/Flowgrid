import { useState, useEffect } from "react";
import { Building2, XIcon, RotateCcw, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateWorkspaceAsync, resetToDefaultData } from "../features/workspaceSlice";

const WorkspaceSettingsDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentWorkspace) {
            setName(currentWorkspace.name || "");
            setDescription(currentWorkspace.description || "");
        }
    }, [currentWorkspace, isDialogOpen]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Workspace name cannot be empty");
            return;
        }

        if (!currentWorkspace) {
            toast.error("No active workspace to update");
            return;
        }

        setIsSaving(true);
        try {
            const updated = {
                ...currentWorkspace,
                name: name.trim(),
                description: description.trim(),
                updatedAt: new Date().toISOString(),
            };

            await dispatch(updateWorkspaceAsync(updated)).unwrap();
            toast.success("Workspace updated successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to update workspace:", error);
            toast.error("Failed to save workspace settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all workspaces, projects, and tasks to original demo data? Any custom changes will be cleared."
        );
        if (!confirmed) return;

        try {
            dispatch(resetToDefaultData());
            toast.success("Restored demo dataset");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to reset demo data:", error);
            toast.error("Failed to reset demo data");
        }
    };

    if (!isDialogOpen || !currentWorkspace) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative shadow-2xl space-y-5">
                <button
                    className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    onClick={() => setIsDialogOpen(false)}
                    aria-label="Close"
                >
                    <XIcon className="size-4" />
                </button>

                {/* Header */}
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
                        <Building2 className="size-5 text-blue-500" />
                        Workspace Settings
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Configure general workspace information and settings.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Workspace Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Workspace Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Engineering, Marketing..."
                            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional workspace description"
                            className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Reset to Demo Data option */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                Demo Dataset
                            </p>
                            <p className="text-[11px] text-zinc-400">
                                Restore original mock projects and tasks
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition"
                        >
                            <RotateCcw className="size-3" />
                            Reset Data
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition shadow-sm"
                        >
                            <Check className="size-3.5" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkspaceSettingsDialog;
