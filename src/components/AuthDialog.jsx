import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock, Mail, User, Loader2, Sparkles } from "lucide-react";
import { loginUser, registerUser, clearAuthError, enableDemoMode } from "../features/authSlice";
import { fetchWorkspacesAsync } from "../features/workspaceSlice";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AuthDialog = ({ isOpen, onClose, initialTab = "login" }) => {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 sm:p-7">
        <DialogHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Lock className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {tab === "login" ? "Sign In to Flowgrid" : "Create Account"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {tab === "login"
                  ? "Enter your credentials to access your workspace"
                  : "Get started with your free Flowgrid account"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Toggle */}
        <Tabs
          value={tab}
          onValueChange={(val) => {
            setTab(val);
            setValidationError("");
            dispatch(clearAuthError());
          }}
          className="w-full mt-1"
        >
          <TabsList className="grid w-full grid-cols-2 p-1">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Error Banner */}
        {(validationError || error) && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-xs text-red-600 dark:text-rose-400">
            {validationError || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="auth-name">Full Name</Label>
              <div className="relative">
                <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Smith"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email Address</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password">
              Password {tab === "register" && "(min 8 chars)"}
            </Label>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2"
            size="default"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : tab === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Demo Mode Fallback */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-[#0c0e17] px-2 text-zinc-400">
              Or explore first
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleContinueDemo}
          className="w-full"
        >
          <Sparkles className="size-3.5 text-amber-500" />
          Try Demo Mode (Sample Data)
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
