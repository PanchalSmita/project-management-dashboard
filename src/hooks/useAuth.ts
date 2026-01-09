import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { login, logout, updateUser as updateAuthUser, setLoading } from "../redux/slices/authSlice";
import { addUser, updateUser as updateTeamUser } from "../redux/slices/userSlice";
import { useNotifications } from "./useNotifications";
import type { User, Role } from "../types";

export interface LoginCredentials {
  email: string;
  password: string;
  role?: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export const useAuth = () => {
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();
  const { success, error: showError } = useNotifications();

  const loginUser = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch(setLoading(true));

      // Check if user exists in our persisted users list
      const existingUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

      let userToLogin: User;

      if (existingUser) {
        // Validate Password (Strict persistent check)
        if (existingUser.password && existingUser.password !== credentials.password) {
          throw new Error("Invalid password");
        }
        // Validate Role if provided
        if (credentials.role && existingUser.role !== credentials.role) {
          throw new Error("Role mismatch");
        }
        userToLogin = existingUser;
      } else {
        // Create new user if first time login (Simulated)
        userToLogin = {
          id: Date.now().toString(),
          name: credentials.email.split('@')[0], // Fallback name
          email: credentials.email,
          role: credentials.role || "USER", // Default to USER
          password: credentials.password, // Store the password they used
          createdAt: new Date().toISOString(),
        };
        // Add to team list so they appear in "Team Members"
        dispatch(addUser(userToLogin));
      }

      dispatch(login(userToLogin));
      success(`Welcome back, ${userToLogin.name}!`);
      return { success: true, user: userToLogin };
    } catch (err: any) {
      if (err.message === "Role mismatch") {
        showError(`Login failed: This account is registered as ${credentials.role === "ADMIN" ? "USER" : "ADMIN"}.`);
      } else {
        showError("Login failed. Please check your credentials.");
      }
      return { success: false, error: err.message || "Login failed" };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, showError, users]);

  const registerUser = useCallback(async (data: RegisterData) => {
    try {
      dispatch(setLoading(true));

      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role || "ADMIN",
        password: data.password, // Store password
        createdAt: new Date().toISOString(),
      };

      // Add to team list AND login
      dispatch(addUser(newUser));
      dispatch(login(newUser));

      success("Registration successful!");
      return { success: true, user: newUser };
    } catch (err) {
      showError("Registration failed. Please try again.");
      return { success: false, error: "Registration failed" };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, showError]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
    success("Logged out successfully!");
  }, [dispatch, success]);

  const updateUserProfile = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      dispatch(updateAuthUser(updatedUser));
      dispatch(updateTeamUser(updatedUser)); // Keep team list in sync
      success("Profile updated successfully!");
    }
  }, [user, dispatch, success]);

  const hasRole = useCallback((requiredRole: Role) => {
    if (!user) return false;
    const roleHierarchy = { ADMIN: 3, MANAGER: 2, USER: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    // Define permissions based on roles
    const permissions = {
      ADMIN: ["*"], // All permissions
      MANAGER: ["project.create", "project.update", "project.delete", "user.invite", "task.*"],
      USER: ["task.create", "task.update", "task.view"]
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes("*") || userPermissions.includes(permission) ||
      userPermissions.some(p => p.endsWith("*") && permission.startsWith(p.slice(0, -1)));
  }, [user]);

  const loginWithGoogle = useCallback(async (accessToken: string) => {
    try {
      dispatch(setLoading(true));

      // Fetch user info from Google using the access token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const googleUser = await response.json();

      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());

      let userToLogin: User;

      if (existingUser) {
        userToLogin = existingUser;
      } else {
        // Create new user from Google profile
        userToLogin = {
          id: Date.now().toString(),
          name: googleUser.name || googleUser.email.split('@')[0],
          email: googleUser.email,
          role: "USER",
          avatar: googleUser.picture,
          createdAt: new Date().toISOString(),
        };
        dispatch(addUser(userToLogin));
      }

      dispatch(login(userToLogin));
      success(`Welcome, ${userToLogin.name}!`);
      return { success: true, user: userToLogin };
    } catch (err) {
      showError("Google login failed. Please try again.");
      return { success: false, error: "Google login failed" };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, showError, users]);

  const loginWithGitHub = useCallback(async (code: string) => {
    try {
      dispatch(setLoading(true));

      // Note: In production, this should be done on the backend
      // For now, we'll fetch user info directly using the code
      // You'll need to exchange the code for an access token on your backend

      // This is a simplified version - in production, exchange code for token on backend
      console.log('Exchanging GitHub code for token...');
      const tokenResponse = await fetch('/api/github-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
          client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('GitHub token exchange failed:', tokenResponse.status, errorText);
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('GitHub token response received:', tokenData.error ? 'Error' : 'Success');

      if (tokenData.error) {
        console.error('GitHub token exchange error:', tokenData.error_description);
        throw new Error(tokenData.error_description || 'Failed to get access token');
      }

      console.log('Fetching GitHub user info...');
      // Fetch user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('GitHub user fetch failed:', userResponse.status, errorText);
        throw new Error(`Failed to fetch GitHub user: ${userResponse.statusText}`);
      }

      const githubUser = await userResponse.json();
      console.log('GitHub user info received:', githubUser.login);

      // Fetch user email if not public
      let email = githubUser.email;
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email || `${githubUser.login}@github.com`;
      }

      // Check if user already exists
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      let userToLogin: User;

      if (existingUser) {
        userToLogin = existingUser;
      } else {
        // Create new user from GitHub profile
        userToLogin = {
          id: Date.now().toString(),
          name: githubUser.name || githubUser.login,
          email: email,
          role: "USER",
          avatar: githubUser.avatar_url,
          createdAt: new Date().toISOString(),
        };
        dispatch(addUser(userToLogin));
      }

      dispatch(login(userToLogin));
      success(`Welcome, ${userToLogin.name}!`);
      return { success: true, user: userToLogin };
    } catch (err: any) {
      showError(err.message || "GitHub login failed. Please try again.");
      return { success: false, error: err.message || "GitHub login failed" };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, showError, users]);

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Actions
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile: updateUserProfile,
    loginWithGoogle,
    loginWithGitHub,
    updatePassword: useCallback(async (current: string, next: string) => {
      if (!user) return { success: false };

      if (!current || !next) {
        showError("Both current and new passwords are required.");
        return { success: false };
      }

      if (user.password && user.password !== current) {
        showError("Current password is incorrect.");
        return { success: false };
      }

      try {
        dispatch(setLoading(true));
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const updatedUser = { ...user, password: next };
        dispatch(updateAuthUser(updatedUser)); // Update in authSlice
        dispatch(updateTeamUser(updatedUser)); // Update in userSlice (Team Members)

        success("Password updated successfully!");
        return { success: true };
      } catch (err) {
        showError("Failed to update password.");
        return { success: false };
      } finally {
        dispatch(setLoading(false));
      }
    }, [user, dispatch, success, showError]),

    // Utilities
    hasRole,
    hasPermission,
  };
};
