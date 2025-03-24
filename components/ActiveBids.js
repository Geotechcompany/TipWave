import React from 'react';
import { format } from 'date-fns';

const ActiveBids = ({ activeBids = [] }) => {
  if (!activeBids.length) {
    return <div className="text-center p-4">No active bids to display</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 text-left">Song</th>
            <th className="py-3 px-6 text-left">Artist</th>
            <th className="py-3 px-6 text-center">Amount</th>
            <th className="py-3 px-6 text-center">Status</th>
            <th className="py-3 px-6 text-center">Date</th>
          </tr>
        </thead>
        <tbody>
          {activeBids.map((bid) => (
            <tr key={bid.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-6 text-left">{bid.song?.title || 'Unknown Song'}</td>
              <td className="py-3 px-6 text-left">{bid.song?.artist || 'Unknown Artist'}</td>
              <td className="py-3 px-6 text-center">${bid.amount?.toFixed(2)}</td>
              <td className="py-3 px-6 text-center">
                <span className={`px-2 py-1 rounded ${
                  bid.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {bid.status}
                </span>
              </td>
              <td className="py-3 px-6 text-center">
                {format(new Date(bid.createdAt), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveBids;