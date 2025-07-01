
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
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
    
    // Basic validation
    if (!email || !password || !fullName) {
      toast({
        title: "Please fill in all required fields",
        description: "Email, password, and full name are required for signup.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            username: username.trim() || fullName.toLowerCase().replace(/\s+/g, '').substring(0, 20)
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          setActiveTab('signin');
          return;
        }
        
        if (error.message.includes('Database error')) {
          toast({
            title: "Server error",
            description: "There was a problem creating your account. Please try again in a moment.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Check if user needs email confirmation
        if (!data.session) {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Please check your email to complete signup.",
          });
        } else {
          toast({
            title: "Account created successfully!",
            description: "Welcome! You're now signed in."
          });
          navigate('/');
          return;
        }
      }

      // Clear form fields after successful signup
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = "An unexpected error occurred during signup.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Signup failed",
        description: errorMessage,
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
      console.log('Starting signin process for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      console.log('Signin response:', { data, error });

      if (error) {
        console.error('Signin error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect.",
            variant: "destructive"
          });
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('User signed in successfully:', data.user.id);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
        navigate('/');
      }
      
    } catch (error: any) {
      console.error('Signin error:', error);
      
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Background Image */}
      <div className="lg:flex-1 relative overflow-hidden order-2 lg:order-1 min-h-[300px] lg:min-h-screen">
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-900 to-black"
          style={{
            backgroundImage: `url('/lovable-uploads/f3f9feb6-dc01-4bc1-abca-c5a830e9626f.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 order-1 lg:order-2">
        <div className="w-full max-w-md space-y-8">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <div className="bg-gray-900 text-white px-4 py-2 text-sm font-medium rounded-lg inline-block mb-6">
              UTech Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {activeTab === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {activeTab === 'signin' 
                ? 'Welcome to the Smart Site System for Oil Depots. Sign in to continue.' 
                : 'Join the Smart Site System for Oil Depots today.'
              }
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200">
              <TabsTrigger 
                value="signin" 
                className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900 pr-12"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-900 text-sm underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-medium">
                    Username (Optional)
                  </Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900"
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-700 font-medium">
                    E-mail *
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-700 font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 h-12 focus:border-gray-900 focus:ring-gray-900 pr-12"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-gray-900 hover:underline font-medium"
                      disabled={loading}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
