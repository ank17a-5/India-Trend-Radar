import { create } from "zustand";

export type DateFilterType = "Today" | "7D" | "30D";
export type SourceFilterType = "All" | "Twitter/X" | "News/Media" | "Reddit" | "Google Trends";

interface User {
  name: string;
  email: string;
  avatar: string;
}

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

  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
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
  dateFilter: "7D",
  setDateFilter: (dateFilter) => set({ dateFilter }),
  sourceFilter: "All",
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Auth state
  isAuthenticated: false,
  user: null,
  loginWithGoogle: async () => {
    // Simulate API delay for premium Google sign-in feeling
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({
      isAuthenticated: true,
      user: {
        name: "Dev Dipti",
        email: "dipti@indiatrendradar.ai",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
      },
    });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
