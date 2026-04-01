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
      <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <p className="text-sm text-gray-500">No hay pagos recientes.</p>
      </div>
    );
  }
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50">
        <h2 className="text-lg font-semibold text-gray-800">Pagos recientes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/30">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Concepto</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Importe</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-gray-200/30">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-blue-50/30 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.concept}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    payment.status === 'pagado'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
