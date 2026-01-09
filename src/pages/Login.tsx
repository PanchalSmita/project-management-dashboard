import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Role, User } from "../types";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import { oauthConfig } from "../config/oauth";

const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Toggle between login and signup
  const [isRegistering, setIsRegistering] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup fields
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const pwRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // load remembered email
    const rem = localStorage.getItem("remember_me");
    const saved = localStorage.getItem("remembered_email");
    if (rem === "true" && saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    if (isRegistering) {
      if (!name.trim()) return "Please enter your name.";
      if (name.trim().length < 2) return "Name must be at least 2 characters.";
      if (!email) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Please enter a valid email.";
      if (!password) return "Please enter your password.";
      if (password.length < 6) return "Password must be at least 6 characters.";
      if (!confirmPassword) return "Please confirm your password.";
      if (password !== confirmPassword) return "Passwords do not match.";
      if (!role) return "Please select a role.";
    } else {
      if (!email) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "Please enter a valid email.";
      if (!password) return "Please enter your password.";
      if (password.length < 4) return "Password must be at least 4 characters.";
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // simulate async
      await new Promise((r) => setTimeout(r, 600));

      if (isRegistering) {
        // Signup logic
        const newUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          role: role,
        };

        const registeredUsers = JSON.parse(
          localStorage.getItem("registered_users") || "[]"
        );
        registeredUsers.push(newUser);
        localStorage.setItem("registered_users", JSON.stringify(registeredUsers));

        console.log("User registered:", newUser);

        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
        setName("");
        setError(null);
        alert("Account created successfully! Please sign in.");
      } else {
        // Login logic
        const registeredUsers = JSON.parse(
          localStorage.getItem("registered_users") || "[]"
        );
        const userExists = registeredUsers.find((u: User) => u.email === email);
        
        let result = { success: false };
        if (userExists) {
            result = await login({
              email: userExists.email,
              password: password,
              role: role,
            });
        } else {
           // Fallback for default users
           result = await login({ email, password, role });
        }

        if (result.success) {
           if (rememberMe) {
             localStorage.setItem("remember_me", "true");
             localStorage.setItem("remembered_email", email);
           } else {
             localStorage.removeItem("remember_me");
             localStorage.removeItem("remembered_email");
           }
           navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error", err);
      setError(isRegistering ? "Registration failed. Try again." : "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if OAuth is configured
  const isGoogleConfigured = oauthConfig.google.clientId && 
    oauthConfig.google.clientId !== 'placeholder_google_client_id' &&
    oauthConfig.google.clientId !== 'your_google_client_id_here' &&
    oauthConfig.google.clientId !== 'dummy-client-id';
  
  const isGitHubConfigured = oauthConfig.github.clientId && 
    oauthConfig.github.clientId !== 'placeholder_github_client_id' &&
    oauthConfig.github.clientId !== 'your_github_client_id_here';

  // Google OAuth handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const result = await loginWithGoogle(tokenResponse.access_token);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError('Google login failed. Please try again.');
        }
      } catch (err) {
        console.error('Google login error:', err);
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
  });

  // GitHub OAuth handler
  const handleGitHubLogin = () => {
    if (!isGitHubConfigured) {
      setError('GitHub OAuth is not configured. Please add credentials to .env file.');
      return;
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.github.clientId}&redirect_uri=${oauthConfig.github.redirectUri}&scope=user:email`;
    window.location.href = githubAuthUrl;
  };

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) {
      setError('Google OAuth is not configured. Please add credentials to .env file.');
      return;
    }
    googleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px] bg-card text-card-foreground rounded-2xl shadow-lg border border-border p-8">
        {/* Title */}
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
            {isRegistering ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
            {isRegistering
                ? "Enter your details to create your account"
                : "Enter your email to sign in to your account"}
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smita Panchal"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Password</label>
              <div className="relative">
                <input
                    ref={pwRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
            </div>
          </div>

          {isRegistering && (
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition outline-none"
                    >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                </div>
            </div>
          )}

             <div className="space-y-2">
                 <label className="text-sm font-medium leading-none">Role</label>
                 <select
                 title="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                 </select>
            </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {loading ? "Loading..." : isRegistering ? "Sign up" : "Sign in"}
          </button>

          {error && (
            <div className="text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                disabled={loading}
            >
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
            </button>
            <button
                type="button"
                onClick={handleGitHubLogin}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                disabled={loading}
            >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
            </button>
        </div>

        <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
            >
                {isRegistering ? "Sign in" : "Sign up"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;