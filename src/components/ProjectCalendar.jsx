import { useState } from "react";
import {
    format,
    isSameDay,
    isBefore,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    getDay,
} from "date-fns";
import { CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const typeColors = {
    BUG: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
    FEATURE: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
    TASK: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400",
    IMPROVEMENT: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400",
    OTHER: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
};

const priorityBorders = {
    LOW: "border-zinc-300 dark:border-zinc-700",
    MEDIUM: "border-amber-400 dark:border-amber-500",
    HIGH: "border-red-500 dark:border-red-500",
};

const ProjectCalendar = ({ tasks = [] }) => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();

    // Helper to safely parse dates
    const safeDate = (d) => {
        if (!d) return null;
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const getTasksForDate = (date) =>
        tasks.filter((task) => {
            const taskDate = safeDate(task.due_date);
            return taskDate && isSameDay(taskDate, date);
        });

    const upcomingTasks = tasks
        .filter((task) => {
            const d = safeDate(task.due_date);
            return d && !isBefore(d, today) && task.status !== "DONE";
        })
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

    const overdueTasks = tasks.filter((task) => {
        const d = safeDate(task.due_date);
        return d && isBefore(d, today) && task.status !== "DONE";
    });

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDayIndex = getDay(monthStart); // 0 = Sunday, 1 = Monday...

    const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
    });

    const handleMonthChange = (direction) => {
        setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar Main Grid */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-zinc-900 dark:text-white font-semibold text-sm flex gap-2 items-center">
                            <CalendarIcon className="size-4 text-blue-500" /> Task Calendar
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleMonthChange("prev")}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <span className="text-zinc-900 dark:text-white font-medium text-sm">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleMonthChange("next")}
                                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                aria-label="Next month"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {/* Leading empty day cells for correct day of the week alignment */}
                        {Array.from({ length: startDayIndex }).map((_, index) => (
                            <div key={`empty-${index}`} className="h-14 rounded-lg bg-transparent" />
                        ))}

                        {/* Month Days */}
                        {daysInMonth.map((day) => {
                            const dayTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentDay = isSameDay(day, today);
                            const hasOverdue = dayTasks.some(
                                (t) => t.status !== "DONE" && isBefore(new Date(t.due_date), today)
                            );

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    onClick={() => setSelectedDate(day)}
                                    className={`h-14 rounded-lg p-1.5 flex flex-col items-center justify-between text-xs transition relative
                                        ${
                                            isSelected
                                                ? "bg-blue-600 text-white font-semibold shadow-sm"
                                                : isCurrentDay
                                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800"
                                                : "bg-zinc-50/80 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                                        }
                                        ${
                                            hasOverdue && !isSelected
                                                ? "ring-1 ring-red-400 dark:ring-red-500"
                                                : ""
                                        }`}
                                >
                                    <span>{format(day, "d")}</span>
                                    {dayTasks.length > 0 && (
                                        <span
                                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                                isSelected
                                                    ? "bg-white/20 text-white"
                                                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                            }`}
                                        >
                                            {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tasks for Selected Day */}
                {selectedDayTasks.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-zinc-900 dark:text-white text-sm font-semibold flex items-center justify-between">
                            <span>Tasks for {format(selectedDate, "MMM d, yyyy")}</span>
                            <span className="text-xs text-zinc-400 font-normal">
                                {selectedDayTasks.length} scheduled
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {selectedDayTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() =>
                                        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                    }
                                    className={`bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition p-3.5 rounded-lg border-l-4 cursor-pointer ${
                                        priorityBorders[task.priority] || "border-zinc-300"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h4 className="text-zinc-900 dark:text-white font-medium text-xs">
                                            {task.title}
                                        </h4>
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                typeColors[task.type] || "bg-zinc-100 text-zinc-700"
                                            }`}
                                        >
                                            {task.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                                        <span className="capitalize">{task.status?.toLowerCase().replace("_", " ")}</span>
                                        {task.assignee && (
                                            <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                                                <User className="w-3 h-3 text-zinc-400" />
                                                {task.assignee.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar: Upcoming & Overdue */}
            <div className="space-y-6">
                {/* Upcoming Tasks */}
                <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-zinc-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" /> Upcoming Deadlines
                    </h3>
                    {upcomingTasks.length === 0 ? (
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center py-4">
                            No upcoming deadlines scheduled.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() =>
                                        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                    }
                                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition cursor-pointer space-y-1"
                                >
                                    <div className="flex justify-between items-start text-xs font-medium">
                                        <span className="text-zinc-900 dark:text-white truncate">
                                            {task.title}
                                        </span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-2 ${
                                                typeColors[task.type] || "bg-zinc-100 text-zinc-700"
                                            }`}
                                        >
                                            {task.type}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400">
                                        Due {format(new Date(task.due_date), "MMM d, yyyy")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900/60 border-l-4 border-red-500 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                        <h3 className="text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Overdue Tasks ({overdueTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {overdueTasks.slice(0, 5).map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() =>
                                        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)
                                    }
                                    className="bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-3 rounded-lg transition cursor-pointer space-y-1"
                                >
                                    <div className="flex justify-between text-xs font-medium text-zinc-900 dark:text-white">
                                        <span className="truncate">{task.title}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 shrink-0 ml-2">
                                            {task.type}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-red-600 dark:text-red-400">
                                        Due {format(new Date(task.due_date), "MMM d, yyyy")}
                                    </p>
                                </div>
                            ))}
                            {overdueTasks.length > 5 && (
                                <p className="text-[11px] text-zinc-400 text-center pt-1">
                                    +{overdueTasks.length - 5} more overdue tasks
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;
