import { Music, PlusCircle, UserCheck, Circle } from 'lucide-react';
import React from 'react';
import { ReactElement, ReactNode, JSX } from 'react';
import type { FC } from 'react';

export const formatTimeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'yesterday';
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatEventDate = (start: string | Date, end: string | Date) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };
  
  return `${startDate.toLocaleString('en-US', options)} - ${endDate.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit'
  })}`;
};

type ActivityType = 'PLAYED' | 'REQUEST' | 'RECOMMENDATION' | 'DEFAULT';

export const getActivityBackground = (type: string): string => {
  const backgrounds: Record<ActivityType, string> = {
    PLAYED: 'bg-blue-500/20',
    REQUEST: 'bg-green-500/20',
    RECOMMENDATION: 'bg-purple-500/20',
    DEFAULT: 'bg-gray-500/20'
  };
  return backgrounds[type as ActivityType] || backgrounds.DEFAULT;
};

interface ActivityIconProps {
  className: string;
}

export const getActivityIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'PLAYED':
      return React.createElement(Music, { className: "h-4 w-4 text-blue-400" });
    case 'REQUEST':
      return React.createElement(PlusCircle, { className: "h-4 w-4 text-green-400" });
    case 'RECOMMENDATION':
      return React.createElement(UserCheck, { className: "h-4 w-4 text-purple-400" });
    default:
      return React.createElement(Circle, { className: "h-4 w-4 text-gray-400" });
  }
}; 