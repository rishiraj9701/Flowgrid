import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users, ArrowRightIcon, PieChart as PieIcon } from "lucide-react";

// Colors for charts and priorities
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const PRIORITY_COLORS = {
    LOW: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/40",
    MEDIUM: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40",
    HIGH: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40",
};

const ProjectAnalytics = ({ project, tasks = [] }) => {
    const { stats, statusData, typeData, priorityData } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;

        const stats = {
            total,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
        };

        const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const typeMap = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
        const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (t.due_date && new Date(t.due_date) < now && t.status !== "DONE") stats.overdue++;

            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (typeMap[t.type] !== undefined) typeMap[t.type]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({
                name: k.replace("_", " "),
                value: v,
            })),
            typeData: Object.entries(typeMap)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => ({ name: k, value: v })),
            priorityData: Object.entries(priorityMap).map(([k, v]) => ({
                name: k,
                value: v,
                percentage: total > 0 ? Math.round((v / total) * 100) : 0,
            })),
        };
    }, [tasks]);

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const metrics = [
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            color: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-100 dark:bg-emerald-950/40",
        },
        {
            label: "Active Tasks",
            value: stats.inProgress,
            color: "text-blue-600 dark:text-blue-400",
            icon: <Clock className="size-5 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-100 dark:bg-blue-950/40",
        },
        {
            label: "Overdue Tasks",
            value: stats.overdue,
            color: "text-red-600 dark:text-red-400",
            icon: <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />,
            bg: "bg-red-100 dark:bg-red-950/40",
        },
        {
            label: "Team Size",
            value: project?.members?.length || 0,
            color: "text-purple-600 dark:text-purple-400",
            icon: <Users className="size-5 text-purple-600 dark:text-purple-400" />,
            bg: "bg-purple-100 dark:bg-purple-950/40",
        },
    ];

    return (
        <div className="space-y-6">
            {/* 4 Summary Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                    {m.label}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg ${m.bg}`}>{m.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Tasks by Status (Bar Chart) */}
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-zinc-900 dark:text-white mb-4 text-sm font-semibold">
                        Tasks by Status
                    </h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#71717a", fontSize: 11 }}
                                    axisLine={{ stroke: "#e4e4e7" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#71717a", fontSize: 11 }}
                                    axisLine={{ stroke: "#e4e4e7" }}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        borderColor: "#27272a",
                                        borderRadius: "8px",
                                        color: "#f4f4f5",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tasks by Type (Pie Chart) */}
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-zinc-900 dark:text-white mb-4 text-sm font-semibold">
                        Tasks by Type
                    </h2>
                    <div className="h-64 w-full flex items-center justify-center">
                        {typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={85}
                                        innerRadius={45}
                                        paddingAngle={4}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {typeData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#18181b",
                                            borderColor: "#27272a",
                                            borderRadius: "8px",
                                            color: "#f4f4f5",
                                            fontSize: "12px",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-zinc-400 text-xs py-8 space-y-2">
                                <PieIcon className="size-8 stroke-1 mx-auto text-zinc-400" />
                                <p>No tasks available to chart.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-zinc-900 dark:text-white mb-4 text-sm font-semibold">
                    Tasks by Priority
                </h2>
                <div className="space-y-4">
                    {priorityData.map((p) => (
                        <div key={p.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5">
                                    <ArrowRightIcon className="size-3 text-zinc-400" />
                                    <span className="text-zinc-900 dark:text-zinc-200 font-medium capitalize">
                                        {p.name.toLowerCase()} Priority
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                        {p.value} {p.value === 1 ? "task" : "tasks"}
                                    </span>
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {p.percentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        p.name === "HIGH"
                                            ? "bg-red-500"
                                            : p.name === "MEDIUM"
                                            ? "bg-amber-500"
                                            : "bg-blue-500"
                                    }`}
                                    style={{ width: `${p.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;
