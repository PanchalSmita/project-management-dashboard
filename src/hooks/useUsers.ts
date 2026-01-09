
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  addUser, 
  updateUser, 
  removeUser, 
  setLoading 
} from "../redux/slices/userSlice";
import { useNotifications } from "./useNotifications";
import { useAuth } from "./useAuth";
import type { User, Role } from "../types";

export interface InviteUserData {
  email: string;
  name: string;
  role: Role;
}

export interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: Role;
  avatar?: string;
}

export const useUsers = () => {
  const { users, isLoading } = useAppSelector((state) => state.users);
  const { user: currentUser, hasPermission } = useAuth();
  const dispatch = useAppDispatch();
  const { success, error } = useNotifications();

  const activeUsers = useMemo(() => 
    users.filter(user => user.lastActive && 
      new Date(user.lastActive) > new Date(Date.now() - 30 * 60 * 1000) // Active in last 30 minutes
    ),
    [users]
  );

  const getUsersByRole = useCallback((role: Role) => 
    users.filter(user => user.role === role),
    [users]
  );

  const inviteUser = useCallback(async (data: InviteUserData) => {
    if (!hasPermission("user.invite")) {
      error("You don't have permission to invite users");
      return { success: false };
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      error("User with this email already exists");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString(),
      };

      dispatch(addUser(newUser));
      success(`User "${data.name}" invited successfully!`);
      
      // In a real app, you'd send an invitation email here
      return { success: true, user: newUser };
    } catch (err) {
      error("Failed to invite user");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [users, hasPermission, dispatch, success, error]);

  const updateUserData = useCallback(async (data: UpdateUserData) => {
    const user = users.find(u => u.id === data.id);
    if (!user) {
      error("User not found");
      return { success: false };
    }

    // Check permissions
    const canUpdateOthers = hasPermission("user.update");
    const isUpdatingSelf = currentUser?.id === data.id;
    
    if (!canUpdateOthers && !isUpdatingSelf) {
      error("You don't have permission to update this user");
      return { success: false };
    }

    // Role changes require admin permission
    if (data.role && data.role !== user.role && !hasPermission("user.role.update")) {
      error("You don't have permission to change user roles");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const updatedUser = { ...user, ...data };
      dispatch(updateUser(updatedUser));
      success("User updated successfully!");
      return { success: true, user: updatedUser };
    } catch (err) {
      error("Failed to update user");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [users, currentUser, hasPermission, dispatch, success, error]);

  const removeUserFromTeam = useCallback(async (userId: string) => {
    if (!hasPermission("user.remove")) {
      error("You don't have permission to remove users");
      return { success: false };
    }

    const user = users.find(u => u.id === userId);
    if (!user) {
      error("User not found");
      return { success: false };
    }

    if (currentUser?.id === userId) {
      error("You cannot remove yourself");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      dispatch(removeUser(userId));
      success(`User "${user.name}" removed successfully!`);
      return { success: true };
    } catch (err) {
      error("Failed to remove user");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [users, currentUser, hasPermission, dispatch, success, error]);

  const changeUserRole = useCallback(async (userId: string, newRole: Role) => {
    return updateUserData({ id: userId, role: newRole });
  }, [updateUserData]);

  const updateUserAvatar = useCallback(async (userId: string, avatar: string) => {
    return updateUserData({ id: userId, avatar });
  }, [updateUserData]);

  const updateLastActive = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };

    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    dispatch(updateUser(updatedUser));
    return { success: true };
  }, [users, dispatch]);

  const searchUsers = useCallback((query: string) => {
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  }, [users]);

  const getUserStats = useMemo(() => {
    const stats = {
      total: users.length,
      active: activeUsers.length,
      byRole: {
        ADMIN: getUsersByRole("ADMIN").length,
        MANAGER: getUsersByRole("MANAGER").length,
        USER: getUsersByRole("USER").length,
      },
      recentlyJoined: users.filter(user => {
        const joinDate = new Date(user.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return joinDate > weekAgo;
      }).length,
    };
    return stats;
  }, [users, activeUsers, getUsersByRole]);

  return {
    // State
    users,
    activeUsers,
    isLoading,
    userStats: getUserStats,

    // Actions
    inviteUser,
    updateUser: updateUserData,
    removeUser: removeUserFromTeam,
    changeUserRole,
    updateUserAvatar,
    updateLastActive,

    // Utilities
    getUserById: useCallback((id: string) => users.find(u => u.id === id), [users]),
    getUserByEmail: useCallback((email: string) => users.find(u => u.email === email), [users]),
    getUsersByRole,
    searchUsers,
    isUserActive: useCallback((userId: string) => 
      activeUsers.some(u => u.id === userId), [activeUsers]
    ),
    canManageUser: useCallback((userId: string) => {
      if (currentUser?.id === userId) return true; // Can manage self
      return hasPermission("user.update");
    }, [currentUser, hasPermission]),
  };
};