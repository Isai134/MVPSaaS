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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LevelBadge } from '@/components/students/LevelBadge';
import { 
  Search, 
  Save,
  Send,
  BookOpen,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data for grade capture
const mockSubjects = [
  { id: '1', name: 'Español', code: 'ESP' },
  { id: '2', name: 'Matemáticas', code: 'MAT' },
  { id: '3', name: 'Ciencias Naturales', code: 'CN' },
  { id: '4', name: 'Historia', code: 'HIS' },
  { id: '5', name: 'Inglés', code: 'ING' },
];

const mockStudentsGrades = [
  { 
    id: '1', 
    studentName: 'María García López',
    grades: { '1': 9.5, '2': 8.0, '3': 9.0, '4': 8.5, '5': 9.2 }
  },
  { 
    id: '2', 
    studentName: 'Carlos Hernández Ruiz',
    grades: { '1': 7.5, '2': 9.0, '3': 8.0, '4': 7.0, '5': 8.5 }
  },
  { 
    id: '3', 
    studentName: 'Ana Martínez Soto',
    grades: { '1': 10, '2': 9.5, '3': 9.8, '4': 9.0, '5': 10 }
  },
  { 
    id: '4', 
    studentName: 'Luis Rodríguez Pérez',
    grades: { '1': 6.5, '2': 7.0, '3': 6.0, '4': 6.5, '5': 7.5 }
  },
  { 
    id: '5', 
    studentName: 'Sofia Torres Luna',
    grades: { '1': 8.5, '2': 8.0, '3': 9.0, '4': 8.5, '5': 8.0 }
  },
];

const mockGradebooks = [
  { id: '1', subject: 'Español', group: '4° A Primaria', period: '1er Bimestre', status: 'borrador', students: 28 },
  { id: '2', subject: 'Matemáticas', group: '4° A Primaria', period: '1er Bimestre', status: 'publicado', students: 28 },
  { id: '3', subject: 'Español', group: '4° B Primaria', period: '1er Bimestre', status: 'borrador', students: 26 },
  { id: '4', subject: 'Ciencias', group: '2° A Secundaria', period: '1er Bimestre', status: 'borrador', students: 32 },
];

export default function Grades() {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1');
  const [grades, setGrades] = useState<Record<string, Record<string, number>>>({});
  const [viewMode, setViewMode] = useState<'list' | 'capture'>('list');

  const handleGradeChange = (studentId: string, subjectId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) return;
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: numValue
      }
    }));
  };

  const handleSaveGrades = () => {
    toast.success('Calificaciones guardadas', {
      description: 'Las calificaciones se han guardado como borrador'
    });
  };

  const handlePublishGrades = () => {
    toast.success('Calificaciones publicadas', {
      description: 'Las calificaciones ahora están visibles para padres y alumnos'
    });
  };

  const calculateAverage = (studentGrades: Record<string, number>) => {
    const values = Object.values(studentGrades).filter(v => v !== undefined);
    if (values.length === 0) return '-';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  };

  const getGradeColor = (grade: number | undefined) => {
    if (grade === undefined) return '';
    if (grade >= 9) return 'text-green-600 font-semibold';
    if (grade >= 7) return 'text-blue-600';
    if (grade >= 6) return 'text-yellow-600';
    return 'text-red-600 font-semibold';
  };

  return (
    <AppLayout
      title="Calificaciones"
      description="Captura y consulta de calificaciones"
    >
      <div className="space-y-6 animate-fade-in">
        {viewMode === 'list' ? (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mis Grupos</p>
                      <p className="text-xl font-bold">4</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Publicadas</p>
                      <p className="text-xl font-bold">1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Borradores</p>
                      <p className="text-xl font-bold">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Alumnos</p>
                      <p className="text-xl font-bold">114</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gradebooks List */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Libros de Calificaciones</CardTitle>
                <CardDescription>Selecciona un grupo para capturar o editar calificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGradebooks.map((gradebook) => (
                    <div 
                      key={gradebook.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setViewMode('capture')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{gradebook.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {gradebook.group} • {gradebook.period}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {gradebook.students} alumnos
                        </span>
                        <Badge 
                          variant={gradebook.status === 'publicado' ? 'default' : 'secondary'}
                          className={gradebook.status === 'publicado' ? 'bg-green-500' : ''}
                        >
                          {gradebook.status === 'publicado' ? 'Publicado' : 'Borrador'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Grade Capture View */}
            <div className="flex items-center justify-between">
              <div>
                <Button variant="ghost" onClick={() => setViewMode('list')} className="mb-2">
                  ← Volver a la lista
                </Button>
                <h2 className="text-lg font-semibold">Español - 4° A Primaria</h2>
                <p className="text-sm text-muted-foreground">1er Bimestre - Ciclo 2024-2025</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveGrades}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Borrador
                </Button>
                <Button onClick={handlePublishGrades}>
                  <Send className="mr-2 h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 min-w-[200px]">Alumno</TableHead>
                    {mockSubjects.map(subject => (
                      <TableHead key={subject.id} className="text-center min-w-[100px]">
                        {subject.code}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentsGrades.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-card font-medium">
                        {student.studentName}
                      </TableCell>
                      {mockSubjects.map(subject => (
                        <TableCell key={subject.id} className="text-center p-1">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            className={cn(
                              "w-16 text-center mx-auto",
                              getGradeColor(grades[student.id]?.[subject.id] ?? student.grades[subject.id])
                            )}
                            defaultValue={student.grades[subject.id]}
                            onChange={(e) => handleGradeChange(student.id, subject.id, e.target.value)}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">
                        {calculateAverage(grades[student.id] || student.grades)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Excelente (9-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Bien (7-8.9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Suficiente (6-6.9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>No Aprobado (&lt;6)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
