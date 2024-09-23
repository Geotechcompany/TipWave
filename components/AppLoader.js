import React from "react";

export const AppLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping-slow"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-2 bg-white rounded-full animate-pulse-slow"></div>
      </div>
    </div>
  );
};
