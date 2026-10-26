import { Video } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DashboardReminders() {
    const [meetingStarted, setMeetingStarted] = useState(false)

    return (
        <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[26px] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reminders
                </h3>

                <div className="mt-5 space-y-1.5">
                    <h4 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300 tracking-tight leading-snug">
                        Nexus Analytics Sprint Review
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                        Time : 02.00 pm – 04.00 pm
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="button"
                    onClick={() => {
                        setMeetingStarted(true)
                        toast.success('Connecting to Flowgrid Meeting Room...')
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                    <Video className="size-4.5" />
                    <span>{meetingStarted ? 'In Meeting Room' : 'Start Meeting'}</span>
                </button>
            </div>
        </div>
    )
}
