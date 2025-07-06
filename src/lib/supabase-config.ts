// Supabase Discord OAuth Configuration
// This file contains the configuration for Discord OAuth integration

export const DISCORD_CONFIG = {
  clientId: '1190133425877811241',
  // Client secret is configured in Supabase dashboard
  scopes: 'identify email',
};

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  // For production, use the deployed URL
  if (window.location.hostname === 'veid.xyz') {
    return 'https://veid.xyz';
  }
  
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.origin}`;
  }
  
  // For other environments, use the current origin
  return window.location.origin;
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