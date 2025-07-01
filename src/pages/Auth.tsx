
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required for signup.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            username: username || fullName.toLowerCase().replace(/\s+/g, '')
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials."
      });

      // Clear form and switch to sign in tab
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Please fill in all fields",
        description: "Email and password are required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in."
      });
      navigate('/');
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="flex-1 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8">
            <div className="bg-white text-black px-3 py-1 text-sm font-medium rounded inline-block mb-6">
              TailwindThemeBlocks
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to UTech</h1>
            <p className="text-gray-400 text-lg">Sign into your account</p>
          </div>

          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
              <TabsTrigger value="signin" className="text-gray-300 data-[state=active]:bg-white data-[state=active]:text-black">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-gray-300 data-[state=active]:bg-white data-[state=active]:text-black">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Phone or Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-gray-100 h-12 font-medium"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Log In"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Username (Optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 h-12"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-gray-100 h-12 font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Geometric Background */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300"
          style={{
            backgroundImage: `url('/lovable-uploads/2f1a0873-a18f-42c3-850c-89a636cde8a2.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
