import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Users, CreditCard, BarChart3, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Users,
    title: 'Gestión de Alumnos',
    description: 'Administra expedientes, inscripciones y seguimiento académico de todos tus estudiantes.',
  },
  {
    icon: CreditCard,
    title: 'Control de Pagos',
    description: 'Sistema de cobranza con registro de pagos en un clic, becas y reportes financieros.',
  },
  {
    icon: GraduationCap,
    title: 'Calificaciones',
    description: 'Captura de calificaciones por periodo, boletas automáticas y promedios.',
  },
  {
    icon: BarChart3,
    title: 'Reportes Ejecutivos',
    description: 'Dashboards con KPIs, morosidad, ingresos y métricas clave en tiempo real.',
  },
  {
    icon: Shield,
    title: 'Roles y Permisos',
    description: 'Sistema RBAC con permisos granulares para cada tipo de usuario.',
  },
  {
    icon: Clock,
    title: 'Ciclos y Reinscripción',
    description: 'Gestión de ciclos escolares y flujos masivos de reinscripción.',
  },
];

export default function Index() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <GraduationCap className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EscuelaPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login" className="…">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link to="/signup" className="…">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Sistema de Gestión Escolar Seguro
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Administra tu escuela de forma{' '}
            <span className="text-accent">moderna y eficiente</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma integral para la gestión de alumnos, pagos, calificaciones y más. 
            Todo en un solo lugar, fácil de usar y seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/login">Comenzar Ahora</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-muted-foreground text-lg">
              Herramientas diseñadas para simplificar la administración escolar
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para modernizar tu escuela?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Únete a cientos de instituciones que ya confían en EscuelaPro para 
              administrar sus procesos escolares de manera eficiente.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/login">Comenzar Gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">EscuelaPro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 EscuelaPro. Sistema de Gestión Escolar.
          </p>
        </div>
      </footer>
    </div>
  );
}
