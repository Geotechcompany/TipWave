import React from 'react';

const UserStats = ({ currency }) => {
  // This is a placeholder. You'll want to fetch real user stats from your backend.
  const stats = {
    totalBids: 15,
    wonBids: 8,
    totalSpent: 250,
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold">Total Bids</h3>
        <p className="text-2xl text-indigo-600 dark:text-indigo-400">{stats.totalBids}</p>
      </div>
      <div>
        <h3 className="font-bold">Won Bids</h3>
        <p className="text-2xl text-indigo-600 dark:text-indigo-400">{stats.wonBids}</p>
      </div>
      <div>
        <h3 className="font-bold">Total Spent</h3>
        <p className="text-2xl text-indigo-600 dark:text-indigo-400">
          {stats.totalSpent} {currency}
        </p>
      </div>
    </div>
  );
};

export default UserStats;