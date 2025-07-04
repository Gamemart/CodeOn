// Supabase Discord OAuth Configuration
// This file contains the configuration for Discord OAuth integration

export const DISCORD_CONFIG = {
  clientId: '1190133425877811241',
  // Client secret is configured in Supabase dashboard
  scopes: 'identify email',
  redirectUrl: `${window.location.origin}/auth/callback`
};

// OAuth provider configuration for Supabase
export const getDiscordOAuthConfig = () => ({
  provider: 'discord' as const,
  options: {
    redirectTo: `${window.location.origin}/`,
    scopes: DISCORD_CONFIG.scopes,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});