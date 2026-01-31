import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paymentStatusColors, PaymentStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface RecentPayment {
  id: string;
  studentName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  concept: string;
}

interface RecentPaymentsTableProps {
  payments: RecentPayment[];
}

const statusLabels: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  parcial: 'Parcial',
  vencido: 'Vencido',
  condonado: 'Condonado',
};

export function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Pagos Recientes</h3>
        <p className="text-sm text-muted-foreground">Últimos movimientos registrados</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No hay pagos registrados
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id} className="table-row-hover">
                <TableCell className="font-medium">{payment.studentName}</TableCell>
                <TableCell className="text-muted-foreground">{payment.concept}</TableCell>
                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={cn("text-xs", paymentStatusColors[payment.status])}
                  >
                    {statusLabels[payment.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(payment.date), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
