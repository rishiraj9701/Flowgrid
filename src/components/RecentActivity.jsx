import { useMemo } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-500 dark:text-green-400" },
    IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400" },
    OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400" },
};

const statusColors = {
    TODO: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400",
    DONE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400",
};

const RecentActivity = () => {
    const { currentWorkspace } = useSelector((state) => state.workspace);

    // Declarative derivation with useMemo removes the missing dependency warning cleanly
    const tasks = useMemo(() => {
        if (!currentWorkspace?.projects) return [];
        return currentWorkspace.projects.flatMap((project) =>
            (project.tasks || []).map((t) => ({ ...t, projectName: project.name }))
        );
    }, [currentWorkspace]);

    return (
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Recent Activity
                </h2>
            </div>

            <div className="p-0">
                {tasks.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="size-12 mx-auto mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Clock className="size-5 text-zinc-400" />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-850 max-h-96 overflow-y-auto">
                        {tasks.slice(0, 8).map((task) => {
                            const TypeIcon = typeIcons[task.type]?.icon || Square;
                            const iconColor = typeIcons[task.type]?.color || "text-zinc-400";

                            return (
                                <div
                                    key={task.id}
                                    className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors flex items-start gap-3.5"
                                >
                                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg shrink-0">
                                        <TypeIcon className={`size-4 ${iconColor}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                                {task.title}
                                            </p>
                                            <span
                                                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                                    statusColors[task.status] || "bg-zinc-100"
                                                } shrink-0`}
                                            >
                                                {task.status?.replace("_", " ")}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                            In {task.projectName} • Assigned to {task.assignee?.name || "Unassigned"}
                                        </p>

                                        <p className="text-[10px] text-zinc-400 mt-1">
                                            {task.updatedAt || task.createdAt
                                                ? format(
                                                      new Date(task.updatedAt || task.createdAt),
                                                      "dd MMM, HH:mm"
                                                  )
                                                : "Recent"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
