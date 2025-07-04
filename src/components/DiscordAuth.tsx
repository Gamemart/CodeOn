import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { getDiscordOAuthConfig } from '@/lib/supabase-config';

const DiscordAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('User already authenticated, redirecting...');
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle OAuth callback and auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully:', session.user);
          
          // Wait a moment for the profile to be created by the trigger
          setTimeout(() => {
            setSuccess('Successfully signed in with Discord!');
            toast({
              title: "Welcome to ESTRANGHERO!",
              description: "You've successfully signed in with Discord."
            });
            navigate('/');
          }, 1000);
          
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Initiating Discord OAuth...');
      
      const config = getDiscordOAuthConfig();
      const { data, error } = await supabase.auth.signInWithOAuth(config);

      if (error) {
        console.error('Discord OAuth error:', error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Discord authentication failed. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your Discord email address first.');
        } else if (error.message.includes('Provider not found')) {
          setError('Discord authentication is not properly configured. Please contact support.');
        } else {
          setError(error.message);
        }
        return;
      }

      console.log('Discord OAuth initiated successfully');
      setSuccess('Redirecting to Discord...');
      
    } catch (error: any) {
      console.error('Unexpected Discord OAuth error:', error);
      setError('Failed to connect to Discord. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Background Image */}
      <div className="lg:flex-1 relative overflow-hidden order-2 lg:order-1 min-h-[300px] lg:min-h-screen">
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900"
          style={{
            backgroundImage: `url('/lovable-uploads/f3f9feb6-dc01-4bc1-abca-c5a830e9626f.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 order-1 lg:order-2">
        <div className="w-full max-w-md space-y-8">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <div className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-lg inline-block mb-6">
              ESTRANGHERO
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome to ESTRANGHERO
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Connect with Discord to join our community and start engaging in discussions.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Discord Login Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">Sign in with Discord</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use your Discord account to access ESTRANGHERO
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleDiscordLogin}
                disabled={loading}
                className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg flex items-center justify-center gap-3 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting to Discord...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Continue with Discord
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Why join ESTRANGHERO?</h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Engage in meaningful discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Post and earn bounties</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Connect with like-minded people</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Real-time chat and messaging</span>
              </div>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Discord OAuth configured with Client ID: 1190133425877811241
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordAuth;