import { useState } from 'react'
import { Plus, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardMetrics from '../components/DashboardMetrics'
import AnalyticsSummary from '../components/AnalyticsSummary'
import DashboardReminders from '../components/DashboardReminders'
import ProjectsList from '../components/ProjectsList'
import TeamCollaboration from '../components/TeamCollaboration'
import ProjectProgressGauge from '../components/ProjectProgressGauge'
import TimeTracker from '../components/TimeTracker'
import CreateProjectDialog from '../components/CreateProjectDialog'

const Dashboard = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Everything your team is shipping, in one calm place.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(true)}
                        className="px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="size-4" strokeWidth={2.5} />
                        <span>Add Project</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => toast('Import tool: CSV, Jira, or Trello import coming soon', { icon: '📦' })}
                        className="px-5 py-2.5 rounded-full bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                    >
                        <UploadCloud className="size-4 text-slate-500 dark:text-slate-400" />
                        <span>Import Data</span>
                    </button>
                </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <DashboardMetrics />

            {/* Middle Row (Analytics Pill Chart, Reminders, Project List) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-5 min-h-[320px]">
                    <AnalyticsSummary />
                </div>
                <div className="lg:col-span-3 min-h-[320px]">
                    <DashboardReminders />
                </div>
                <div className="lg:col-span-4 min-h-[320px]">
                    <ProjectsList />
                </div>
            </div>

            {/* Bottom Row (Team Collaboration, Project Progress Gauge, Time Tracker) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                <div className="lg:col-span-5 min-h-[300px]">
                    <TeamCollaboration />
                </div>
                <div className="lg:col-span-4 min-h-[300px]">
                    <ProjectProgressGauge />
                </div>
                <div className="lg:col-span-3 min-h-[300px]">
                    <TimeTracker />
                </div>
            </div>

            <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
        </div>
    )
}

export default Dashboard
