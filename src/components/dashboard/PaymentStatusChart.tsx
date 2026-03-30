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
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">No hay datos de pagos.</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-sm text-gray-500 mb-2">Resumen de pagos</h2>
      <ul className="space-y-1 text-sm">
        {statuses.map((status) => (
          <li key={status} className="flex justify-between">
            <span className="capitalize">{status.replace('_', ' ')}</span>
            <span className="font-medium">{summary[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
