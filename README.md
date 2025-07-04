# ESTRANGHERO - Discord-Only Authentication

A modern discussion platform with Discord OAuth integration, bounty system, and real-time chat.

## Features

- **Discord OAuth Authentication** - Secure login using Discord accounts only
- **Discussion Platform** - Create and engage in threaded discussions
- **Bounty System** - Post and claim bounties for tasks
- **Real-time Chat** - Direct messaging and group chats
- **Profile Customization** - Personalized profiles with banners and avatars
- **Follow System** - Follow other users and build connections

## Authentication Setup

This application uses Discord OAuth exclusively for authentication. The system is configured with:

- **Client ID**: 1190133425877811241
- **Client Secret**: Configured in Supabase Dashboard
- **Scopes**: `identify email`
- **Redirect URL**: Configured for your domain

### Supabase Configuration

To set up Discord OAuth in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Enable Discord provider
4. Add the Discord Client ID: `1190133425877811241`
5. Add the Discord Client Secret: `pxvY2t-_6aWc-XiraXygujBfQNtKCCu_`
6. Set the redirect URL to your domain

### Discord Application Setup

The Discord application is already configured with:
- Application ID: 1190133425877811241
- Redirect URIs configured for your domain
- Required scopes: identify, email

## Database Schema

The application uses Supabase with the following key tables:

- `profiles` - User profiles with Discord data
- `discussions` - Discussion threads
- `replies` - Discussion replies
- `bounties` - Bounty postings
- `chats` - Chat conversations
- `messages` - Chat messages
- `follows` - User follow relationships

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

The following environment variables are automatically configured:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: Discord OAuth
- **Real-time**: Supabase Realtime
- **Build Tool**: Vite

## Security Features

- Row Level Security (RLS) on all tables
- Discord OAuth integration
- Secure profile creation triggers
- Protected API endpoints
- Real-time subscription security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.