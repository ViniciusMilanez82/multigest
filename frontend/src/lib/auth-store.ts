import { create } from "zustand";
import api from "./api";

interface Company {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companies: Company[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  activeCompany: Company | null;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveCompany: (company: Company) => void;
  loadFromStorage: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  activeCompany: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { accessToken, user } = data;

      localStorage.setItem("multigest_token", accessToken);
      localStorage.setItem("multigest_user", JSON.stringify(user));

      const defaultCompany = user.companies[0] || null;
      if (defaultCompany) {
        localStorage.setItem("multigest_company_id", defaultCompany.id);
      }

      set({
        token: accessToken,
        user,
        activeCompany: defaultCompany,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("multigest_token");
    localStorage.removeItem("multigest_user");
    localStorage.removeItem("multigest_company_id");
    set({ user: null, token: null, activeCompany: null });
  },

  setActiveCompany: (company: Company) => {
    localStorage.setItem("multigest_company_id", company.id);
    set({ activeCompany: company });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("multigest_token");
    const userStr = localStorage.getItem("multigest_user");
    const companyId = localStorage.getItem("multigest_company_id");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      const activeCompany =
        user.companies?.find((c: Company) => c.id === companyId) ||
        user.companies?.[0] ||
        null;
      set({ token, user, activeCompany });
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data) {
        localStorage.setItem("multigest_user", JSON.stringify(data));
        set({ user: data });
      }
    } catch {
      get().logout();
    }
  },
}));
