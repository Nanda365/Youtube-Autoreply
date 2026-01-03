import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sign in');
      }

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      
      navigate('/dashboard');

    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CommentPilot</span>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to access your dashboard</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-accent hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full h-12 mt-2 flex items-center justify-center gap-2"
                onClick={() => { window.location.href = 'http://localhost:8000/auth/google'; }}
              >
                {/* Simple Google logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.23 1.53 8.12 2.8l6-5.78C35.77 3.6 30.36 1.5 24 1.5 14.62 1.5 6.9 7.76 3.5 15.91l7.2 5.6C12.9 15.3 17.9 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.5 24c0-1.6-.14-3.13-.4-4.5H24v8.53h12.7c-.55 3.02-2.22 5.58-4.74 7.3l7.3 5.63C43.6 37.5 46.5 31.3 46.5 24z"/>
                  <path fill="#4A90E2" d="M10.7 29.1A14 14 0 0 1 9 24c0-1.6.35-3.13.94-4.5L3.5 13.9C1.2 17.4 0 21.6 0 26s1.2 8.6 3.5 12.1l7.2-5z"/>
                  <path fill="#FBBC05" d="M24 46.5c6.36 0 11.77-2.1 15.72-5.6l-7.3-5.63C30.23 36.8 27.54 38.5 24 38.5c-6.1 0-11.1-5.8-13.3-13.6l-7.2 5C6.9 40.74 14.62 46.5 24 46.5z"/>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </form>
          
          <p className="mt-6 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Panel - Visual */}
      <div className="hidden lg:flex lg:flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
            <MessageSquare className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            AI-Powered YouTube Engagement
          </h2>
          <p className="text-muted-foreground">
            Automatically respond to comments, boost engagement, and save hours every week with intelligent AI replies.
          </p>
        </div>
      </div>
    </div>
  );
}
