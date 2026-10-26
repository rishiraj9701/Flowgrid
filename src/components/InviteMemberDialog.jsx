import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addWorkspaceMemberAsync } from "../features/workspaceSlice";
import { assets } from "../assets/assets";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="size-5 text-blue-600 dark:text-blue-400" />
                        <span>Invite Team Member</span>
                    </DialogTitle>
                    {currentWorkspace && (
                        <DialogDescription>
                            Inviting to workspace:{" "}
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {currentWorkspace.name}
                            </span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="invite-email">Email Address *</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 size-4 pointer-events-none" />
                            <Input
                                id="invite-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@company.com"
                                className="pl-10 h-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label htmlFor="invite-role">Role</Label>
                        <select
                            id="invite-role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100 py-2 px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 shadow-xs transition-all cursor-pointer"
                        >
                            <option value="org:member" className="bg-white dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100">Member</option>
                            <option value="org:admin" className="bg-white dark:bg-[#0c0e17] text-zinc-900 dark:text-zinc-100">Admin</option>
                        </select>
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
                            disabled={isSubmitting || !currentWorkspace}
                        >
                            {isSubmitting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InviteMemberDialog;

