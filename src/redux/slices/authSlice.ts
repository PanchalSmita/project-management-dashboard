import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Load user from localStorage on app start
const loadUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      // Persist user to localStorage
      localStorage.setItem("auth_user", JSON.stringify(action.payload));
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      
      // Clear user from localStorage
      localStorage.removeItem("auth_user");
      localStorage.removeItem("remember_me");
      localStorage.removeItem("remembered_email");
    },
    
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (state.user) {
        localStorage.setItem("auth_user", JSON.stringify(state.user));
      }
    },
  },
});

export const { login, logout, updateUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;