import { create } from "zustand";

export type DateFilterType = "Today" | "Last 7 Days" | "Last 15 Days" | "Last 30 Days";
export type SourceFilterType = "All" | "Twitter/X" | "News/Media" | "Reddit" | "Google Trends" | "YouTube";

interface AppState {
  // Theme state
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Global filters
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  sourceFilter: SourceFilterType;
  setSourceFilter: (filter: SourceFilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // Theme state (default to dark as requested)
  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    set({ theme });
  },

  // Sidebar state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Global filters
  dateFilter: "Last 7 Days",
  setDateFilter: (dateFilter) => set({ dateFilter }),
  sourceFilter: "All",
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
