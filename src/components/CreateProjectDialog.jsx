import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createProjectAsync } from "../features/workspaceSlice";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const removeTeamMember = (email) => {
        setFormData((prev) => ({
            ...prev,
            team_members: prev.team_members.filter((m) => m !== email),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Project name is required");
            return;
        }

        if (
            formData.start_date &&
            formData.end_date &&
            new Date(formData.end_date) < new Date(formData.start_date)
        ) {
            toast.error("End date cannot be earlier than start date");
            return;
        }

        if (!currentWorkspace) {
            toast.error("No active workspace selected");
            return;
        }

        setIsSubmitting(true);

        try {
            const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

            // Determine team lead
            const leadMember = currentWorkspace.members?.find(
                (m) => m.user.email === formData.team_lead
            );
            const teamLeadId = leadMember
                ? leadMember.user.id
                : currentWorkspace.members?.[0]?.user?.id || "user_1";

            // Build project members list
            const projectMembersList = [];
            const emailsToInclude = new Set(formData.team_members);
            if (formData.team_lead) {
                emailsToInclude.add(formData.team_lead);
            }

            emailsToInclude.forEach((email) => {
                const member = currentWorkspace.members?.find((m) => m.user.email === email);
                if (member) {
                    projectMembersList.push({
                        id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        userId: member.user.id,
                        projectId: newProjectId,
                        user: member.user,
                    });
                }
            });

            // If no members were matched, at least add the team lead
            if (projectMembersList.length === 0 && currentWorkspace.members?.length > 0) {
                const defaultMember = currentWorkspace.members[0];
                projectMembersList.push({
                    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    userId: defaultMember.user.id,
                    projectId: newProjectId,
                    user: defaultMember.user,
                });
            }

            const newProject = {
                id: newProjectId,
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date
                    ? new Date(formData.start_date).toISOString()
                    : new Date().toISOString(),
                end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
                team_lead: teamLeadId,
                workspaceId: currentWorkspace.id,
                progress: Number(formData.progress) || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                members: projectMembersList,
                tasks: [],
            };

            await dispatch(createProjectAsync(newProject)).unwrap();
            toast.success("Project created successfully!");

            // Reset form
            setFormData({
                name: "",
                description: "",
                status: "PLANNING",
                priority: "MEDIUM",
                start_date: "",
                end_date: "",
                team_members: [],
                team_lead: "",
                progress: 0,
            });

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to create project:", error);
            toast.error("Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative shadow-2xl">
                <button
                    className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    onClick={() => setIsDialogOpen(false)}
                    aria-label="Close"
                >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-medium mb-1">Create New Project</h2>
                {currentWorkspace && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        In workspace: <span className="text-blue-600 dark:text-blue-400 font-medium">{currentWorkspace.name}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your project"
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={formData.start_date ? formData.start_date : undefined}
                                className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Lead */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Project Lead</label>
                        <select
                            value={formData.team_lead}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    team_lead: e.target.value,
                                    team_members: e.target.value
                                        ? [...new Set([...formData.team_members, e.target.value])]
                                        : formData.team_members,
                                })
                            }
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select project lead</option>
                            {currentWorkspace?.members?.map((member) => (
                                <option key={member.user.email} value={member.user.email}>
                                    {member.user.name} ({member.user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Team Members</label>
                        <select
                            className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => {
                                if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        team_members: [...prev.team_members, e.target.value],
                                    }));
                                }
                            }}
                            value=""
                        >
                            <option value="">Add team members</option>
                            {currentWorkspace?.members
                                ?.filter((m) => !formData.team_members.includes(m.user.email))
                                .map((member) => (
                                    <option key={member.user.email} value={member.user.email}>
                                        {member.user.name} ({member.user.email})
                                    </option>
                                ))}
                        </select>

                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.team_members.map((email) => (
                                    <div
                                        key={email}
                                        className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium"
                                    >
                                        <span>{email}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(email)}
                                            className="hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded p-0.5"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm">
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(false)}
                            className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !currentWorkspace}
                            className="px-5 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white font-medium disabled:opacity-50 transition"
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;