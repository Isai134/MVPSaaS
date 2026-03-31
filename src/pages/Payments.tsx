import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PaymentChart from '@/components/payments/PaymentChart';
import RecentPaymentsTable from '@/components/dashboard/RecentPaymentsTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Payments page provides a comprehensive view of all payment records for
 * the current school.  It fetches data from Supabase using React
 * Query, summarises statuses in a pie chart, and lists recent
 * transactions.  Future iterations should add forms to create and
 * edit payments, as well as more advanced filtering and export
 * functionality.
 */
export default function Payments() {
  const { profile } = useAuth();

  // State for Add Payment modal and form fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [creating, setCreating] = useState(false);

  // Query to fetch all payments for the school, ordered by creation date.
  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payments', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id,
  });

  // Derive a summary of payment statuses for the chart.
  const paymentsSummary = React.useMemo(() => {
    const summary: Record<string, number> = {};
    (payments ?? []).forEach((p) => {
      summary[p.status] = (summary[p.status] ?? 0) + 1;
    });
    return summary;
  }, [payments]);

  // Fetch students for the dropdown when adding payments
  const {
    data: studentOptions,
    isLoading: loadingStudents,
    error: errorStudents,
  } = useQuery({
    queryKey: ['studentsList', profile?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile?.school_id && showAddModal,
  });

  const queryClient = useQueryClient();

  // Handler to create a new payment
  const handleAddPayment = async () => {
    if (!profile?.school_id || !studentId) return;
    try {
      setCreating(true);
      const { error } = await supabase.from('payments').insert({
        school_id: profile.school_id,
        student_id: studentId,
        amount: parseFloat(amount),
        concept,
        status: status as any,
        due_date: dueDate,
      });
      if (error) throw error;
      setStudentId('');
      setConcept('');
      setAmount('');
      setDueDate('');
      setStatus('pendiente');
      setShowAddModal(false);
      queryClient.invalidateQueries(['payments', profile.school_id]);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pagos</h1>
      {/* Add Payment Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddModal(true)}>Agregar pago</Button>
      </div>
      {isLoading ? (
        <p>Cargando pagos…</p>
      ) : error ? (
        <p className="text-red-600">Error al cargar pagos</p>
      ) : (
        <>
          {/* Chart summarising payment statuses */}
          <PaymentChart summary={paymentsSummary} />
          {/* List recent payments or full list; reuse the recent table component */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Pagos recientes</h2>
            <RecentPaymentsTable payments={payments ?? []} />
          </div>
        </>
      )}
      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Agregar nuevo pago</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="student">
                Alumno
              </label>
              {loadingStudents || errorStudents ? (
                <p>Cargando alumnos…</p>
              ) : (
                <select
                  id="student"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={creating}
                >
                  <option value="">Selecciona un alumno</option>
                  {(studentOptions ?? []).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="concept">
                Concepto
              </label>
              <Input
                id="concept"
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="amount">
                Importe
              </label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="dueDate">
                Fecha de vencimiento
              </label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={creating}
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="parcial">Parcial</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddPayment}
                disabled={creating || !studentId || !concept || !amount || !dueDate}
              >
                {creating ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
