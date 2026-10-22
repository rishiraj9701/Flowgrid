import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken, getAuthToken } from "../services/api.js";

// Async thunks
export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const res = await api.post("/auth/register", { name, email, password });
            setAuthToken(res.data.token);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Registration failed");
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await api.post("/auth/login", { email, password });
            setAuthToken(res.data.token);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Login failed");
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",
    async (_, { rejectWithValue }) => {
        const token = getAuthToken();
        if (!token) {
            return rejectWithValue("No stored token");
        }
        try {
            const res = await api.get("/auth/me");
            return { user: res.data.user, token };
        } catch (error) {
            setAuthToken(null);
            return rejectWithValue(error.message || "Session expired");
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async () => {
        try {
            await api.post("/auth/logout").catch(() => {});
        } finally {
            setAuthToken(null);
        }
        return true;
    }
);

const DEMO_MODE_STORAGE_KEY = "pm_demo_mode";

const getInitialDemoMode = () => {
    try {
        if (typeof sessionStorage !== "undefined") {
            return sessionStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
        }
    } catch {
        return false;
    }
    return false;
};

const safeSetSessionDemoMode = (enabled) => {
    try {
        if (typeof sessionStorage !== "undefined") {
            if (enabled) {
                sessionStorage.setItem(DEMO_MODE_STORAGE_KEY, "true");
            } else {
                sessionStorage.removeItem(DEMO_MODE_STORAGE_KEY);
            }
        }
    } catch {
        // sessionStorage unavailable or restricted
    }
};

const initialToken = typeof sessionStorage !== "undefined" ? getAuthToken() : null;
const initialDemo = !initialToken && getInitialDemoMode();

const initialState = {
    user: null,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    isDemoMode: initialDemo,
    isInitialized: !initialToken, // if initialToken exists, wait for fetchCurrentUser to complete
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
        enableDemoMode: (state) => {
            state.isDemoMode = true;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            setAuthToken(null);
            safeSetSessionDemoMode(true);
        },
        exitDemoMode: (state) => {
            state.isDemoMode = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            setAuthToken(null);
            safeSetSessionDemoMode(false);
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.isDemoMode = false;
                state.isInitialized = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                safeSetSessionDemoMode(false);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.isDemoMode = false;
                state.isInitialized = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                safeSetSessionDemoMode(false);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.isAuthenticated = true;
                state.isDemoMode = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                safeSetSessionDemoMode(false);
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.isAuthenticated = false;
                state.isDemoMode = false;
                state.user = null;
                state.token = null;
                safeSetSessionDemoMode(false);
            })

            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isDemoMode = false;
                state.isInitialized = true;
                state.isLoading = false;
                state.error = null;
                safeSetSessionDemoMode(false);
            });
    },
});

export const { clearAuthError, enableDemoMode, exitDemoMode } = authSlice.actions;
export default authSlice.reducer;
