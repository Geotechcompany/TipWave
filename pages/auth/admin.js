import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLogin() {
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
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
        return;
      }
      
      // Verify admin role
      const response = await fetch('/api/auth/verify-admin');
      const data = await response.json();
      
      if (!data.isAdmin) {
        setError('You don\'t have admin permissions');
        toast.error('Access denied: Admin permissions required');
        // Sign out the user since they're not an admin
        await signIn('credentials', { redirect: false, email: '', password: '' });
        return;
      }
      
      toast.success('Welcome to Admin Dashboard');
      router.push('/dashboard/admin');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-2">Sign in to the admin dashboard</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg flex items-center"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </motion.div>
        )}

        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-lg text-white font-medium transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign in as Admin"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Not an admin?{" "}
            <Link href="/auth" className="text-blue-400 hover:underline">
              Return to regular login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 