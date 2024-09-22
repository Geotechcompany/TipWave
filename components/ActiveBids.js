import React from 'react';
import { format } from 'date-fns';

const ActiveBids = ({ activeBids }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Song</th>
            <th className="py-3 px-6 text-left">Artist</th>
            <th className="py-3 px-6 text-center">Bid Amount</th>
            <th className="py-3 px-6 text-center">Status</th>
            <th className="py-3 px-6 text-center">Date</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {activeBids.map((bid) => (
            <tr key={bid.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{bid.song.title}</td>
              <td className="py-3 px-6 text-left">{bid.song.artist}</td>
              <td className="py-3 px-6 text-center">${bid.amount.toFixed(2)}</td>
              <td className="py-3 px-6 text-center">
                <span className={`${
                  bid.status === 'ACCEPTED' ? 'bg-green-200 text-green-600' :
                  bid.status === 'REJECTED' ? 'bg-red-200 text-red-600' :
                  'bg-yellow-200 text-yellow-600'
                } py-1 px-3 rounded-full text-xs`}>
                  {bid.status}
                </span>
              </td>
              <td className="py-3 px-6 text-center">{format(new Date(bid.createdAt), 'MMM d, yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveBids;