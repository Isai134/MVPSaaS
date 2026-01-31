import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentPaymentsTable } from '@/components/dashboard/RecentPaymentsTable';
import { PaymentStatusChart } from '@/components/dashboard/PaymentStatusChart';
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  GraduationCap,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockPayments = [
  { id: '1', studentName: 'María García López', amount: 3500, status: 'pagado' as const, date: new Date().toISOString(), concept: 'Colegiatura Enero' },
  { id: '2', studentName: 'Carlos Hernández', amount: 3500, status: 'pendiente' as const, date: new Date(Date.now() - 86400000).toISOString(), concept: 'Colegiatura Enero' },
  { id: '3', studentName: 'Ana Martínez', amount: 1750, status: 'parcial' as const, date: new Date(Date.now() - 172800000).toISOString(), concept: 'Colegiatura Enero' },
  { id: '4', studentName: 'Luis Rodríguez', amount: 3500, status: 'vencido' as const, date: new Date(Date.now() - 604800000).toISOString(), concept: 'Colegiatura Diciembre' },
  { id: '5', studentName: 'Sofia Torres', amount: 3500, status: 'pagado' as const, date: new Date(Date.now() - 259200000).toISOString(), concept: 'Colegiatura Enero' },
];

const paymentChartData = [
  { name: 'Al corriente', value: 156, color: '#22c55e' },
  { name: 'Pendiente', value: 42, color: '#eab308' },
  { name: 'Vencido', value: 18, color: '#ef4444' },
  { name: 'Parcial', value: 8, color: '#3b82f6' },
];

export default function Dashboard() {
  return (
    <AppLayout
      title="Dashboard"
      description="Resumen general del sistema escolar"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/reports">Ver Reportes</Link>
          </Button>
          <Button asChild>
            <Link to="/payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Registrar Pago
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Alumnos"
            value="224"
            description="Activos este ciclo"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 5.2, isPositive: true }}
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Pagos del Mes"
            value="$547,000"
            description="156 pagos registrados"
            icon={<CreditCard className="h-5 w-5" />}
            trend={{ value: 12.5, isPositive: true }}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatCard
            title="Por Cobrar"
            value="$210,000"
            description="60 adeudos pendientes"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconClassName="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            title="Tasa de Cobranza"
            value="72.3%"
            description="Meta: 85%"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: 3.1, isPositive: true }}
            iconClassName="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Calificaciones Pendientes"
            value="12"
            description="Por publicar este bimestre"
            icon={<GraduationCap className="h-5 w-5" />}
            iconClassName="bg-orange-100 text-orange-600"
          />
          <StatCard
            title="Documentos Faltantes"
            value="34"
            description="Alumnos con expediente incompleto"
            icon={<FileCheck className="h-5 w-5" />}
            iconClassName="bg-red-100 text-red-600"
          />
          <StatCard
            title="Por Reinscribir"
            value="45"
            description="Alumnos pendientes ciclo 2025-2026"
            icon={<Users className="h-5 w-5" />}
            iconClassName="bg-teal-100 text-teal-600"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentPaymentsTable payments={mockPayments} />
          </div>
          <div>
            <PaymentStatusChart data={paymentChartData} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/students/new">
                <Users className="h-5 w-5" />
                <span>Nuevo Alumno</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/payments">
                <CreditCard className="h-5 w-5" />
                <span>Registrar Pago</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/grades">
                <GraduationCap className="h-5 w-5" />
                <span>Capturar Calificaciones</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/announcements/new">
                <FileCheck className="h-5 w-5" />
                <span>Nuevo Aviso</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
