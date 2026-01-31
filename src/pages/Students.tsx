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
import { StudentStatusBadge } from '@/components/students/StudentStatusBadge';
import { PaymentStatusBadge } from '@/components/students/PaymentStatusBadge';
import { LevelBadge } from '@/components/students/LevelBadge';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Mock data
const mockStudents = [
  { 
    id: '1', 
    code: 'A2024-001', 
    firstName: 'María', 
    lastName: 'García López', 
    level: 'Primaria', 
    grade: '4°', 
    group: 'A',
    status: 'activo' as const, 
    paymentStatus: 'pagado' as const,
    guardian: 'Roberto García',
    phone: '555-123-4567',
    photoUrl: null
  },
  { 
    id: '2', 
    code: 'A2024-002', 
    firstName: 'Carlos', 
    lastName: 'Hernández Ruiz', 
    level: 'Secundaria', 
    grade: '2°', 
    group: 'B',
    status: 'activo' as const, 
    paymentStatus: 'pendiente' as const,
    guardian: 'Ana Ruiz',
    phone: '555-234-5678',
    photoUrl: null
  },
  { 
    id: '3', 
    code: 'A2024-003', 
    firstName: 'Ana', 
    lastName: 'Martínez Soto', 
    level: 'Kinder', 
    grade: '3°', 
    group: 'A',
    status: 'activo' as const, 
    paymentStatus: 'parcial' as const,
    guardian: 'Luis Martínez',
    phone: '555-345-6789',
    photoUrl: null
  },
  { 
    id: '4', 
    code: 'A2024-004', 
    firstName: 'Luis', 
    lastName: 'Rodríguez Pérez', 
    level: 'Preparatoria', 
    grade: '1°', 
    group: 'A',
    status: 'por_reinscribir' as const, 
    paymentStatus: 'vencido' as const,
    guardian: 'María Pérez',
    phone: '555-456-7890',
    photoUrl: null
  },
  { 
    id: '5', 
    code: 'A2024-005', 
    firstName: 'Sofia', 
    lastName: 'Torres Luna', 
    level: 'Primaria', 
    grade: '6°', 
    group: 'B',
    status: 'activo' as const, 
    paymentStatus: 'pagado' as const,
    guardian: 'Carmen Luna',
    phone: '555-567-8901',
    photoUrl: null
  },
];

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout
      title="Alumnos"
      description="Gestión de alumnos inscritos"
      actions={
        <Button asChild>
          <Link to="/students/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Alumno
          </Link>
        </Button>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o matrícula..."
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
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="por_reinscribir">Por Reinscribir</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedStudents.length} alumno(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Registrar Pago
              </Button>
              <Button variant="outline" size="sm">
                Enviar Aviso
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Alumno</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nivel / Grado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cobranza</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No se encontraron alumnos
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="table-row-hover">
                    <TableCell>
                      <Checkbox 
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleSelect(student.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.photoUrl || undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{student.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LevelBadge level={student.level} />
                        <span className="text-sm text-muted-foreground">
                          {student.grade} {student.group}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StudentStatusBadge status={student.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={student.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.guardian}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/students/${student.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Ficha
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/students/${student.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/payments?student=${student.id}`}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Registrar Pago
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredStudents.length} de {mockStudents.length} alumnos
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
