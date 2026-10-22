import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { fetchCurrentUser } from "./features/authSlice";
import { fetchWorkspacesAsync } from "./features/workspaceSlice";

// Route-level code splitting
const Landing = lazy(() => import("./pages/Landing"));
const WorkspaceOnboarding = lazy(() => import("./pages/WorkspaceOnboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Team = lazy(() => import("./pages/Team"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const TaskDetails = lazy(() => import("./pages/TaskDetails"));

const PageLoading = () => (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="size-8 text-blue-500 animate-spin" />
    </div>
);

const App = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, isDemoMode, isInitialized, token } = useSelector((state) => state.auth);
    const { workspaces, hasFetched, loading: workspaceLoading } = useSelector((state) => state.workspace);

    useEffect(() => {
        if (token) {
            dispatch(fetchCurrentUser()).then((action) => {
                if (action?.type === "auth/fetchCurrentUser/fulfilled") {
                    dispatch(fetchWorkspacesAsync());
                }
            });
        }
    }, [dispatch, token]);

    // Initial session verification in progress
    if (!isInitialized) {
        return <PageLoading />;
    }

    // 1. Unauthenticated visitors -> Landing Page
    if (!isAuthenticated && !isDemoMode) {
        return (
            <>
                <Toaster position="top-right" />
                <Suspense fallback={<PageLoading />}>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </>
        );
    }

    // 2. Authenticated user with no workspaces yet -> Workspace Onboarding
    if (isAuthenticated && !isDemoMode) {
        if (!hasFetched && workspaceLoading) {
            return <PageLoading />;
        }
        if (workspaces.length === 0) {
            return (
                <>
                    <Toaster position="top-right" />
                    <Suspense fallback={<PageLoading />}>
                        <Routes>
                            <Route path="/" element={<WorkspaceOnboarding />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </>
            );
        }
    }

    // 3. Either Offline Demo Mode OR Authenticated user with >= 1 workspace
    return (
        <>
            <Toaster position="top-right" />
            <Suspense fallback={<PageLoading />}>
                <Routes>
                    <Route path="/workspaces" element={<WorkspaceOnboarding />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="team" element={<Team />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="projectsDetail" element={<ProjectDetails />} />
                        <Route path="taskDetails" element={<TaskDetails />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </>
    );
};

export default App;
