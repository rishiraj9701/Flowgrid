import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTaskAsync, updateTaskAsync } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap } from "lucide-react";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-600 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
};

const priorityTexts = {
    LOW: { background: "bg-slate-100 dark:bg-slate-800", prioritycolor: "text-slate-700 dark:text-slate-300" },
    MEDIUM: { background: "bg-amber-100 dark:bg-amber-950/60", prioritycolor: "text-amber-700 dark:text-amber-400" },
    HIGH: { background: "bg-rose-100 dark:bg-rose-950/60", prioritycolor: "text-rose-700 dark:text-rose-400" },
};

const ProjectTasks = ({ tasks = [] }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || task.status === status) &&
                (!type || task.type === type) &&
                (!priority || task.priority === priority) &&
                (!assignee || task.assignee?.name === assignee)
            );
        });
    }, [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (taskId, newStatus) => {
        try {
            const task = tasks.find((t) => t.id === taskId);
            if (!task) return;

            const updatedTask = {
                ...task,
                status: newStatus,
                updatedAt: new Date().toISOString(),
            };

            dispatch(updateTaskAsync(updatedTask));
            toast.success("Task status updated");
        } catch (error) {
            console.error("Failed to update task status:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = () => {
        if (selectedTasks.length === 0) return;

        const count = selectedTasks.length;
        const confirmMsg = count === 1
            ? "Are you sure you want to delete this task?"
            : `Are you sure you want to delete ${count} selected tasks?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            dispatch(deleteTaskAsync(selectedTasks));
            setSelectedTasks([]);
            toast.success(`${count} task${count > 1 ? "s" : ""} deleted`);
        } catch (error) {
            console.error("Failed to delete tasks:", error);
            toast.error("Failed to delete tasks");
        }
    };

    const toggleSelectAll = () => {
        if (selectedTasks.length === filteredTasks.length && filteredTasks.length > 0) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(filteredTasks.map((t) => t.id));
        }
    };

    const toggleSelectTask = (taskId, e) => {
        if (e) e.stopPropagation();
        setSelectedTasks((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };

    const hasActiveFilters = Boolean(
        filters.status || filters.type || filters.priority || filters.assignee
    );

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status filter */}
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>

                    {/* Type filter */}
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="TASK">Task</option>
                        <option value="BUG">Bug</option>
                        <option value="FEATURE">Feature</option>
                        <option value="IMPROVEMENT">Improvement</option>
                        <option value="OTHER">Other</option>
                    </select>

                    {/* Priority filter */}
                    <select
                        name="priority"
                        value={filters.priority}
                        onChange={handleFilterChange}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>

                    {/* Assignee filter */}
                    <select
                        name="assignee"
                        value={filters.assignee}
                        onChange={handleFilterChange}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-200 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Assignees</option>
                        {assigneeList.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>

                    {/* Reset button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() =>
                                setFilters({ status: "", type: "", priority: "", assignee: "" })
                            }
                            className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs transition"
                        >
                            <XIcon className="size-3" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Batch Actions */}
                {selectedTasks.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {selectedTasks.length} selected
                        </span>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-sm"
                        >
                            <Trash className="size-3" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Tasks Container */}
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-zinc-900 dark:text-zinc-300">
                        <thead className="text-[11px] uppercase tracking-wider font-semibold bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="py-3 pl-4 pr-2 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={
                                            filteredTasks.length > 0 &&
                                            selectedTasks.length === filteredTasks.length
                                        }
                                        className="size-3.5 rounded accent-blue-600 cursor-pointer"
                                        aria-label="Select all tasks"
                                    />
                                </th>
                                <th className="px-4 py-3">Task Title</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assignee</th>
                                <th className="px-4 py-3">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => {
                                    const { icon: Icon, color } = typeIcons[task.type] || {};
                                    const { background, prioritycolor } = priorityTexts[task.priority] || {};

                                    return (
                                        <tr
                                            key={task.id}
                                            onClick={() =>
                                                navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                            }
                                            className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                                        >
                                            <td onClick={(e) => e.stopPropagation()} className="py-3 pl-4 pr-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTasks.includes(task.id)}
                                                    onChange={(e) => toggleSelectTask(task.id, e)}
                                                    className="size-3.5 rounded accent-blue-600 cursor-pointer"
                                                    aria-label={`Select task ${task.title}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                                {task.title}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    {Icon && <Icon className={`size-3.5 ${color}`} />}
                                                    <span className={`text-xs font-medium uppercase ${color}`}>
                                                        {task.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${background} ${prioritycolor}`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()} className="px-4 py-3">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    className="bg-transparent border border-zinc-200 dark:border-zinc-700/80 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {task.assignee?.image ? (
                                                        <img
                                                            src={task.assignee.image}
                                                            className="size-5 rounded-full object-cover"
                                                            alt="avatar"
                                                        />
                                                    ) : (
                                                        <div className="size-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                                                            {(task.assignee?.name || "U")[0]}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-zinc-700 dark:text-zinc-300">
                                                        {task.assignee?.name || "Unassigned"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <CalendarIcon className="size-3.5" />
                                                    <span>
                                                        {task.due_date
                                                            ? format(new Date(task.due_date), "dd MMM yyyy")
                                                            : "-"}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-zinc-400 dark:text-zinc-500 py-12 text-sm">
                                        No tasks match the active filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => {
                            const { icon: Icon, color } = typeIcons[task.type] || {};
                            const { background, prioritycolor } = priorityTexts[task.priority] || {};

                            return (
                                <div
                                    key={task.id}
                                    onClick={() =>
                                        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                    }
                                    className="p-4 space-y-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedTasks.includes(task.id)}
                                                onChange={(e) => toggleSelectTask(task.id, e)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="size-4 rounded accent-blue-600"
                                            />
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                                {task.title}
                                            </h3>
                                        </div>
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${background} ${prioritycolor}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            {Icon && <Icon className={`size-3.5 ${color}`} />}
                                            <span className={`uppercase font-medium text-[11px] ${color}`}>
                                                {task.type}
                                            </span>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs text-zinc-900 dark:text-zinc-200 outline-none"
                                            >
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="DONE">Done</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                                        <span>{task.assignee?.name || "Unassigned"}</span>
                                        <span>
                                            {task.due_date ? format(new Date(task.due_date), "dd MMM") : "-"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-zinc-400 dark:text-zinc-500 py-8 text-sm">
                            No tasks found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectTasks;
