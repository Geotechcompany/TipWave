import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// Remove or modify the useUser import if not needed
// import { useUser } from "@clerk/nextjs"; 
import { Music, Star, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export function FavoriteDJs() {
  // Remove unused user variable
  // const { user } = useUser();
  const [favoriteDJs, setFavoriteDJs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteDJs();
  }, []);

  const fetchFavoriteDJs = async () => {
    try {
      const response = await fetch('/api/djs/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorite DJs');
      const data = await response.json();
      setFavoriteDJs(data);
    } catch (error) {
      console.error('Error fetching favorite DJs:', error);
      toast.error('Failed to load favorite DJs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfavorite = async (djId) => {
    try {
      const response = await fetch(`/api/djs/favorites/${djId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove from favorites');
      
      setFavoriteDJs(prev => prev.filter(dj => dj.id !== djId));
      toast.success('DJ removed from favorites');
    } catch (error) {
      console.error('Error removing DJ from favorites:', error);
      toast.error('Failed to remove DJ from favorites');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!favoriteDJs.length) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorite DJs Yet</h3>
        <p className="text-gray-500">Start exploring DJs and add them to your favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Your Favorite DJs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteDJs.map((dj) => (
          <div 
            key={dj.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={dj.imageUrl || '/images/default-dj.jpg'}
                alt={dj.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{dj.name}</h3>
                <Star 
                  className="h-5 w-5 text-yellow-400 cursor-pointer" 
                  onClick={() => handleUnfavorite(dj.id)}
                />
              </div>
              <p className="text-gray-600 mb-2">{dj.genre}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{dj.location}</span>
                <button 
                  onClick={() => window.open(`/dj/${dj.id}`, '_blank')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  View Profile
                  <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}