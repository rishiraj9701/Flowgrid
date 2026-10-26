import { useState, useEffect } from "react";
import { Building2, RotateCcw, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateWorkspaceAsync, resetToDefaultData } from "../features/workspaceSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

    if (!currentWorkspace) return null;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="size-5 text-blue-500" />
                        <span>Workspace Settings</span>
                    </DialogTitle>
                    <DialogDescription>
                        Configure general workspace information and settings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* Workspace Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="ws-name">Workspace Name *</Label>
                        <Input
                            id="ws-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Engineering, Marketing..."
                            className="h-10"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="ws-desc">Description</Label>
                        <Textarea
                            id="ws-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional workspace description"
                            className="h-20 resize-none"
                        />
                    </div>

                    {/* Reset to Demo Data option */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                Demo Dataset
                            </p>
                            <p className="text-[11px] text-zinc-400">
                                Restore original mock projects and tasks
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="gap-1.5"
                        >
                            <RotateCcw className="size-3" />
                            <span>Reset Data</span>
                        </Button>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="gap-1.5"
                        >
                            <Check className="size-3.5" />
                            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default WorkspaceSettingsDialog;

