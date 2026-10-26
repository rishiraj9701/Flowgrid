import { useState } from 'react'
import { User, Bell, Palette, Check } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import toast from 'react-hot-toast'

export default function Settings() {
    const dispatch = useDispatch()
    const { theme } = useSelector((state) => state.theme)
    const authUser = useSelector((state) => state.auth?.user)
    const isDemoMode = useSelector((state) => state.auth?.isDemoMode)

    const [activeTab, setActiveTab] = useState('profile')
    const [formData, setFormData] = useState({
        fullName: authUser?.name || (isDemoMode ? 'Rishi Raj' : 'Rishi Raj'),
        email: authUser?.email || (isDemoMode ? 'rishi.raj@flowgrid.app' : 'rishi.raj@flowgrid.app'),
        role: 'Project Lead',
        timeZone: 'GMT+5:30 · New Delhi',
        bio: 'Shipping calm software with a kind team.',
        emailDigest: true,
        pushNotifications: true,
        taskAssignedAlerts: true,
    })

    const initials = formData.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const handleSave = (e) => {
        if (e) e.preventDefault()
        toast.success('Settings saved successfully!')
    }

    const handleDiscard = () => {
        setFormData({
            fullName: authUser?.name || 'Rishi Raj',
            email: authUser?.email || 'rishi.raj@flowgrid.app',
            role: 'Project Lead',
            timeZone: 'GMT+5:30 · New Delhi',
            bio: 'Shipping calm software with a kind team.',
            emailDigest: true,
            pushNotifications: true,
            taskAssignedAlerts: true,
        })
        toast('Changes discarded')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Your profile, notifications and how Flowgrid looks.
                </p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Navigation Tabs */}
                <div className="lg:col-span-3 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-3 shadow-xs space-y-1">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'appearance', label: 'Appearance', icon: Palette },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-[13px] font-semibold transition-all text-left ${
                                    isActive
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                            >
                                <tab.icon className="size-4.5" strokeWidth={2} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Right Form Container */}
                <div className="lg:col-span-9 bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 sm:p-8 shadow-xs">
                    {/* Tab 1: Profile */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Profile Info Header */}
                            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="size-16 rounded-full bg-[#fde3cf] dark:bg-amber-950/60 text-[#b45309] dark:text-amber-300 flex items-center justify-center text-lg font-bold shadow-sm">
                                    {initials}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Profile
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        This is how teammates see you across the workspace.
                                    </p>
                                </div>
                            </div>

                            {/* Inputs Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Full name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-100/90 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-[13px] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/25 outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-100/90 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-[13px] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/25 outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-100/90 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-[13px] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/25 outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Time zone
                                    </label>
                                    <select
                                        value={formData.timeZone}
                                        onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-100/90 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-[13px] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/25 outline-none font-medium cursor-pointer"
                                    >
                                        <option value="GMT+7 · Jakarta">GMT+7 · Jakarta</option>
                                        <option value="GMT+5:30 · New Delhi">GMT+5:30 · New Delhi</option>
                                        <option value="GMT-4 · New York (EST)">GMT-4 · New York (EST)</option>
                                        <option value="GMT-7 · San Francisco (PST)">GMT-7 · San Francisco (PST)</option>
                                        <option value="GMT+0 · London (UTC)">GMT+0 · London (UTC)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Bio
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-100/90 dark:bg-slate-800/80 border-none rounded-2xl text-xs sm:text-[13px] text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/25 outline-none font-medium resize-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Notifications Preferences
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Configure how and when Flowgrid notifies you of activity.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'Email Digest', desc: 'Daily summary of projects and assigned tasks', key: 'emailDigest' },
                                    { title: 'Push Notifications', desc: 'Real-time alerts for mentions and urgent deadlines', key: 'pushNotifications' },
                                    { title: 'Task Assignments', desc: 'Immediate email when someone assigns you a task', key: 'taskAssignedAlerts' },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white">{item.title}</p>
                                            <p className="text-[11px] text-slate-400">{item.desc}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={formData[item.key]}
                                            onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                                            className="size-5 rounded-md accent-blue-600 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Appearance */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Appearance
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Customize theme and interface appearance.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => theme !== 'light' && dispatch(toggleTheme())}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        theme === 'light'
                                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="h-20 rounded-xl bg-white border border-slate-200 shadow-2xs p-2 flex flex-col justify-between mb-3">
                                        <div className="w-12 h-2 bg-slate-200 rounded" />
                                        <div className="w-full h-8 bg-slate-100 rounded" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</p>
                                </div>

                                <div
                                    onClick={() => theme !== 'dark' && dispatch(toggleTheme())}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                        theme === 'dark'
                                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="h-20 rounded-xl bg-[#0f172a] border border-slate-800 shadow-2xs p-2 flex flex-col justify-between mb-3">
                                        <div className="w-12 h-2 bg-slate-700 rounded" />
                                        <div className="w-full h-8 bg-slate-800 rounded" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
