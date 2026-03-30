import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { isLoading: authLoading, profile } = useAuth();

  const { data: studentsCount, isLoading: loadingStudents } = useQuery({
    queryKey: ['studentsCount', profile?.school_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!profile?.school_id,
  });

  const { data: paymentsSummary, isLoading: loadingPayments } = useQuery({
    queryKey: ['paymentsSummary', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('status');

      if (error) throw error;

      const summary = (data ?? []).reduce(
        (acc: Record<string, number>, item: { status: string }) => {
          acc[item.status] = (acc[item.status] ?? 0) + 1;
          return acc;
        },
        {}
      );

      return summary;
    },
    enabled: !!profile?.school_id,
  });

  if (authLoading) {
    return <p className="p-4">Cargando...</p>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Alumnos</h2>
          <p className="text-2xl font-semibold">
            {loadingStudents ? '—' : studentsCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Pagos</h2>
          <p className="text-2xl font-semibold">
            {loadingPayments
              ? '—'
              : Object.values(paymentsSummary ?? {}).reduce(
                  (acc, value) => acc + value,
                  0
                )}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Pendientes</h2>
          <p className="text-2xl font-semibold">
            {loadingPayments ? '—' : paymentsSummary?.pendiente ?? 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Vencidos</h2>
          <p className="text-2xl font-semibold">
            {loadingPayments ? '—' : paymentsSummary?.vencido ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}