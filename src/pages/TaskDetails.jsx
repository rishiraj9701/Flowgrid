import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarIcon, MessageCircle, PenIcon, Send } from "lucide-react";
import { assets, dummyUsers } from "../assets/assets";
import { addCommentAsync } from "../features/workspaceSlice";

const TaskDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const [newComment, setNewComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const authUser = useSelector((state) => state.auth?.user);

    // Derive project and task dynamically from Redux store for instantaneous, reactive sync
    const project = currentWorkspace?.projects?.find((p) => p.id === projectId);
    const task = project?.tasks?.find((t) => t.id === taskId);
    const comments = task?.comments || [];

    const handleAddComment = async (e) => {
        if (e) e.preventDefault();
        const content = newComment.trim();
        if (!content) {
            toast.error("Comment cannot be empty");
            return;
        }

        if (!projectId || !taskId) {
            toast.error("Missing project or task reference");
            return;
        }

        setIsPosting(true);

        try {
            const currentUser = authUser || dummyUsers[0];
            const commentObj = {
                id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                user: {
                    id: currentUser.id || "user_1",
                    name: currentUser.name || "Marcus Vance",
                    email: currentUser.email || "marcus.vance@nexus.io",
                    image: currentUser.image || assets.profile_img_a,
                },
                content: content,
                createdAt: new Date().toISOString(),
            };

            await dispatch(addCommentAsync({ projectId, taskId, comment: commentObj })).unwrap();
            setNewComment("");
            toast.success("Comment posted");
        } catch (error) {
            console.error("Failed to post comment:", error);
            toast.error("Failed to post comment");
        } finally {
            setIsPosting(false);
        }
    };

    if (!projectId || !taskId || !task) {
        return (
            <div className="max-w-4xl mx-auto py-16 px-4 text-center">
                <div className="inline-flex size-14 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center text-zinc-500 mb-4">
                    <MessageCircle className="size-6" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Task Not Found
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                    The requested task could not be located in this workspace. It may have been deleted or moved.
                </p>
                <button
                    onClick={() => navigate(projectId ? `/projectsDetail?id=${projectId}` : "/projects")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                >
                    <ArrowLeft className="size-4" />
                    Back to Project
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(`/projectsDetail?id=${projectId}&tab=tasks`)}
                    className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                >
                    <ArrowLeft className="size-4" />
                    Back to {project?.name || "Tasks"}
                </button>
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-6 text-zinc-900 dark:text-zinc-100">
                {/* Left: Comments / Chatbox */}
                <div className="w-full lg:w-2/3">
                    <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col lg:h-[75vh]">
                        <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-zinc-900 dark:text-white pb-3 border-b border-zinc-200 dark:border-zinc-800">
                            <MessageCircle className="size-5 text-blue-500" />
                            Discussion ({comments.length})
                        </h2>

                        {/* Comment Stream */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/80"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <img
                                                    src={comment.user?.image || assets.profile_img_a}
                                                    alt={comment.user?.name || "User"}
                                                    className="size-6 rounded-full object-cover"
                                                />
                                                <span className="font-medium text-xs text-zinc-900 dark:text-zinc-200">
                                                    {comment.user?.name || "Team Member"}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                                {comment.createdAt
                                                    ? format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")
                                                    : "Just now"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-zinc-400 dark:text-zinc-500">
                                    <MessageCircle className="size-8 stroke-1 mb-2" />
                                    <p className="text-sm">No comments yet.</p>
                                    <p className="text-xs">Leave a message below to start the conversation.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Comment Box */}
                        <form onSubmit={handleAddComment} className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-2">
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write an update, note, or comment..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isPosting || !newComment.trim()}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-medium transition shadow-sm"
                                    >
                                        <Send className="size-3.5" />
                                        {isPosting ? "Posting..." : "Post Comment"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: Task + Project Info */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    {/* Task Info */}
                    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                    {task.status?.replace("_", " ")}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                    {task.type}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                    {task.priority} Priority
                                </span>
                            </div>
                            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {task.title}
                            </h1>
                        </div>

                        {task.description && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500 mb-1">
                                    Description
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Assignee</span>
                                <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-200">
                                    {task.assignee?.image ? (
                                        <img src={task.assignee.image} className="size-5 rounded-full object-cover" alt="avatar" />
                                    ) : (
                                        <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                                            {(task.assignee?.name || "U")[0]}
                                        </div>
                                    )}
                                    <span>{task.assignee?.name || "Unassigned"}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Due Date</span>
                                <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-200">
                                    <CalendarIcon className="size-3.5 text-zinc-400" />
                                    <span>
                                        {task.due_date
                                            ? format(new Date(task.due_date), "dd MMM yyyy")
                                            : "No deadline"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Info */}
                    {project && (
                        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                            <p className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                                Associated Project
                            </p>
                            <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <PenIcon className="size-4 text-blue-500" />
                                {project.name}
                            </h2>
                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                <span>Status: {project.status?.replace("_", " ")}</span>
                                <span>Progress: {project.progress}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
