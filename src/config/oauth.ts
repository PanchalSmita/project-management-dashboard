export const oauthConfig = {
    google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173',
    },
    github: {
        clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
        redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback',
    },
};
