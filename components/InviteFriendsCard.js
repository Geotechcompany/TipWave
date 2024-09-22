import React, { useState } from 'react';
import Image from 'next/image';

const InviteFriendsCard = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/invite-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Invite sent successfully!');
        setEmail('');
      } else {
        setMessage('Failed to send invite. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-emerald-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Invite friends and get a free bid</h2>
        <Image src="/invite-friends-icon.png" alt="Invite Friends" width={64} height={64} />
      </div>
      <p className="mb-4">Invite your friends to join and enjoy a free bid on us!</p>
      <form onSubmit={handleInvite} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter friend's email"
          className="flex-grow px-4 py-2 rounded-l-md text-gray-800"
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 text-gray-800 px-4 py-2 rounded-r-md font-semibold hover:bg-yellow-400 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Invite'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default InviteFriendsCard;