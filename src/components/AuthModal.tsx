
import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }) => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    onLogin({ name: email.split('@')[0], email });
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in."
    });
    onClose();
  };

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    
    onLogin({ name, email });
    toast({
      title: "Account created!",
      description: "Welcome to the discussion platform."
    });
    onClose();
  };

  const handleAnonymousJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) return;
    
    onLogin({ name: nickname, email: '' });
    toast({
      title: "Joined as guest!",
      description: `Welcome, ${nickname}!`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center p-8 bg-gradient-to-r from-purple-600 to-pink-600">
          <CardTitle className="text-3xl font-bold text-white">
            Join the Discussion
          </CardTitle>
          <p className="text-purple-100 mt-2">Connect with the community</p>
        </CardHeader>
        
        <CardContent className="p-8">
          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-2xl p-1">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-semibold transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-semibold transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
              <TabsTrigger 
                value="guest"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl font-semibold transition-all duration-200"
              >
                Guest
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-lg"
                >
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-gray-700 font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-name"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-lg"
                >
                  Create Account
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="guest">
              <form onSubmit={handleAnonymousJoin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-gray-700 font-medium">Choose a Nickname</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="nickname"
                      placeholder="Anonymous User"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 bg-purple-50 p-4 rounded-2xl">
                  Join as a guest to start participating in discussions. You can create an account later.
                </p>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg"
                >
                  Join as Guest
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-center mt-6">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
