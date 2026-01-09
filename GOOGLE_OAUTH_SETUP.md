# 🔐 Google OAuth Setup - Step-by-Step Guide

Follow these steps to get your Google OAuth credentials:

## Step 1: Access Google Cloud Console

1. Open your browser and go to: **https://console.cloud.google.com**
2. Sign in with your Google account

## Step 2: Create a New Project

1. Look at the **top navigation bar** (blue header)
2. Find the **project dropdown** (usually says "Select a project" or shows a project name)
3. Click on it to open the project selector
4. Click **"NEW PROJECT"** button (top-right of the modal)
5. Enter project details:
   - **Project name**: `My Task Manager` (or any name you prefer)
   - **Organization**: Leave as default
6. Click **"CREATE"**
7. Wait for the project to be created (takes a few seconds)

## Step 3: Configure OAuth Consent Screen

1. Open the **hamburger menu** (☰) in the top-left corner
2. Navigate to: **APIs & Services** → **OAuth consent screen**
3. Select **User Type**:
   - Choose **"External"** (allows anyone with a Google account)
   - Click **"CREATE"**
4. Fill in **App Information**:
   - **App name**: `Task Manager` (or your app name)
   - **User support email**: Select your email from dropdown
   - **Developer contact email**: Enter your email
5. Click **"SAVE AND CONTINUE"**
6. **Scopes** page: Click **"SAVE AND CONTINUE"** (default scopes are fine)
7. **Test users** page: Click **"SAVE AND CONTINUE"** (optional for now)
8. **Summary** page: Click **"BACK TO DASHBOARD"**

## Step 4: Create OAuth Client ID

1. In the left sidebar, click **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Configure the client:
   - **Application type**: Select **"Web application"**
   - **Name**: `React Web Client` (or any name)
   
5. **Add Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:5173`
   
6. **Add Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Enter: `http://localhost:5173`
   
7. Click **"CREATE"**

## Step 5: Copy Your Credentials

A popup will appear with your credentials:

1. **Copy the Client ID** (looks like: `123456789-abc123def456.apps.googleusercontent.com`)
2. Click **"OK"** to close the popup

> **Note:** You can always find these credentials later by going to:
> **APIs & Services** → **Credentials** → Click on your OAuth client name

## Step 6: Update Your .env File

1. Open `e:\CH-tasks\hooks-tsx\.env` in your editor
2. Replace the placeholder with your actual Client ID:

```env
# Google OAuth - REPLACE WITH YOUR ACTUAL CLIENT ID
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=placeholder_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

3. Save the file

## Step 7: Restart Your Dev Server

1. Stop the current dev server (press `Ctrl+C` in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

## Step 8: Test Google Login

1. Go to http://localhost:5173/login
2. Click the **"Google"** button
3. You should see the Google OAuth popup
4. Sign in with your Google account
5. You'll be redirected back to your app and logged in!

---

## 🎉 Success!

Once you complete these steps, your Google OAuth login will work!

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure you added `http://localhost:5173` to **both**:
  - Authorized JavaScript origins
  - Authorized redirect URIs
- Check for typos (http vs https, trailing slashes)

### "Access blocked: This app's request is invalid"
- Make sure you completed the OAuth consent screen setup
- Verify your app name and support email are filled in

### OAuth popup doesn't open
- Check browser console for errors
- Make sure you restarted the dev server after updating `.env`
- Verify the Client ID in `.env` matches the one from Google Cloud Console

---

## Quick Reference

- **Google Cloud Console**: https://console.cloud.google.com
- **Your .env file**: `e:\CH-tasks\hooks-tsx\.env`
- **Restart command**: `npm run dev`

---

## For Production

When deploying to production:
1. Create a new OAuth client in Google Cloud Console
2. Add your production domain to authorized origins and redirect URIs
3. Update your production environment variables
