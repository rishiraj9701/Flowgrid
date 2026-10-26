import { useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MessageCircle, Send, Flag, Briefcase } from 'lucide-react'
import { addCommentAsync } from '../features/workspaceSlice'
import { dummyWorkspaces } from '../assets/assets.js'

export default function TaskDetails() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const projectId = searchParams.get('projectId')
    const taskId = searchParams.get('taskId')

    const [newComment, setNewComment] = useState('')
    const [isPosting, setIsPosting] = useState(false)

    const { currentWorkspace } = useSelector((state) => state.workspace)
    const authUser = useSelector((state) => state.auth?.user)

    const project =
        currentWorkspace?.projects?.find((p) => p.id === projectId) ||
        (dummyWorkspaces[0]?.projects || []).find((p) => p.id === projectId)
    const task = project?.tasks?.find((t) => t.id === taskId)
    const comments = task?.comments || []

    const handleAddComment = async (e) => {
        if (e) e.preventDefault()
        const content = newComment.trim()
        if (!content) {
            toast.error('Comment cannot be empty')
            return
        }

        if (!projectId || !taskId) {
            toast.error('Missing project or task reference')
            return
        }

        setIsPosting(true)

        try {
            const commentObj = {
                id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                user: {
                    id: authUser?.id || 'user_1',
                    name: authUser?.name || 'Rishi Raj',
                    email: authUser?.email || 'rishi.raj@flowgrid.app',
                },
                content: content,
                createdAt: new Date().toISOString(),
            }

            await dispatch(addCommentAsync({ projectId, taskId, comment: commentObj })).unwrap()
            setNewComment('')
            toast.success('Comment posted')
        } catch (error) {
            console.error('Failed to post comment:', error)
            toast.error('Failed to post comment')
        } finally {
            setIsPosting(false)
        }
    }

    if (!projectId || !taskId || !task) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                <div className="size-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <MessageCircle className="size-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Task Not Found
                </h2>
                <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
                    The requested task could not be located in this workspace. It may have been deleted or moved.
                </p>
                <button
                    type="button"
                    onClick={() => navigate(projectId ? `/projectsDetail?id=${projectId}` : '/tasks')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f172a] text-white text-xs font-semibold"
                >
                    <ArrowLeft className="size-4" />
                    <span>Back to Tasks</span>
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate(projectId ? `/projectsDetail?id=${projectId}&tab=tasks` : '/tasks')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    <span>Back to {project?.name || 'Tasks'}</span>
                </button>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Comments / Stream (8 cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 sm:p-7 shadow-xs flex flex-col min-h-[580px]">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageCircle className="size-5 text-blue-600" />
                            <span>Discussion ({comments.length})</span>
                        </h2>
                    </div>

                    {/* Comments Stream */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-7 rounded-full bg-[#fde3cf] text-[#b45309] flex items-center justify-center text-xs font-bold">
                                                {(comment.user?.name || 'U')[0]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {comment.user?.name || 'Team Member'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400">
                                            {comment.createdAt
                                                ? format(new Date(comment.createdAt), 'dd MMM yyyy, HH:mm')
                                                : 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400">
                                <MessageCircle className="size-8 stroke-1 mb-2" />
                                <p className="text-xs font-semibold">No comments yet.</p>
                                <p className="text-[11px]">Leave an update below to start the conversation.</p>
                            </div>
                        )}
                    </div>

                    {/* Add Comment Input */}
                    <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                        <div className="space-y-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write an update, note, or comment..."
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 text-xs sm:text-[13px] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                rows={3}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPosting || !newComment.trim()}
                                    className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-40"
                                >
                                    <Send className="size-3.5" />
                                    <span>{isPosting ? 'Posting...' : 'Post Comment'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right: Task Details & Project Info (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Task Info Card */}
                    <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 shadow-xs space-y-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {task.status?.replace('_', ' ')}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                    {task.type}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                    <Flag className="size-3" />
                                    <span>{task.priority}</span>
                                </span>
                            </div>

                            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                {task.title}
                            </h1>
                        </div>

                        {task.description && (
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Description
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                            <div className="flex items-center justify-between text-slate-500">
                                <span>Assignee</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {task.assignee?.name || 'Unassigned'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-500">
                                <span>Due Date</span>
                                <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                                    <Calendar className="size-3.5 text-slate-400" />
                                    {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy') : 'No deadline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Associated Project Card */}
                    {project && (
                        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 shadow-xs space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Associated Project
                            </p>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="size-4 text-blue-600" />
                                <span>{project.name}</span>
                            </h3>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                                <span>Status: {project.status?.replace('_', ' ')}</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {project.progress || 0}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
