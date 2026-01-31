import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PaymentStatusBadge } from '@/components/students/PaymentStatusBadge';
import { LevelBadge } from '@/components/students/LevelBadge';
import { 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock data for payment schedule
const mockPaymentSchedule = [
  { 
    id: '1',
    studentId: '1',
    studentName: 'María García López',
    level: 'Primaria',
    grade: '4°',
    group: 'A',
    concept: 'Colegiatura Enero 2025',
    amount: 3500,
    dueDate: '2025-01-15',
    status: 'pagado' as const,
    paidAmount: 3500,
    guardian: 'Roberto García',
    phone: '555-123-4567'
  },
  { 
    id: '2',
    studentId: '2',
    studentName: 'Carlos Hernández Ruiz',
    level: 'Secundaria',
    grade: '2°',
    group: 'B',
    concept: 'Colegiatura Enero 2025',
    amount: 4200,
    dueDate: '2025-01-15',
    status: 'pendiente' as const,
    paidAmount: 0,
    guardian: 'Ana Ruiz',
    phone: '555-234-5678'
  },
  { 
    id: '3',
    studentId: '3',
    studentName: 'Ana Martínez Soto',
    level: 'Kinder',
    grade: '3°',
    group: 'A',
    concept: 'Colegiatura Enero 2025',
    amount: 3200,
    dueDate: '2025-01-15',
    status: 'parcial' as const,
    paidAmount: 1600,
    guardian: 'Luis Martínez',
    phone: '555-345-6789'
  },
  { 
    id: '4',
    studentId: '4',
    studentName: 'Luis Rodríguez Pérez',
    level: 'Preparatoria',
    grade: '1°',
    group: 'A',
    concept: 'Colegiatura Diciembre 2024',
    amount: 4800,
    dueDate: '2024-12-15',
    status: 'vencido' as const,
    paidAmount: 0,
    guardian: 'María Pérez',
    phone: '555-456-7890'
  },
  { 
    id: '5',
    studentId: '5',
    studentName: 'Sofia Torres Luna',
    level: 'Primaria',
    grade: '6°',
    group: 'B',
    concept: 'Colegiatura Enero 2025',
    amount: 3500,
    dueDate: '2025-01-15',
    status: 'pagado' as const,
    paidAmount: 3500,
    guardian: 'Carmen Luna',
    phone: '555-567-8901'
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPaymentSchedule[0] | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  const filteredPayments = mockPaymentSchedule.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.guardian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || payment.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const stats = {
    total: mockPaymentSchedule.length,
    pagado: mockPaymentSchedule.filter(p => p.status === 'pagado').length,
    pendiente: mockPaymentSchedule.filter(p => p.status === 'pendiente').length,
    vencido: mockPaymentSchedule.filter(p => p.status === 'vencido').length,
    totalAmount: mockPaymentSchedule.reduce((sum, p) => sum + p.amount, 0),
    collectedAmount: mockPaymentSchedule.reduce((sum, p) => sum + p.paidAmount, 0),
  };

  const handleRegisterPayment = () => {
    if (!selectedPayment || !paymentAmount) return;
    
    toast.success('Pago registrado correctamente', {
      description: `Se registró un pago de ${formatCurrency(Number(paymentAmount))} para ${selectedPayment.studentName}`,
    });
    
    setPaymentDialogOpen(false);
    setSelectedPayment(null);
    setPaymentAmount('');
    setPaymentMethod('efectivo');
  };

  const openPaymentDialog = (payment: typeof mockPaymentSchedule[0]) => {
    setSelectedPayment(payment);
    setPaymentAmount(String(payment.amount - payment.paidAmount));
    setPaymentDialogOpen(true);
  };

  return (
    <AppLayout
      title="Cobranza"
      description="Gestión de pagos y estado de cuenta"
      actions={
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Por Cobrar</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalAmount - stats.collectedAmount)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Al Corriente</p>
                <p className="text-xl font-bold">{stats.pagado} alumnos</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-xl font-bold">{stats.pendiente} alumnos</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-xl font-bold">{stats.vencido} alumnos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Cobranza del Mes</TabsTrigger>
            <TabsTrigger value="history">Historial de Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por alumno o tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="Kinder">Kinder</SelectItem>
                    <SelectItem value="Primaria">Primaria</SelectItem>
                    <SelectItem value="Secundaria">Secundaria</SelectItem>
                    <SelectItem value="Preparatoria">Preparatoria</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Nivel / Grado</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No se encontraron pagos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow 
                        key={payment.id} 
                        className={cn(
                          "table-row-hover",
                          payment.status === 'vencido' && "bg-red-50"
                        )}
                      >
                        <TableCell className="font-medium">{payment.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <LevelBadge level={payment.level} />
                            <span className="text-sm text-muted-foreground">
                              {payment.grade} {payment.group}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{payment.concept}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.paidAmount)}
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={payment.status} />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{payment.guardian}</p>
                            <p className="text-xs text-muted-foreground">{payment.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.status !== 'pagado' && (
                            <Button 
                              size="sm" 
                              onClick={() => openPaymentDialog(payment)}
                            >
                              Cobrar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
              <p>El historial de pagos se mostrará aquí</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pago</DialogTitle>
              <DialogDescription>
                {selectedPayment && (
                  <>
                    Registrar pago para <strong>{selectedPayment.studentName}</strong>
                    <br />
                    Concepto: {selectedPayment.concept}
                    <br />
                    Adeudo: {formatCurrency(selectedPayment.amount - selectedPayment.paidAmount)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto a pagar</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">Método de pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia / Folio (opcional)</Label>
                <Input
                  id="reference"
                  placeholder="Número de referencia"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterPayment}>
                Registrar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
