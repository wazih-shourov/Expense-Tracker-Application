import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, name);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else if (isSignUp) {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white lg:px-16 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-12">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden shadow-sm">
              <img 
                src="https://i.ibb.co/dsRgsNn4/Arti-Q-1.png" 
                alt="Frinance Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-gray-900">Frinance</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start managing your finances with Frinance.' 
                : 'Enter your email and password to access your account.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember Me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Your Password?
                </a>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Log In')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <GoogleAuthButton 
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            text={isSignUp ? "Sign up with Google" : "Sign in with Google"}
          />

          {/* Toggle Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">
              {isSignUp ? 'Have an account?' : "Don't Have An Account?"}{' '}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isSignUp ? 'Sign In' : 'Register Now.'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              Copyright © 2025 Frinance Enterprises LTD.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Visual Panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
        <div className="flex flex-col justify-center items-center text-white p-16 relative z-10">
          <div className="max-w-lg text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Effortlessly manage your finances.
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Log in to access your Frinance dashboard and take control.
            </p>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl max-w-2xl">
              {/* Dashboard Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-white/70 text-sm">Frinance Dashboard</div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-white/70 text-xs mb-1">Total Balance</div>
                  <div className="text-white font-bold text-lg">$12,543</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-white/70 text-xs mb-1">This Month</div>
                  <div className="text-white font-bold text-lg">-$2,431</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-white/70 text-xs mb-1">Savings</div>
                  <div className="text-white font-bold text-lg">$3,892</div>
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-white text-sm font-medium">Expense Overview</div>
                  <div className="text-white/70 text-xs">Last 7 days</div>
                </div>
                <div className="h-24 flex items-end justify-between space-x-1">
                  {[40, 65, 45, 80, 35, 70, 55].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-sm flex-1"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              {/* Transaction List */}
              <div className="space-y-2">
                <div className="text-white text-sm font-medium mb-2">Recent Transactions</div>
                {['Groceries', 'Coffee Shop', 'Gas Station'].map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-white/30 rounded-full mr-3"></div>
                      <div className="text-white text-sm">{item}</div>
                    </div>
                    <div className="text-white text-sm">-${(Math.random() * 100 + 10).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-16 w-12 h-12 border border-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-24 h-24 border border-white rounded-full"></div>
        </div>
      </div>

      {/* Mobile Background - Only visible on small screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-blue-700/5 pointer-events-none"></div>
    </div>
  );
};

export default AuthPage;
