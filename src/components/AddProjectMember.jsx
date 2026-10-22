import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { addProjectMemberAsync } from "../features/workspaceSlice";

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

    if (!isDialogOpen || !project) return null;

    const availableMembers = (currentWorkspace?.members || []).filter(
        (member) => !projectMembersEmails.includes(member?.user?.email)
    );

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative shadow-2xl">
                <button
                    className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    onClick={() => setIsDialogOpen(false)}
                    aria-label="Close"
                >
                    <XIcon className="size-5" />
                </button>

                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-blue-600 dark:text-blue-400" /> Add Member to Project
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        Adding to Project:{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {project.name}
                        </span>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Select Member */}
                    <div className="space-y-1">
                        <label
                            htmlFor="select-member"
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-200"
                        >
                            Select Workspace Member *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4 pointer-events-none" />
                            <select
                                id="select-member"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a member</option>
                                {availableMembers.map((member) => (
                                    <option key={member.user.id} value={member.user.email}>
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
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAdding || availableMembers.length === 0}
                            className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white font-medium disabled:opacity-50 transition"
                        >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
