/**
 * Centralized API client service using native Fetch API.
 * Configured with configurable base URL and Bearer token attachment.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const AUTH_TOKEN_KEY = "pm_auth_token";

// In-memory token fallback
let inMemoryToken = null;

export const setAuthToken = (token) => {
    inMemoryToken = token;
    try {
        if (typeof sessionStorage !== "undefined") {
            if (token) {
                sessionStorage.setItem(AUTH_TOKEN_KEY, token);
            } else {
                sessionStorage.removeItem(AUTH_TOKEN_KEY);
            }
        }
    } catch (e) {
        console.warn("Unable to access sessionStorage:", e);
    }
};

export const getAuthToken = () => {
    if (inMemoryToken) return inMemoryToken;
    try {
        if (typeof sessionStorage !== "undefined") {
            return sessionStorage.getItem(AUTH_TOKEN_KEY);
        }
    } catch (e) {
        console.warn("Unable to read sessionStorage:", e);
    }
    return null;
};

/**
 * Custom API Error class with status code and error details.
 */
export class ApiError extends Error {
    constructor(message, status = 500, errors = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Core request wrapper
 */
export const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            const message = data?.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new ApiError(message, response.status, data?.errors || null);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network or fetch failure
        throw new ApiError(error.message || "Network request failed. Is the backend server running?", 0);
    }
};

export const api = {
    get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
    post: (endpoint, body, options) =>
        request(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
    patch: (endpoint, body, options) =>
        request(endpoint, { method: "PATCH", body: JSON.stringify(body), ...options }),
    delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};

export default api;
