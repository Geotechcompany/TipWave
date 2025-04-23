import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Music, Headphones, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DjLogin() {
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
      
      // Verify DJ role
      const response = await fetch('/api/auth/verify-dj');
      const data = await response.json();
      
      if (!data.isDj) {
        setError('You don\'t have DJ permissions');
        toast.error('Access denied: DJ permissions required');
        // Sign out the user since they're not a DJ
        await signIn('credentials', { redirect: false, email: '', password: '' });
        return;
      }
      
      toast.success('Welcome to DJ Dashboard');
      router.push('/dashboard/dj');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 py-12 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          {/* Sound wave effect */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
              initial={{ width: 100, height: 100, opacity: 0.5 }}
              animate={{ 
                width: [100, 800 + (i * 100)], 
                height: [100, 800 + (i * 100)],
                opacity: [0.5, 0] 
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: i * 0.8,
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Headphones className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">DJ Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
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
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 rounded-lg text-white font-medium transition-all hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 flex justify-center items-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign in as DJ"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Not a DJ?{" "}
            <Link href="/auth" className="text-purple-400 hover:underline">
              Return to regular login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 