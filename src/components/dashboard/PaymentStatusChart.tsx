import React from 'react';

interface PaymentStatusChartProps {
  summary: Record<string, number>;
}

/**
 * PaymentStatusChart provides a simple textual representation of the
 * distribution of payment statuses.  A more sophisticated chart could
 * use a library like Recharts or Chart.js; for now we list each status
 * with its count.
 */
export default function PaymentStatusChart({ summary }: PaymentStatusChartProps) {
  const statuses = Object.keys(summary);
  if (statuses.length === 0) {
    return (
      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <p className="text-sm text-gray-500">No hay datos de pagos.</p>
      </div>
    );
  }
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de pagos</h2>
      <ul className="space-y-3">
        {statuses.map((status) => (
          <li key={status} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-lg">
            <span className="capitalize text-gray-700 font-medium">{status.replace('_', ' ')}</span>
            <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {summary[status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
