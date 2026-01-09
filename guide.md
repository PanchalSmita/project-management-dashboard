# OAuth Integration Guide - Google & GitHub Authentication

This guide will walk you through setting up Google and GitHub OAuth authentication for your application.

## Table of Contents
- [Google OAuth Setup](#google-oauth-setup)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Environment Configuration](#environment-configuration)
- [Code Integration](#code-integration)

---

## Google OAuth Setup

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. Click on the project dropdown at the top of the page
2. Click **"New Project"**
3. Enter a project name (e.g., "My Task Manager")
4. Click **"Create"**

### Step 3: Configure OAuth Consent Screen
1. In the left sidebar, navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type (or "Internal" if using Google Workspace)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Your application name
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
5. Click **"Save and Continue"**
6. On the Scopes page, click **"Save and Continue"** (default scopes are sufficient)
7. Add test users if needed, then click **"Save and Continue"**

### Step 4: Create OAuth Client ID
1. Navigate to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "Web Client")
5. Add **Authorized JavaScript origins**:
   - For local development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add **Authorized redirect URIs**:
   - For local development: `http://localhost:5173/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
7. Click **"Create"**

### Step 5: Copy Credentials
1. A popup will appear with your **Client ID** and **Client Secret**
2. **Copy both values** and store them securely
3. You can always retrieve them later from the Credentials page

---

## GitHub OAuth Setup

### Step 1: Access GitHub Developer Settings
1. Log in to [GitHub](https://github.com)
2. Click your profile picture in the top-right corner
3. Select **"Settings"**
4. In the left sidebar, scroll down and click **"Developer settings"**

### Step 2: Create OAuth App
1. In the left sidebar, click **"OAuth Apps"**
2. Click **"New OAuth App"** (or "Register a new application")
3. Fill in the application details:
   - **Application name**: Your app name (e.g., "Task Manager")
   - **Homepage URL**: 
     - For local development: `http://localhost:5173`
     - For production: `https://yourdomain.com`
   - **Application description**: Brief description of your app (optional)
   - **Authorization callback URL**:
     - For local development: `http://localhost:5173/auth/github/callback`
     - For production: `https://yourdomain.com/auth/github/callback`
4. Click **"Register application"**

### Step 3: Generate Client Secret
1. After registration, you'll see your **Client ID** on the page
2. Click **"Generate a new client secret"**
3. **Copy the Client Secret immediately** - you won't be able to see it again!
4. Store both the Client ID and Client Secret securely

---

## Environment Configuration

### Step 1: Create Environment File
Create a `.env` file in the root of your project (if it doesn't exist):

```bash
# .env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here

VITE_GITHUB_CLIENT_ID=your_github_client_id_here
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Callback URLs (adjust based on your environment)
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

### Step 2: Update .gitignore
Make sure `.env` is in your `.gitignore` file to prevent committing secrets:

```
# .gitignore
.env
.env.local
.env.*.local
```

### Step 3: Install Required Dependencies
You'll need to install OAuth libraries:

```bash
npm install @react-oauth/google
# or
npm install react-google-login

# For GitHub, you can use a general OAuth library
npm install oauth
```

---

## Code Integration

### Where to Add OAuth Logic

#### 1. **Environment Variables Access**
Create a config file to access environment variables:

**File**: `src/config/oauth.ts`
```typescript
export const oauthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  },
  github: {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI,
  },
};
```

#### 2. **Update useAuth Hook**
Modify `src/hooks/useAuth.ts` to handle OAuth login:

Add OAuth login methods:
```typescript
const loginWithGoogle = useCallback(async (googleToken: string) => {
  try {
    dispatch(setLoading(true));
    
    // Verify token with your backend or decode it
    // For now, we'll create a user from the token
    const userToLogin: User = {
      id: Date.now().toString(),
      name: "Google User", // Extract from token
      email: "user@gmail.com", // Extract from token
      role: "USER",
      createdAt: new Date().toISOString(),
    };
    
    dispatch(addUser(userToLogin));
    dispatch(login(userToLogin));
    success(`Welcome, ${userToLogin.name}!`);
    return { success: true, user: userToLogin };
  } catch (err) {
    showError("Google login failed.");
    return { success: false, error: "Google login failed" };
  } finally {
    dispatch(setLoading(false));
  }
}, [dispatch, success, showError]);

const loginWithGitHub = useCallback(async (code: string) => {
  try {
    dispatch(setLoading(true));
    
    // Exchange code for access token with GitHub
    // Then fetch user info
    const userToLogin: User = {
      id: Date.now().toString(),
      name: "GitHub User", // Extract from GitHub API
      email: "user@github.com", // Extract from GitHub API
      role: "USER",
      createdAt: new Date().toISOString(),
    };
    
    dispatch(addUser(userToLogin));
    dispatch(login(userToLogin));
    success(`Welcome, ${userToLogin.name}!`);
    return { success: true, user: userToLogin };
  } catch (err) {
    showError("GitHub login failed.");
    return { success: false, error: "GitHub login failed" };
  } finally {
    dispatch(setLoading(false));
  }
}, [dispatch, success, showError]);

// Export these methods
return {
  // ... existing exports
  loginWithGoogle,
  loginWithGitHub,
};
```

#### 3. **Update Login Page**
Modify `src/pages/Login.tsx` to use OAuth providers:

For **Google**, wrap your app with GoogleOAuthProvider in `main.tsx`:
```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';
import { oauthConfig } from './config/oauth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={oauthConfig.google.clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

Then in `Login.tsx`, update the Google button handler:
```typescript
import { useGoogleLogin } from '@react-oauth/google';

// Inside Login component
const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const result = await loginWithGoogle(tokenResponse.access_token);
    if (result.success) navigate('/dashboard');
  },
  onError: () => setError('Google login failed'),
});

// Update the button
<button
  type="button"
  onClick={() => googleLogin()}
  className="..."
>
  <FcGoogle className="mr-2 h-4 w-4" />
  Google
</button>
```

For **GitHub**, update the button to redirect to GitHub OAuth:
```typescript
const handleGitHubLogin = () => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.github.clientId}&redirect_uri=${oauthConfig.github.redirectUri}&scope=user:email`;
  window.location.href = githubAuthUrl;
};

<button
  type="button"
  onClick={handleGitHubLogin}
  className="..."
>
  <FaGithub className="mr-2 h-4 w-4" />
  GitHub
</button>
```

#### 4. **Create Callback Route**
Create a callback handler for GitHub in `src/pages/GitHubCallback.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      loginWithGitHub(code).then((result) => {
        if (result.success) navigate('/dashboard');
        else navigate('/login');
      });
    }
  }, [searchParams, loginWithGitHub, navigate]);

  return <div>Processing GitHub login...</div>;
};

export default GitHubCallback;
```

Add the route in `src/routes/AppRoutes.tsx`:
```typescript
<Route path="/auth/github/callback" element={<GitHubCallback />} />
```

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use HTTPS in production** - OAuth providers require secure connections
3. **Validate tokens on the backend** - Don't trust client-side tokens alone
4. **Rotate secrets regularly** - Generate new client secrets periodically
5. **Use environment-specific credentials** - Different credentials for dev/staging/production

---

## Testing Your Integration

### Local Testing
1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:5173/login`
3. Click the Google or GitHub button
4. Complete the OAuth flow
5. Verify you're redirected back and logged in

### Production Deployment
1. Update your OAuth app settings with production URLs
2. Set environment variables in your hosting platform
3. Test the complete flow in production

---

## Troubleshooting

### Common Issues

**"Redirect URI mismatch"**
- Ensure the redirect URI in your OAuth app settings exactly matches the one in your code
- Check for trailing slashes and http vs https

**"Invalid client"**
- Verify your Client ID and Client Secret are correct
- Check that environment variables are loaded properly

**"Access denied"**
- User may have denied permissions
- Check OAuth consent screen configuration

**CORS errors**
- Ensure your domain is added to Authorized JavaScript origins
- Check that you're using the correct protocol (http/https)

---

## Next Steps

After setting up OAuth:
1. Implement proper token storage (consider using httpOnly cookies)
2. Add token refresh logic for long-lived sessions
3. Implement backend verification of OAuth tokens
4. Add user profile syncing from OAuth providers
5. Consider adding more OAuth providers (Microsoft, Apple, etc.)

---

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
