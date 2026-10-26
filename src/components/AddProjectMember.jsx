import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { addProjectMemberAsync } from "../features/workspaceSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects?.find((p) => p.id === id);
    const projectMembersEmails = (project?.members || []).map((m) => m?.user?.email);

    const [email, setEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please select a team member");
            return;
        }

        if (!project) {
            toast.error("Project not found");
            return;
        }

        setIsAdding(true);

        try {
            const memberObj = currentWorkspace?.members?.find((m) => m.user.email === email);
            if (!memberObj) {
                toast.error("Member not found in workspace");
                return;
            }

            await dispatch(
                addProjectMemberAsync({
                    projectId: id,
                    userId: memberObj.user.id,
                    memberObj,
                })
            ).unwrap();

            toast.success(`${memberObj.user.name || memberObj.user.email} added to project`);

            setEmail("");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to add project member:", error);
            toast.error(typeof error === "string" ? error : "Failed to add member to project");
        } finally {
            setIsAdding(false);
        }
    };

    if (!project) return null;

    const availableMembers = (currentWorkspace?.members || []).filter(
        (member) => !projectMembersEmails.includes(member?.user?.email)
    );

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="size-5 text-blue-600 dark:text-blue-400" />
                        <span>Add Member to Project</span>
                    </DialogTitle>
                    <DialogDescription>
                        Adding to Project:{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {project.name}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Select Member */}
                    <div className="space-y-1.5">
                        <Label htmlFor="select-member">Select Workspace Member *</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 size-4 pointer-events-none" />
                            <select
                                id="select-member"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-xs transition-all cursor-pointer"
                                required
                            >
                                <option value="" className="bg-white dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100">Choose a member</option>
                                {availableMembers.map((member) => (
                                    <option key={member.user.id} value={member.user.email} className="bg-white dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100">
                                        {member.user.name} ({member.user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {availableMembers.length === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                All workspace members are already assigned to this project.
                            </p>
                        )}
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
                            disabled={isAdding || availableMembers.length === 0}
                        >
                            {isAdding ? "Adding..." : "Add Member"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectMember;

