import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const authUser = useSelector((state) => state.auth?.user);
    const userId = authUser?.id || "user_1";

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `in ${currentWorkspace?.name || "workspace"}`,
            bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
            textColor: "text-blue-600 dark:text-blue-400",
        },
        {
            icon: CheckCircle,
            title: "Completed Projects",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} total`,
            bgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
            textColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to you",
            bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
            textColor: "text-purple-600 dark:text-purple-400",
        },
        {
            icon: AlertTriangle,
            title: "Overdue Tasks",
            value: stats.overdueIssues,
            subtitle: "need attention",
            bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
            textColor: "text-amber-600 dark:text-amber-400",
        },
    ];

    useEffect(() => {
        const now = new Date();
        const projects = currentWorkspace?.projects || [];

        setStats({
            totalProjects: projects.length,
            activeProjects: projects.filter(
                (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
            ).length,
            completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
            myTasks: projects.reduce(
                (acc, project) =>
                    acc +
                    (project.tasks || []).filter(
                        (t) => t.assigneeId === userId || t.assignee?.id === userId
                    ).length,
                0
            ),
            overdueIssues: projects.reduce(
                (acc, project) =>
                    acc +
                    (project.tasks || []).filter(
                        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE"
                    ).length,
                0
            ),
        });
    }, [currentWorkspace, userId]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            {statCards.map((card, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 rounded-xl p-5 shadow-sm"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                {card.title}
                            </p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                                {card.value}
                            </p>
                            {card.subtitle && (
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                                    {card.subtitle}
                                </p>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                            <card.icon size={18} className={card.textColor} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
