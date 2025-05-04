import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reset email');
      }
      
      setIsEmailSent(true);
      toast.success('If an account with this email exists, you will receive a reset link');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Reset Password | TipWave</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-700">
            <div className="mb-6">
              <Link href="/auth/user" className="text-gray-400 hover:text-white flex items-center transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset your password
              </h2>
              <p className="text-gray-400">
                {isEmailSent ? 
                  'Check your email for password reset instructions' : 
                  'Enter your email address to receive a password reset link'}
              </p>
            </div>
            
            {!isEmailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 rounded-lg 
                            text-white font-medium transition-all duration-300
                            hover:from-blue-600 hover:to-teal-600 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 
                            disabled:opacity-50 flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <div className="bg-blue-500/20 text-blue-400 py-3 px-4 rounded-lg mb-6">
                  A password reset link has been sent to your email.
                </div>
                <Link
                  href="/auth/user"
                  className="inline-block bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
} 