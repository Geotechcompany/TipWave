import React, { useState } from 'react';

const BidModal = ({ isOpen, onClose, onSubmit, currentBid = 0 }) => {
  const [bidAmount, setBidAmount] = useState(currentBid + 1);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(bidAmount);
    onClose();
  };

  return (
    <div className="bid-modal">
      <div className="bid-modal-content">
        <h2>Place Your Bid</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="bidAmount">Bid Amount:</label>
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={currentBid + 1}
            step="0.01"
            required
          />
          <button type="submit">Submit Bid</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default BidModal;
