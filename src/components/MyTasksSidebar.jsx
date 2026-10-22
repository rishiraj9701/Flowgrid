import { useState, useMemo } from 'react';
import { CheckSquareIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function MyTasksSidebar() {
    const authUser = useSelector((state) => state.auth?.user);
    const userId = authUser?.id || 'user_1';

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [showMyTasks, setShowMyTasks] = useState(false);

    const toggleMyTasks = () => setShowMyTasks((prev) => !prev);

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'DONE':
                return 'bg-emerald-500';
            case 'IN_PROGRESS':
                return 'bg-amber-500';
            case 'TODO':
                return 'bg-zinc-400 dark:bg-zinc-600';
            default:
                return 'bg-zinc-400';
        }
    };

    // Declarative derivation with useMemo removes the missing dependency warning cleanly
    const myTasks = useMemo(() => {
        if (!currentWorkspace?.projects) return [];
        return currentWorkspace.projects.flatMap((project) =>
            (project.tasks || [])
                .filter((task) => task?.assigneeId === userId || task?.assignee?.id === userId)
                .map((task) => ({ ...task, projectName: project.name }))
        );
    }, [currentWorkspace, userId]);

    return (
        <div className="mt-3 px-3">
            <div
                onClick={toggleMyTasks}
                className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
            >
                <div className="flex items-center gap-2">
                    <CheckSquareIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        My Tasks
                    </h3>
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {myTasks.length}
                    </span>
                </div>
                {showMyTasks ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                    <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-400" />
                )}
            </div>

            {showMyTasks && (
                <div className="mt-1 space-y-1 pl-4">
                    {myTasks.length > 0 ? (
                        myTasks.slice(0, 8).map((task) => (
                            <Link
                                to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`}
                                key={task.id}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 transition group"
                            >
                                <span
                                    className={`size-2 rounded-full ${getTaskStatusColor(task.status)} shrink-0`}
                                />
                                <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {task.title}
                                </span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-[11px] text-zinc-400 py-1 pl-2">No tasks assigned to you</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTasksSidebar;
