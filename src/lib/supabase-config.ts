// Supabase Discord OAuth Configuration
// This file contains the configuration for Discord OAuth integration

export const DISCORD_CONFIG = {
  clientId: '1190133425877811241',
  // Client secret is configured in Supabase dashboard
  scopes: 'identify email',
  redirectUrl: `${window.location.origin}/auth/callback`
};

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  // In production, use the deployed URL
  if (window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  // In development, use localhost
  return 'http://localhost:8080';
};

// OAuth provider configuration for Supabase
export const getDiscordOAuthConfig = () => ({
  provider: 'discord' as const,
  options: {
    redirectTo: getRedirectUrl(),
    scopes: DISCORD_CONFIG.scopes,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});