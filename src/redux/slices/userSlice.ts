import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

// Load users from localStorage on app start
const loadUsersFromStorage = (): User[] => {
  try {
    const usersStr = localStorage.getItem("app_users");
    return usersStr ? JSON.parse(usersStr) : [];
  } catch {
    return [];
  }
};

const initialState: UserState = {
  users: loadUsersFromStorage(),
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
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

    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      state.error = null;
      localStorage.setItem("app_users", JSON.stringify(state.users));
    },

    updateUser: (state, action: PayloadAction<User>) => {
      const idx = state.users.findIndex((u) => u.id === action.payload.id);
      if (idx >= 0) {
        state.users[idx] = { ...state.users[idx], ...action.payload };
      }
      state.error = null;
      localStorage.setItem("app_users", JSON.stringify(state.users));
    },

    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.error = null;
      localStorage.setItem("app_users", JSON.stringify(state.users));
    },

    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.error = null;
      localStorage.setItem("app_users", JSON.stringify(state.users));
    },
  },
});

export const {
  addUser,
  updateUser,
  removeUser,
  setUsers,
  setLoading,
  setError
} = userSlice.actions;
export default userSlice.reducer;
