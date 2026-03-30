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
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-sm text-gray-500">{label}</h2>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
