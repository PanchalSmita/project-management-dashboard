import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useUsers } from "../hooks/useUsers";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiUsers,
  FiTrash2,
} from "react-icons/fi";
import type { User } from "../types";

const UserSettings = () => {
  const { user, updatePassword, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useNotifications();
  const { users, removeUser, inviteUser } = useUsers();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      error("New password cannot be empty");
      return;
    }
    
    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  // Invite State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"USER" | "ADMIN" | "MANAGER">(
    "USER"
  );

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      success("Profile updated successfully!");
    }, 800);
  };

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      error("Please fill in all fields");
      return;
    }
    const result = await inviteUser({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    });
    if (result.success) {
      setInviteName("");
      setInviteEmail("");
      setInviteRole("USER");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences and profile.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <nav className="flex flex-col space-y-1 text-sm text-muted-foreground">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors justify-start ${
              activeTab === "profile"
                ? "bg-secondary text-foreground"
                : "hover:bg-secondary/50"
            }`}
          >
            <FiUser className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors justify-start ${
              activeTab === "security"
                ? "bg-secondary text-foreground"
                : "hover:bg-secondary/50"
            }`}
          >
            <FiLock className="w-4 h-4" />
            Security
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors justify-start ${
              activeTab === "team"
                ? "bg-secondary text-foreground"
                : "hover:bg-secondary/50"
            }`}
          >
            <FiUsers className="w-4 h-4" />
            Team Members
          </button>
        </nav>

        <div className="space-y-6">
          {/* Profile Card */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Personal Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your photo and personal details.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      placeholder="Enter Your Name..."
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      placeholder="Enter Your Email..."
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Card */}
          {activeTab === "security" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Change Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your password associated with your account.
                </p>
              </div>

              <form 
                className="space-y-4 max-w-md"
                onSubmit={handleUpdatePassword}
              >
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="password"
                      value={currentPassword}
                      placeholder="Enter Current Password"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      placeholder="Enter New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiLock className="w-4 h-4" />
                    {isAuthLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Team Members Card */}
          {activeTab === "team" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Team Members
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage who has access to this workspace.
                  </p>
                </div>
              </div>

              {/* Invite User Form */}
              <div className="bg-secondary/30 p-4 rounded-lg mb-6 border border-border">
                <h3 className="text-sm font-medium mb-3">Invite New User</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    placeholder="Name"
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-ring"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                  <input
                    placeholder="Email address"
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-ring"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <select
                    title="Select Role"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-ring w-32"
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as User["role"])
                    }
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition"
                  >
                    Invite
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          u.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">
                          {u.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-600"
                            : u.role === "MANAGER"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-slate-500/10 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                      {user?.role === "ADMIN" && u.id !== user?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${u.name} from team?`))
                              removeUser(u.id);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Remove User"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
