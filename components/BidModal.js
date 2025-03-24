import React, { useState } from "react";
import { X } from "lucide-react";
import toast from 'react-hot-toast';
import Image from 'next/image';

const DEFAULT_ALBUM_ART = 'https://i.scdn.co/image/ab67616d0000b273c5716278e04baa78274ff6cc';

export default function BidModal({ isOpen, onClose, onSubmit, song, isSubmitting }) {
  const [bidAmount, setBidAmount] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }
    onSubmit(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Place a Bid</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={song?.albumArt || DEFAULT_ALBUM_ART}
              alt={song?.name || 'Album Art'}
              width={64}
              height={64}
              className="rounded-md"
              onError={(e) => {
                e.target.src = DEFAULT_ALBUM_ART;
              }}
            />
            <div>
              <h3 className="font-medium">{song?.name}</h3>
              <p className="text-sm text-gray-500">{song?.artist}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Bid Amount ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter bid amount"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Bid..." : "Place Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
