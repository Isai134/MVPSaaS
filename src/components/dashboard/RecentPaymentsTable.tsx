import React from 'react';
import type { Database } from '@/types/supabase';

interface RecentPaymentsTableProps {
  payments: Database['public']['Tables']['payments']['Row'][];
}

/**
 * RecentPaymentsTable shows a small list of the latest payments.  It
 * truncates the dataset for clarity; use the full Payments page for
 * detailed management.
 */
export default function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">No hay pagos recientes.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Importe</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap">{payment.concept}</td>
              <td className="px-4 py-2 whitespace-nowrap">${payment.amount.toFixed(2)}</td>
              <td className="px-4 py-2 whitespace-nowrap capitalize">{payment.status.replace('_', ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
