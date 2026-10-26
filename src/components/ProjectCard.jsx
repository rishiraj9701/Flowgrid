import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, Users } from 'lucide-react'

const statusBadges = {
    PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60',
    ON_HOLD: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60',
    COMPLETED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60',
    CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60',
}

const ProjectCard = ({ project }) => {
    return (
        <Link
            to={`/projectsDetail?id=${project.id}&tab=tasks`}
            className="block group h-full"
        >
            <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                    {/* Top Row: Title, status & arrow button */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {project.name}
                            </h3>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadges[project.status] || 'bg-slate-100'}`}>
                                {project.status?.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {project.description || 'No description provided.'}
                    </p>
                </div>

                {/* Progress bar & metadata */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                            {project.priority && (
                                <span className="font-medium text-slate-500 dark:text-slate-400">
                                    {project.priority === 'HIGH' ? 'High Priority' : project.priority === 'MEDIUM' ? 'Medium Priority' : 'Low Priority'}
                                </span>
                            )}
                            {project.members?.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Users className="size-3" />
                                    {project.members.length}
                                </span>
                            )}
                            {project.end_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-3" />
                                    {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {project.progress || 0}%
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress || 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default ProjectCard
