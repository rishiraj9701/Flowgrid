import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addWorkspaceMemberAsync } from "../features/workspaceSlice";
import { assets } from "../assets/assets";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        role: "org:member",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = formData.email.trim().toLowerCase();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!currentWorkspace) {
            toast.error("No active workspace selected");
            return;
        }

        // Check for duplicates
        const alreadyExists = currentWorkspace.members?.some(
            (m) => m.user?.email?.toLowerCase() === email
        );
        if (alreadyExists) {
            toast.error("This user is already a member of this workspace");
            return;
        }

        setIsSubmitting(true);

        try {
            const roleString = formData.role === "org:admin" ? "ADMIN" : "MEMBER";
            const newUserId = `user_${Date.now()}`;
            const nameFromEmail = email
                .split("@")[0]
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());

            const newMember = {
                id: `wm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                userId: newUserId,
                workspaceId: currentWorkspace.id,
                message: "",
                role: roleString,
                email: email,
                user: {
                    id: newUserId,
                    name: nameFromEmail,
                    email: email,
                    image: assets.profile_img_o,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };

            await dispatch(addWorkspaceMemberAsync(newMember)).unwrap();
            toast.success(`Invited ${email} as ${roleString}`);

            setFormData({
                email: "",
                role: "org:member",
            });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to invite member:", error);
            toast.error(typeof error === "string" ? error : "Failed to send invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

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
                        <UserPlus className="size-5 text-blue-600 dark:text-blue-400" /> Invite Team Member
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            Inviting to workspace:{" "}
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {currentWorkspace.name}
                            </span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1">
                        <label
                            htmlFor="invite-email"
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-200"
                        >
                            Email Address *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
                            <input
                                id="invite-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                                className="pl-10 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="org:member">Member</option>
                            <option value="org:admin">Admin</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-5 py-2 rounded text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentWorkspace}
                            className="px-5 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium disabled:opacity-50 hover:opacity-90 transition"
                        >
                            {isSubmitting ? "Sending..." : "Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
