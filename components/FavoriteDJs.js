import React from 'react';

const FavoriteDJs = () => {
  // This is a placeholder. You'll want to fetch real favorite DJs from your backend.
  const favoriteDJs = [
    { id: 1, name: 'DJ Awesome', genre: 'House' },
    { id: 2, name: 'DJ Cool', genre: 'Hip Hop' },
    { id: 3, name: 'DJ Amazing', genre: 'Techno' },
  ];

  return (
    <div className="space-y-4">
      {favoriteDJs.map((dj) => (
        <div key={dj.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div>
            <h3 className="font-bold">{dj.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{dj.genre}</p>
          </div>
          <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
};

export default FavoriteDJs;