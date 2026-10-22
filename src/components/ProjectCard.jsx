import { Link } from "react-router-dom";

const statusColors = {
    PLANNING: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400",
    ON_HOLD: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400",
    COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400",
};

const ProjectCard = ({ project }) => {
    return (
        <Link
            to={`/projectsDetail?id=${project.id}&tab=tasks`}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
        >
            {/* Header */}
            <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
                        {project.name}
                    </h3>
                    <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                            statusColors[project.status] || "bg-zinc-100"
                        }`}
                    >
                        {project.status?.replace("_", " ")}
                    </span>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {project.description || "No description provided."}
                </p>
            </div>

            {/* Footer / Progress */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 dark:text-zinc-500 capitalize text-[11px]">
                        {project.priority?.toLowerCase()} priority
                    </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 text-xs">
                        {project.progress || 0}%
                    </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${project.progress || 0}%` }}
                    />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
