import { useState } from 'react'
import {
    BookOpen,
    CheckSquare,
    Users,
    CreditCard,
    Plus,
    Minus,
    MessageCircle,
    ExternalLink,
    FileText,
    Activity,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Help() {
    const [openFaq, setOpenFaq] = useState(null)

    const topics = [
        { icon: BookOpen, title: 'Getting started', count: '2 articles' },
        { icon: CheckSquare, title: 'Projects & tasks', count: '2 articles' },
        { icon: Users, title: 'Team', count: '2 articles' },
        { icon: CreditCard, title: 'Billing & plans', count: '2 articles' },
    ]

    const faqs = [
        {
            q: 'How do I create my first project?',
            a: 'Click the "+ Add Project" button on the Dashboard or Projects page. Enter a project title, optional description, timeline and priority, then click Create.',
        },
        {
            q: 'Can I import projects from a spreadsheet?',
            a: 'Yes, click "Import Data" in the top dashboard toolbar. We support CSV, Jira JSON exports, and Trello boards.',
        },
        {
            q: 'How do I move a task to another stage?',
            a: 'On the Tasks board, click the three-dots menu (...) on any task card and select your target stage (To do, In progress, In review, or Done).',
        },
        {
            q: 'What does the progress gauge measure?',
            a: 'The progress gauge displays the proportion of completed projects against active initiatives across the current workspace.',
        },
        {
            q: 'How do I invite a teammate?',
            a: 'Navigate to the Team page and click "+ Invite member". Enter their email address and assign an initial access role.',
        },
        {
            q: 'Who can see my time tracker?',
            a: 'Your time tracker is personal during live tracking. Logged hours are aggregated into project analytics for workspace visibility.',
        },
        {
            q: 'Is there a free plan?',
            a: 'Flowgrid offers a full-featured free tier for teams up to 5 members with unlimited tasks and projects.',
        },
        {
            q: 'How do I change my accent colour?',
            a: 'Go to Settings > Appearance to toggle between Dark Mode and Light Mode with tailored Flowgrid indigo and blue hues.',
        },
    ]

    const resources = [
        { icon: FileText, title: 'API & Developer Docs', desc: 'REST endpoints and webhook guides' },
        { icon: Activity, title: 'System Status', desc: 'All Flowgrid systems operational' },
        { icon: BookOpen, title: 'Interactive Tutorials', desc: '5-minute guided video walkthroughs' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Help center
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Answers, resources, and a human when you need one.
                </p>
            </div>

            {/* Hero Banner with Wavy Contour Pattern */}
            <div className="flowgrid-contour-bg rounded-[28px] p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-lg">
                <div className="relative z-10 max-w-2xl mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                        How can we help?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        Type in the search bar above, or pick a topic.
                    </p>
                </div>

                {/* 4 Topic Cards inside Hero Banner */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {topics.map((t, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all cursor-pointer group"
                        >
                            <t.icon className="size-5 text-blue-300 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="text-xs sm:text-sm font-bold text-white">
                                {t.title}
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                                {t.count}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2-Column FAQs and Support Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Frequently Asked Accordion */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-7 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                        Frequently asked
                    </h3>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx
                            return (
                                <div key={idx} className="py-3.5">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        className="w-full flex items-center justify-between text-left text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer"
                                    >
                                        <span>{faq.q}</span>
                                        <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors shrink-0 ml-2">
                                            {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed pr-6">
                                            {faq.a}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: Support & Resources */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Still Stuck? Card */}
                    <div className="flowgrid-contour-bg rounded-[28px] p-6 text-white border border-slate-800 shadow-md">
                        <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-blue-300">
                            <MessageCircle className="size-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">
                            Still stuck?
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            Our team answers in under 10 minutes, Monday to Friday.
                        </p>

                        <div className="flex items-center gap-2 mt-5">
                            <button
                                type="button"
                                onClick={() => toast.success('Live chat connected with Flowgrid support!')}
                                className="flex-1 py-2.5 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs text-center transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                            >
                                Start a chat
                            </button>
                            <button
                                type="button"
                                onClick={() => toast.success('Support ticket email sent to support@flowgrid.app')}
                                className="flex-1 py-2.5 px-4 rounded-full border border-white/20 hover:bg-white/10 text-white font-semibold text-xs text-center transition-all cursor-pointer active:scale-[0.98]"
                            >
                                Email us
                            </button>
                        </div>
                    </div>

                    {/* Quick Resources */}
                    <div className="bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 shadow-xs">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                            Quick resources
                        </h3>

                        <div className="space-y-3.5">
                            {resources.map((res, i) => (
                                <div
                                    key={i}
                                    onClick={() => toast(`Opening ${res.title}...`, { icon: '📄' })}
                                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <res.icon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {res.title}
                                            </p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                                                {res.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <ExternalLink className="size-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0 ml-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
