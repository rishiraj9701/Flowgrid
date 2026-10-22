import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Lock, Mail, User, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { loginUser, registerUser, clearAuthError, enableDemoMode } from "../features/authSlice";
import { fetchWorkspacesAsync } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const AuthDialog = ({ isOpen, onClose, initialTab = "login" }) => {
    const dispatch = useDispatch();
    const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    const [tab, setTab] = useState(initialTab); // "login" | "register"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTab(initialTab);
            setValidationError("");
            dispatch(clearAuthError());
        }
    }, [isOpen, initialTab, dispatch]);

    useEffect(() => {
        if (isAuthenticated && isOpen) {
            toast.success(`Welcome, ${user?.name || "User"}!`);
            dispatch(fetchWorkspacesAsync());
            onClose();
        }
    }, [isAuthenticated, isOpen, user, dispatch, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError("");
        dispatch(clearAuthError());

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            setValidationError("Email is required");
            return;
        }

        if (tab === "register") {
            if (!name.trim()) {
                setValidationError("Name is required");
                return;
            }
            if (password.length < 8) {
                setValidationError("Password must be at least 8 characters");
                return;
            }
            dispatch(registerUser({ name: name.trim(), email: trimmedEmail, password }));
        } else {
            if (!password) {
                setValidationError("Password is required");
                return;
            }
            dispatch(loginUser({ email: trimmedEmail, password }));
        }
    };

    const handleContinueDemo = () => {
        dispatch(enableDemoMode());
        toast.success("Switched to Offline Demo Mode");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                            <Lock className="size-4.5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                {tab === "login" ? "Sign In to Flowgrid" : "Create Account"}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {tab === "login"
                                    ? "Enter your credentials to access your projects"
                                    : "Get started with your free Flowgrid account"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl my-4">
                    <button
                        type="button"
                        onClick={() => {
                            setTab("login");
                            setValidationError("");
                            dispatch(clearAuthError());
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                            tab === "login"
                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTab("register");
                            setValidationError("");
                            dispatch(clearAuthError());
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                            tab === "register"
                                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {/* Error Banner */}
                {(validationError || error) && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400">
                        {validationError || error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {tab === "register" && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Alex Smith"
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Password {tab === "register" && "(min 8 chars)"}
                        </label>
                        <div className="relative">
                            <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : tab === "login" ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Demo Mode Fallback Divider */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">
                            Or explore first
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleContinueDemo}
                    className="w-full py-2 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition flex items-center justify-center gap-2"
                >
                    <Sparkles className="size-3.5 text-amber-500" />
                    Try Demo Mode (Sample Data)
                </button>
            </div>
        </div>
    );
};

export default AuthDialog;
