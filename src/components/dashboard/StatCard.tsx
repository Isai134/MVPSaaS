import React from 'react';

/**
 * StatCard displays a single statistic (e.g. number of students or
 * pending payments) with a label.  It is used on the dashboard to
 * summarize key metrics at a glance.
 */
interface StatCardProps {
  label: string;
  value: React.ReactNode;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <h2 className="text-sm font-medium text-gray-600 mb-2">{label}</h2>
      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
}
