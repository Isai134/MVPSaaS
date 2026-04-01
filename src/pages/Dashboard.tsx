import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import PaymentStatusChart from '@/components/dashboard/PaymentStatusChart';
import RecentPaymentsTable from '@/components/dashboard/RecentPaymentsTable';

/**
 * The dashboard shows high‑level metrics about the school, such as the
 * number of students and the status of recent payments.  It uses
 * React Query to fetch data from Supabase and displays loading
 * indicators while queries are in flight.  This page serves as the
 * primary landing page after logging in.
 */
export default function Dashboard() {
  const { isLoading: authLoading, profile } = useAuth();

  // Count total students
  const {
    data: studentsCount,
    isLoading: loadingStudents,
  } = useQuery({
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

  // Summarize payment statuses
  const {
    data: paymentsSummary,
    isLoading: loadingPayments,
  } = useQuery({
    queryKey: ['paymentsSummary', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('payments').select('status');
      if (error) throw error;
      const summary: Record<string, number> = {};
      (data ?? []).forEach((item: { status: string }) => {
        summary[item.status] = (summary[item.status] ?? 0) + 1;
      });
      return summary;
    },
    enabled: !!profile?.school_id,
  });

  // Fetch recent payments (latest 5)
  const {
    data: recentPayments,
    isLoading: loadingRecent,
  } = useQuery({
    queryKey: ['recentPayments', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  if (authLoading) {
    return <p className="p-4">Cargando…</p>;
  }

  const totalPayments = Object.values(paymentsSummary ?? {}).reduce(
    (acc, value) => acc + value,
    0,
  );

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido a tu Panel!</h1>
        <p className="text-blue-100">
          Aquí puedes ver un resumen de tu actividad académica y administrativa.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Alumnos" value={loadingStudents ? '—' : studentsCount} />
        <StatCard label="Pagos" value={loadingPayments ? '—' : totalPayments} />
        <StatCard
          label="Pendientes"
          value={loadingPayments ? '—' : paymentsSummary?.pendiente ?? 0}
        />
        <StatCard
          label="Vencidos"
          value={loadingPayments ? '—' : paymentsSummary?.vencido ?? 0}
        />
      </div>

      {/* Charts & tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentStatusChart summary={paymentsSummary ?? {}} />
        <RecentPaymentsTable payments={recentPayments ?? []} />
      </div>
    </div>
  );
}
