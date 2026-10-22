import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import WorkspaceSettingsDialog from './WorkspaceSettingsDialog'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ];

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <>
            <div
                ref={sidebarRef}
                className={`z-20 bg-white dark:bg-zinc-900 min-w-64 max-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:fixed top-0 transition-all duration-200 ${
                    isSidebarOpen ? 'left-0 shadow-2xl' : '-left-full sm:left-0'
                }`}
            >
                <WorkspaceDropdown />
                <hr className="border-gray-200 dark:border-zinc-800" />
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    <div>
                        <div className="p-3 space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    to={item.href}
                                    key={item.name}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 py-2 px-3 text-sm font-medium rounded-lg transition ${
                                            isActive
                                                ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold'
                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                                        }`
                                    }
                                >
                                    <item.icon size={16} />
                                    <p className="truncate">{item.name}</p>
                                </NavLink>
                            ))}
                            <button
                                type="button"
                                onClick={() => setIsSettingsOpen(true)}
                                className="flex w-full items-center gap-3 py-2 px-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition"
                            >
                                <SettingsIcon size={16} />
                                <p className="truncate">Workspace Settings</p>
                            </button>
                        </div>
                        <MyTasksSidebar />
                        <ProjectSidebar />
                    </div>
                </div>
            </div>

            <WorkspaceSettingsDialog
                isDialogOpen={isSettingsOpen}
                setIsDialogOpen={setIsSettingsOpen}
            />
        </>
    );
};

export default Sidebar;
