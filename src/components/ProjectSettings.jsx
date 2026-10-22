import { format } from "date-fns";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateProjectAsync, deleteProjectAsync } from "../features/workspaceSlice";
import AddProjectMember from "./AddProjectMember";

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        progress: 0,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: project.start_date || "",
                end_date: project.end_date || "",
                progress: project.progress || 0,
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Project name cannot be empty");
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

        setIsSubmitting(true);

        try {
            const updated = {
                ...project,
                ...formData,
                name: formData.name.trim(),
                description: formData.description.trim(),
                start_date: formData.start_date
                    ? new Date(formData.start_date).toISOString()
                    : project.start_date,
                end_date: formData.end_date
                    ? new Date(formData.end_date).toISOString()
                    : project.end_date,
                progress: Number(formData.progress) || 0,
                updatedAt: new Date().toISOString(),
            };

            await dispatch(updateProjectAsync(updated)).unwrap();
            toast.success("Project settings saved successfully!");
        } catch (error) {
            console.error("Failed to update project settings:", error);
            toast.error(typeof error === "string" ? error : "Failed to save project settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!project?.id) return;
        setIsDeleting(true);
        try {
            await dispatch(deleteProjectAsync(project.id)).unwrap();
            toast.success("Project deleted successfully");
            navigate("/projects");
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error(typeof error === "string" ? error : "Failed to delete project");
            setIsDeleting(false);
        }
    };

    const inputClasses =
        "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500";

    const cardClasses =
        "rounded-xl border p-6 not-dark:bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 shadow-sm";

    const labelClasses = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

    const formatDateForInput = (dateVal) => {
        if (!dateVal) return "";
        try {
            return format(new Date(dateVal), "yyyy-MM-dd");
        } catch {
            return "";
        }
    };

    const projectMembers = project?.members || [];

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <div className={cardClasses}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                    Project Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Project Name *</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={inputClasses}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className={labelClasses}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className={inputClasses + " h-24"}
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                                className={inputClasses}
                            >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClasses}>Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) =>
                                    setFormData({ ...formData, priority: e.target.value })
                                }
                                className={inputClasses}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Start Date</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData.start_date)}
                                onChange={(e) =>
                                    setFormData({ ...formData, start_date: e.target.value })
                                }
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>End Date</label>
                            <input
                                type="date"
                                value={formatDateForInput(formData.end_date)}
                                onChange={(e) =>
                                    setFormData({ ...formData, end_date: e.target.value })
                                }
                                min={formatDateForInput(formData.start_date)}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm">
                            <label className={labelClasses}>Progress</label>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {formData.progress}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={formData.progress}
                            onChange={(e) =>
                                setFormData({ ...formData, progress: Number(e.target.value) })
                            }
                            className="w-full accent-blue-500 dark:accent-blue-400 mt-2"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center text-sm justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white font-medium px-5 py-2 rounded transition shadow-sm"
                        >
                            <Save className="size-4" />{" "}
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                                Team Members
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""} assigned
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-200 transition"
                        >
                            <Plus className="size-3.5" />
                            Add Member
                        </button>
                        <AddProjectMember
                            isDialogOpen={isDialogOpen}
                            setIsDialogOpen={setIsDialogOpen}
                        />
                    </div>

                    {/* Member List */}
                    {projectMembers.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {projectMembers.map((member, index) => (
                                <div
                                    key={member.id || index}
                                    className="flex items-center justify-between py-2.5 text-sm"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="size-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold">
                                            {(member?.user?.name || member?.user?.email || "U")[0].toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {member?.user?.name || "Member"}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                {member?.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    {project.team_lead === member?.user?.id && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                            Team Lead
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                            No team members assigned yet.
                        </p>
                    )}
                </div>

                {/* Danger Zone */}
                <div className={`${cardClasses} border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10`}>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                        Danger Zone
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                        Permanently delete this project and all of its tasks. This action cannot be undone.
                    </p>
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDeleteProject}
                                disabled={isDeleting}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 shadow-sm"
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete Project"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-800/80 text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-950/40 transition"
                        >
                            <Trash2 className="size-3.5" />
                            Delete Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
