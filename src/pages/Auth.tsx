import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
  }, [navigate]);

  // Clear messages when switching tabs or typing
  const clearMessages = () => {
    setErrors({});
    setSuccess('');
  };

  // Form validation
  const validateForm = (isSignUp: boolean = false) => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Sign up specific validations
    if (isSignUp) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (fullName.trim().length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters long';
      }

      if (username.trim() && username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters long';
      }

      if (username.trim() && !/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!validateForm(true)) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting signup process...');
      
      // Prepare user metadata
      const userMetadata = {
        full_name: fullName.trim(),
        ...(username.trim() && { username: username.trim() })
      };

      console.log('User metadata:', userMetadata);

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userMetadata
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          setErrors({ email: 'An account with this email already exists. Please sign in instead.' });
          setActiveTab('signin');
          return;
        }
        
        if (error.message.includes('Invalid email')) {
          setErrors({ email: 'Please enter a valid email address' });
          return;
        }

        if (error.message.includes('Password')) {
          setErrors({ password: error.message });
          return;
        }
        
        // Generic error
        setErrors({ general: error.message });
        return;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if user needs email confirmation
        if (!data.session) {
          setSuccess('Please check your email for a confirmation link to complete your registration.');
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Please check your email to complete signup.",
          });
        } else {
          setSuccess('Account created successfully! You are now signed in.');
          toast({
            title: "Welcome to ESTRANGHERO!",
            description: "Your account has been created successfully."
          });
          
          // Redirect after successful signup
          setTimeout(() => {
            navigate('/');
          }, 1000);
          return;
        }
      }

      // Clear form fields after successful signup
      setEmail('');
      setPassword('');
      setFullName('');
      setUsername('');
      
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    
    if (!validateForm(false)) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting signin process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      console.log('Signin response:', { data, error });

      if (error) {
        console.error('Signin error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
          return;
        }

        if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
          return;
        }
        
        setErrors({ general: error.message });
        return;
      }

      if (data.user) {
        console.log('User signed in successfully:', data.user.id);
        setSuccess('Successfully signed in! Redirecting...');
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in to ESTRANGHERO."
        });
        
        // Redirect after successful signin
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
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
              {activeTab === 'signin' ? 'Welcome back' : 'Join ESTRANGHERO'}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {activeTab === 'signin' 
                ? 'Sign in to continue your journey with us.' 
                : 'Create your account and start connecting with others.'
              }
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

          {/* Error Messages */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearMessages(); }} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className={`h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-foreground font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                      className={`h-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="signup-fullname"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearMessages(); }}
                    className={`h-12 ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-foreground font-medium">
                    Username (Optional)
                  </Label>
                  <Input
                    id="signup-username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); clearMessages(); }}
                    className={`h-12 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={loading}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Letters, numbers, and underscores only. Will be auto-generated if left empty.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    className={`h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                      className={`h-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                      disabled={loading}
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 font-medium rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signin'); clearMessages(); }}
                      className="text-foreground hover:underline font-medium"
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