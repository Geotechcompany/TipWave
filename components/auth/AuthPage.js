import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Lock, Users} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [registrationStep, setRegistrationStep] = useState('idle'); // 'idle', 'registering', 'emailing', 'redirecting'
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Too weak',
    color: 'bg-red-500'
  });

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: 'Too weak', color: 'bg-red-500' };
    }
    
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) {
      return { score, message: 'Too weak', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score, message: 'Could be stronger', color: 'bg-yellow-500' };
    } else if (score <= 6) {
      return { score, message: 'Strong password', color: 'bg-green-500' };
    } else {
      return { score, message: 'Very strong password', color: 'bg-green-600' };
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match';
    }
    
    if (passwordStrength.score < 3) {
      newErrors.password = 'Please create a stronger password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setRegistrationStep('registering');
    
    try {
      // Register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'USER',
          sendWelcomeEmail: true
        }),
      });

      const registerData = await registerResponse.json();
      
      if (!registerResponse.ok) {
        throw new Error(registerData.error || 'Registration failed');
      }
      
      setRegistrationStep('emailing');
      
      // Send welcome email
      const emailResponse = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });
      
      if (!emailResponse.ok) {
        console.warn('Welcome email may not have been sent:', 
                    await emailResponse.text());
      } else {
        console.log('Welcome email initiated');
      }
      
      toast.success('Account created successfully!');
      
      // After successful registration, automatically log the user in
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      
      if (result?.error) {
        toast.error('Registration successful but login failed. Please login manually.');
        router.push('/auth/user');
        return;
      }
      
      setRegistrationStep('redirecting');
      
      // Show a welcome toast with instructions
      toast.success(
        'Welcome to our app! Check your email for usage instructions.',
        { duration: 5000 }
      );
      
      // Redirect to user dashboard with a slight delay to let the toast be seen
      setTimeout(() => {
        router.push('/dashboard/user');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
      setIsLoading(false);
      setRegistrationStep('idle');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
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
            <h2 className="text-2xl font-bold text-white mb-1">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link href="/auth/user" className="font-medium text-blue-500 hover:text-blue-400">
                sign in to your existing account
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      } text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

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
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      } text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border ${
                        errors.password ? 'border-red-500' : 'border-gray-600'
                      } text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                  )}
                  
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                            style={{ width: `${Math.min(100, (passwordStrength.score / 7) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className={`text-xs ${
                        passwordStrength.color === 'bg-red-500' ? 'text-red-400' : 
                        passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {passwordStrength.message}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <p className={formData.password.length >= 8 ? "text-green-400" : "text-gray-400"}>
                          ✓ At least 8 characters
                        </p>
                        <p className={/[A-Z]/.test(formData.password) ? "text-green-400" : "text-gray-400"}>
                          ✓ Uppercase letter
                        </p>
                        <p className={/[a-z]/.test(formData.password) ? "text-green-400" : "text-gray-400"}>
                          ✓ Lowercase letter
                        </p>
                        <p className={/[0-9]/.test(formData.password) ? "text-green-400" : "text-gray-400"}>
                          ✓ Number
                        </p>
                        <p className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-400" : "text-gray-400"}>
                          ✓ Special character
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      type="password"
                      autoComplete="new-password"
                      value={formData.passwordConfirmation}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md bg-gray-700 border ${
                        errors.passwordConfirmation ? 'border-red-500' : 'border-gray-600'
                      } text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.passwordConfirmation && (
                    <p className="mt-2 text-sm text-red-500">{errors.passwordConfirmation}</p>
                  )}
                  {formData.password && formData.passwordConfirmation && 
                   formData.password === formData.passwordConfirmation && (
                    <p className="mt-2 text-sm text-green-500">Passwords match ✓</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link 
                      href="/auth/reset-password" 
                      className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3 rounded-lg 
                             text-white font-medium transition-all duration-300
                             hover:from-blue-600 hover:to-teal-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             disabled:opacity-50 flex justify-center items-center
                             transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>
                        {registrationStep === 'registering' && "Creating account..."}
                        {registrationStep === 'emailing' && "Sending welcome email..."}
                        {registrationStep === 'redirecting' && "Redirecting to dashboard..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Users className="h-5 w-5 mr-2" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {/* <Link
                  href="/auth/dj"
                  className="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium
                  bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                  hover:from-purple-600 hover:to-indigo-700 
                  transition-all duration-200 transform hover:-translate-y-0.5
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-gray-800"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Create DJ Account
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 