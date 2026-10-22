import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dummyWorkspaces } from "../assets/assets.js";
import api from "../services/api.js";

const STORAGE_KEY_WORKSPACES = "pm_workspaces_data";
const STORAGE_KEY_CURRENT = "pm_current_workspace_id";

// Safe loader from localStorage with fallback to dummyWorkspaces
const loadInitialWorkspaces = () => {
    try {
        if (typeof localStorage !== "undefined") {
            const saved = localStorage.getItem(STORAGE_KEY_WORKSPACES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        }
    } catch (e) {
        console.error("Failed to load workspaces from localStorage:", e);
    }
    return dummyWorkspaces || [];
};

const loadInitialCurrentWorkspace = (workspaces) => {
    try {
        if (typeof localStorage !== "undefined") {
            const savedId = localStorage.getItem(STORAGE_KEY_CURRENT);
            if (savedId) {
                const found = workspaces.find((w) => w.id === savedId);
                if (found) return found;
            }
        }
    } catch (e) {
        console.error("Failed to load current workspace from localStorage:", e);
    }
    return workspaces[0] || null;
};

// Persistence helper for offline demo mode
const persistWorkspaceState = (state) => {
    try {
        if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("pm_demo_mode") !== "true") {
            // Not in demo mode, NEVER write authenticated server workspaces into demo localStorage
            return;
        }
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(state.workspaces));
            if (state.currentWorkspace?.id) {
                localStorage.setItem(STORAGE_KEY_CURRENT, state.currentWorkspace.id);
            }
        }
    } catch (e) {
        console.error("Failed to persist workspace state to localStorage:", e);
    }
};

const isDemoModeActive = () => {
    try {
        if (typeof sessionStorage !== "undefined") {
            return sessionStorage.getItem("pm_demo_mode") === "true";
        }
    } catch {
        return false;
    }
    return false;
};

const initialDemo = isDemoModeActive();
const initialWorkspaces = initialDemo ? loadInitialWorkspaces() : [];
const initialCurrentWorkspace = initialDemo ? loadInitialCurrentWorkspace(initialWorkspaces) : null;

const initialState = {
    workspaces: initialWorkspaces,
    currentWorkspace: initialCurrentWorkspace,
    loading: false,
    hasFetched: initialDemo,
    error: null,
};

// ==========================================
// Smart Asynchronous Thunks (Demo + Connected API)
// ==========================================

export const fetchWorkspacesAsync = createAsyncThunk(
    "workspace/fetchWorkspacesAsync",
    async (_, { getState, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            return null; // Keep local storage demo workspaces
        }
        try {
            const res = await api.get("/workspaces");
            // If user has workspaces, load full details of the first one
            const workspaces = res.data || [];
            if (workspaces.length > 0) {
                const fullFirst = await api.get(`/workspaces/${workspaces[0].id}`);
                workspaces[0] = fullFirst.data;
            }
            return workspaces;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch workspaces from server");
        }
    }
);

export const selectWorkspaceAsync = createAsyncThunk(
    "workspace/selectWorkspaceAsync",
    async (workspaceId, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        dispatch(setCurrentWorkspace(workspaceId));
        if (auth.isDemoMode || !auth.token) {
            return workspaceId;
        }
        try {
            const res = await api.get(`/workspaces/${workspaceId}`);
            dispatch(updateWorkspace(res.data));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to load workspace details");
        }
    }
);

export const createWorkspaceAsync = createAsyncThunk(
    "workspace/createWorkspaceAsync",
    async (workspaceData, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(addWorkspace(workspaceData));
            return workspaceData;
        }
        try {
            const res = await api.post("/workspaces", workspaceData);
            const fullWorkspace = {
                ...res.data,
                projects: [],
                members: [{ role: "OWNER", user: auth.user }],
            };
            dispatch(addWorkspace(fullWorkspace));
            return fullWorkspace;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create workspace on server");
        }
    }
);

export const updateWorkspaceAsync = createAsyncThunk(
    "workspace/updateWorkspaceAsync",
    async (workspaceData, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(updateWorkspace(workspaceData));
            return workspaceData;
        }
        try {
            const res = await api.patch(`/workspaces/${workspaceData.id}`, workspaceData);
            dispatch(updateWorkspace(res.data));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update workspace on server");
        }
    }
);

export const createProjectAsync = createAsyncThunk(
    "workspace/createProjectAsync",
    async (projectData, { getState, dispatch, rejectWithValue }) => {
        const { auth, workspace } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(addProject(projectData));
            return projectData;
        }
        try {
            const currentWsId = workspace.currentWorkspace?.id;
            const res = await api.post(`/workspaces/${currentWsId}/projects`, projectData);
            const created = {
                ...res.data,
                tasks: [],
            };
            dispatch(addProject(created));
            return created;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create project on server");
        }
    }
);

export const updateProjectAsync = createAsyncThunk(
    "workspace/updateProjectAsync",
    async (projectData, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(updateProject(projectData));
            return projectData;
        }
        try {
            const res = await api.patch(`/projects/${projectData.id}`, projectData);
            dispatch(updateProject(res.data));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update project on server");
        }
    }
);

export const deleteProjectAsync = createAsyncThunk(
    "workspace/deleteProjectAsync",
    async (projectId, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(deleteProject(projectId));
            return projectId;
        }
        try {
            await api.delete(`/projects/${projectId}`);
            dispatch(deleteProject(projectId));
            return projectId;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete project on server");
        }
    }
);

export const createTaskAsync = createAsyncThunk(
    "workspace/createTaskAsync",
    async (taskData, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(addTask(taskData));
            return taskData;
        }
        try {
            const res = await api.post(`/projects/${taskData.projectId}/tasks`, taskData);
            const created = {
                ...res.data,
                comments: [],
            };
            dispatch(addTask(created));
            return created;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to create task on server");
        }
    }
);

export const updateTaskAsync = createAsyncThunk(
    "workspace/updateTaskAsync",
    async (taskData, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(updateTask(taskData));
            return taskData;
        }
        try {
            const res = await api.patch(`/tasks/${taskData.id}`, taskData);
            dispatch(updateTask({ ...taskData, ...res.data }));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to update task on server");
        }
    }
);

export const deleteTaskAsync = createAsyncThunk(
    "workspace/deleteTaskAsync",
    async (taskIds, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(deleteTask(taskIds));
            return taskIds;
        }
        try {
            const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
            if (ids.length === 1) {
                await api.delete(`/tasks/${ids[0]}`);
            } else {
                await api.post("/tasks/batch-delete", { taskIds: ids });
            }
            dispatch(deleteTask(ids));
            return ids;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to delete task on server");
        }
    }
);

export const addCommentAsync = createAsyncThunk(
    "workspace/addCommentAsync",
    async ({ projectId, taskId, comment }, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(addComment({ projectId, taskId, comment }));
            return comment;
        }
        try {
            const res = await api.post(`/tasks/${taskId}/comments`, { content: comment.content });
            const newComment = {
                ...res.data,
                author: auth.user?.name || "You",
            };
            dispatch(addComment({ projectId, taskId, comment: newComment }));
            return newComment;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to post comment to server");
        }
    }
);

export const addWorkspaceMemberAsync = createAsyncThunk(
    "workspace/addWorkspaceMemberAsync",
    async (memberData, { getState, dispatch, rejectWithValue }) => {
        const { auth, workspace } = getState();
        if (auth.isDemoMode || !auth.token) {
            dispatch(addWorkspaceMember(memberData));
            return memberData;
        }
        try {
            const currentWsId = workspace.currentWorkspace?.id;
            const res = await api.post(`/workspaces/${currentWsId}/members`, {
                email: memberData.user?.email || memberData.email,
                role: memberData.role || "MEMBER",
            });
            dispatch(addWorkspaceMember(res.data));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to add member on server");
        }
    }
);

export const addProjectMemberAsync = createAsyncThunk(
    "workspace/addProjectMemberAsync",
    async ({ projectId, userId, memberObj }, { getState, dispatch, rejectWithValue }) => {
        const { auth } = getState();
        if (auth.isDemoMode || !auth.token) {
            const newProjMember = {
                id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                userId: memberObj?.user?.id || userId,
                projectId,
                user: memberObj?.user || memberObj,
            };
            dispatch(addProjectMember({ projectId, member: newProjMember }));
            return newProjMember;
        }
        try {
            const res = await api.post(`/projects/${projectId}/members`, { userId });
            dispatch(addProjectMember({ projectId, member: res.data }));
            return res.data;
        } catch (error) {
            return rejectWithValue(error.message || "Failed to add member to project on server");
        }
    }
);


// ==========================================
// Slice Reducers
// ==========================================

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action) => {
            state.workspaces = action.payload;
            if (!state.workspaces.some((w) => w.id === state.currentWorkspace?.id)) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
            persistWorkspaceState(state);
        },

        setCurrentWorkspace: (state, action) => {
            const found = state.workspaces.find((w) => w.id === action.payload);
            if (found) {
                state.currentWorkspace = found;
                if (typeof localStorage !== "undefined") {
                    localStorage.setItem(STORAGE_KEY_CURRENT, action.payload);
                }
            }
        },

        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            state.currentWorkspace = action.payload;
            persistWorkspaceState(state);
        },

        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? { ...w, ...action.payload } : w
            );
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = { ...state.currentWorkspace, ...action.payload };
            }
            persistWorkspaceState(state);
        },

        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter((w) => (w.id || w._id) !== action.payload);
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
            persistWorkspaceState(state);
        },

        addProject: (state, action) => {
            if (!state.currentWorkspace) return;
            if (!state.currentWorkspace.projects) {
                state.currentWorkspace.projects = [];
            }
            state.currentWorkspace.projects.push(action.payload);

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? { ...w, projects: [...(w.projects || []), action.payload] }
                    : w
            );
            persistWorkspaceState(state);
        },

        updateProject: (state, action) => {
            if (!state.currentWorkspace) return;
            const updated = action.payload;
            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) =>
                p.id === updated.id ? { ...p, ...updated } : p
            );

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) =>
                              p.id === updated.id ? { ...p, ...updated } : p
                          ),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        deleteProject: (state, action) => {
            if (!state.currentWorkspace) return;
            const projectId = action.payload;
            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).filter(
                (p) => p.id !== projectId
            );

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).filter((p) => p.id !== projectId),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        addTask: (state, action) => {
            if (!state.currentWorkspace) return;
            const task = action.payload;

            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) => {
                if (p.id === task.projectId) {
                    const tasks = p.tasks || [];
                    return { ...p, tasks: [...tasks, task] };
                }
                return p;
            });

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) =>
                              p.id === task.projectId
                                  ? { ...p, tasks: [...(p.tasks || []), task] }
                                  : p
                          ),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        updateTask: (state, action) => {
            if (!state.currentWorkspace) return;
            const updatedTask = action.payload;

            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) => {
                if (p.id === updatedTask.projectId) {
                    return {
                        ...p,
                        tasks: (p.tasks || []).map((t) =>
                            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
                        ),
                    };
                }
                return p;
            });

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) =>
                              p.id === updatedTask.projectId
                                  ? {
                                        ...p,
                                        tasks: (p.tasks || []).map((t) =>
                                            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
                                        ),
                                    }
                                  : p
                          ),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        deleteTask: (state, action) => {
            if (!state.currentWorkspace) return;
            const taskIds = Array.isArray(action.payload) ? action.payload : [action.payload];

            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) => ({
                ...p,
                tasks: (p.tasks || []).filter((t) => !taskIds.includes(t.id)),
            }));

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) => ({
                              ...p,
                              tasks: (p.tasks || []).filter((t) => !taskIds.includes(t.id)),
                          })),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        addComment: (state, action) => {
            if (!state.currentWorkspace) return;
            const { projectId, taskId, comment } = action.payload;

            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        tasks: (p.tasks || []).map((t) => {
                            if (t.id === taskId) {
                                return {
                                    ...t,
                                    comments: [...(t.comments || []), comment],
                                };
                            }
                            return t;
                        }),
                    };
                }
                return p;
            });

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) => {
                              if (p.id === projectId) {
                                  return {
                                      ...p,
                                      tasks: (p.tasks || []).map((t) => {
                                          if (t.id === taskId) {
                                              return {
                                                  ...t,
                                                  comments: [...(t.comments || []), comment],
                                              };
                                          }
                                          return t;
                                      }),
                                  };
                              }
                              return p;
                          }),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        addWorkspaceMember: (state, action) => {
            if (!state.currentWorkspace) return;
            const newMember = action.payload;

            const updatedMembers = [...(state.currentWorkspace.members || []), newMember];
            state.currentWorkspace.members = updatedMembers;

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? { ...w, members: updatedMembers }
                    : w
            );
            persistWorkspaceState(state);
        },

        addProjectMember: (state, action) => {
            if (!state.currentWorkspace) return;
            const { projectId, member } = action.payload;

            state.currentWorkspace.projects = (state.currentWorkspace.projects || []).map((p) => {
                if (p.id === projectId) {
                    return {
                        ...p,
                        members: [...(p.members || []), member],
                    };
                }
                return p;
            });

            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                          ...w,
                          projects: (w.projects || []).map((p) =>
                              p.id === projectId
                                  ? { ...p, members: [...(p.members || []), member] }
                                  : p
                          ),
                      }
                    : w
            );
            persistWorkspaceState(state);
        },

        resetToDefaultData: (state) => {
            if (typeof localStorage !== "undefined") {
                localStorage.removeItem(STORAGE_KEY_WORKSPACES);
                localStorage.removeItem(STORAGE_KEY_CURRENT);
            }
            state.workspaces = dummyWorkspaces;
            state.currentWorkspace = dummyWorkspaces[0] || null;
            persistWorkspaceState(state);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspacesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkspacesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.hasFetched = true;
                if (Array.isArray(action.payload)) {
                    state.workspaces = action.payload;
                    state.currentWorkspace = action.payload[0] || null;
                }
            })
            .addCase(fetchWorkspacesAsync.rejected, (state, action) => {
                state.loading = false;
                state.hasFetched = true;
                state.error = action.payload;
            })
            .addCase("auth/enableDemoMode", (state) => {
                const demoWs = loadInitialWorkspaces();
                state.workspaces = demoWs;
                state.currentWorkspace = loadInitialCurrentWorkspace(demoWs);
                state.hasFetched = true;
            })
            .addCase("auth/exitDemoMode", (state) => {
                state.workspaces = [];
                state.currentWorkspace = null;
                state.hasFetched = false;
            })
            .addCase("auth/logout/fulfilled", (state) => {
                state.workspaces = [];
                state.currentWorkspace = null;
                state.hasFetched = false;
            });
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    addWorkspaceMember,
    addProjectMember,
    resetToDefaultData,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;