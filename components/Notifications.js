import React from 'react';
import { Bell } from 'lucide-react';

const Notifications = () => {
  return (
    <button className="relative p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400">
      <Bell size={24} />
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        3
      </span>
    </button>
  );
};

export default Notifications;