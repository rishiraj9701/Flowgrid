import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [dispatch])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#f0f2f5] dark:bg-[#0b0f17]">
                <Loader2Icon className="size-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-[#eff1f5] dark:bg-[#0b0f18] text-slate-900 dark:text-slate-100 antialiased overflow-hidden p-2 sm:p-3 lg:p-3.5 gap-3 sm:gap-3.5 select-text">
            {/* Floating Sidebar Card */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
                {/* Top Navigation Header */}
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                {/* Main Scrollable Canvas */}
                <main className="flex-1 overflow-y-auto px-2 sm:px-6 py-2 pb-10">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
