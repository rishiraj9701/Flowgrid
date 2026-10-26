import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "dark",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const theme = state.theme === "light" ? "dark" : "light";
            localStorage.setItem("theme", theme);
            if (theme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            state.theme = theme;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            if (action.payload === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        },
        loadTheme: (state) => {
            const theme = localStorage.getItem("theme");
            if (theme) {
                state.theme = theme;
                if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            } else {
                state.theme = "dark";
                document.documentElement.classList.add("dark");
            }
        },
    },
});

export const { toggleTheme, setTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;