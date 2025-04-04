import React from 'react';

export function ChartCard({ title, subtitle, chart }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
      {chart}
    </div>
  );
}