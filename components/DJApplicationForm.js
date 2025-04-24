import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Music, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DJApplicationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    experience: '',
    equipment: '',
    genres: '',
    socialLinks: {
      instagram: '',
      soundcloud: '',
      mixcloud: '',
      website: ''
    },
    motivation: ''
  });
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const response = await fetch('/api/dj/check-application');
        const data = await response.json();
        
        if (response.ok && data.application) {
          setApplicationStatus(data.application.status);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    
    checkExistingApplication();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Convert comma-separated genres to array
      const processedData = {
        ...formData,
        genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean)
      };
      
      const response = await fetch('/api/dj/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }
      
      toast.success('DJ application submitted successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard/user?application=submitted');
    } catch (error) {
      console.error('Application error:', error);
      setError(error.message || 'Something went wrong');
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (applicationStatus) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          {applicationStatus === 'pending' ? (
            <div className="bg-yellow-500/20 rounded-full p-3 inline-flex">
              <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
            </div>
          ) : applicationStatus === 'approved' ? (
            <div className="bg-green-500/20 rounded-full p-3 inline-flex">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          ) : (
            <div className="bg-red-500/20 rounded-full p-3 inline-flex">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2">
          {applicationStatus === 'pending' ? 'Application Pending' : 
           applicationStatus === 'approved' ? 'Application Approved' : 'Application Rejected'}
        </h3>
        
        <p className="text-gray-400 mb-6">
          {applicationStatus === 'pending' 
            ? 'Your DJ application is currently being reviewed by our team.'
            : applicationStatus === 'approved'
              ? 'Congratulations! Your application has been approved. You can now access the DJ dashboard.'
              : 'Unfortunately, your application was not approved at this time.'}
        </p>
        
        {applicationStatus === 'approved' && (
          <Link
            href="/dashboard/dj"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium"
          >
            <Music className="h-5 w-5" />
            Go to DJ Dashboard
          </Link>
        )}
        
        {applicationStatus === 'rejected' && (
          <button 
            onClick={() => setApplicationStatus(null)}
            className="mt-4 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Apply Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-2xl"
      >
        <div className="bg-gray-800 py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-8 text-center">
            <Music className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h2 className="text-3xl font-bold text-white">DJ Application</h2>
            <p className="mt-2 text-gray-400">
              Tell us about your experience and why you want to be a DJ on our platform
            </p>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-500 rounded-md p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                DJ Experience*
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                placeholder="Describe your experience as a DJ..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Equipment
              </label>
              <textarea
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                placeholder="What equipment do you use?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Music Genres
              </label>
              <input
                type="text"
                name="genres"
                value={formData.genres}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                placeholder="House, Techno, Hip-Hop, etc. (comma separated)"
              />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Social Media Links
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    placeholder="Instagram URL"
                  />
                </div>
                
                <div>
                  <input
                    type="url"
                    name="socialLinks.soundcloud"
                    value={formData.socialLinks.soundcloud}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    placeholder="SoundCloud URL"
                  />
                </div>
                
                <div>
                  <input
                    type="url"
                    name="socialLinks.mixcloud"
                    value={formData.socialLinks.mixcloud}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    placeholder="Mixcloud URL"
                  />
                </div>
                
                <div>
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={formData.socialLinks.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Why do you want to be a DJ on our platform?*
              </label>
              <textarea
                name="motivation"
                value={formData.motivation}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                placeholder="Tell us why you want to join as a DJ..."
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
                "Submit Application"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 