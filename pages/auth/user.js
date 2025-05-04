import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, User,  Users, AlertTriangle, Sparkles } from 'lucide-react';

import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
        role: 'USER'
      });
      
      if (result?.error) {
        if (result.error.includes('ACCOUNT_DEACTIVATED')) {
          toast.error(
            'Your account has been deactivated. Please contact support for assistance.',
            {
              duration: 6000,
              position: 'top-center',
              style: {
                background: '#ff4d4f',
                color: 'white',
                fontWeight: 'bold',
                padding: '16px',
                borderRadius: '10px',
              },
              icon: '⚠️',
            }
          );
        } else {
          setError('Invalid email or password');
          toast.error('Invalid email or password');
        }
        return;
      }
      
      toast.success('Welcome back!');
      router.push('/dashboard/user');
    } catch (error) {
      console.error('Login error:', error);
      setError('Something went wrong. Please try again.');
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-20 blur-xl animate-pulse" />
                <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center border-2 border-blue-400/40">
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">User Login</h2>
            <p className="text-gray-400">Access your personal dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                required
              />
              <div className="mt-2 text-right">
                <Link 
                  href="/auth/reset-password" 
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 rounded-lg text-white font-medium transition-all hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Sign in as User</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/auth/dj" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>DJ Login</span>
                </div>
              </Link>
              
      
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth" className="text-blue-400 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 