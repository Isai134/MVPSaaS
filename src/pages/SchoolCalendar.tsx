import React from 'react';

/**
 * Página de Calendario Escolar
 * Lista eventos del calendario escolar con fechas y descripciones ficticias.
 * Solo es accesible para roles administrativos.
 */
export default function SchoolCalendar() {
  // Eventos de ejemplo para el calendario escolar
  const events = [
    {
      date: new Date(2026, 0, 15), // 15 de enero 2026
      title: 'Inicio de clases',
      description: 'Comienzo del semestre de primavera.',
    },
    {
      date: new Date(2026, 2, 18), // 18 de marzo 2026
      title: 'Día festivo',
      description: 'Suspensión de labores por aniversario de la expropiación petrolera.',
    },
    {
      date: new Date(2026, 3, 1), // 1 de abril 2026
      title: 'Entrega de boletas',
      description: 'Entrega de boletas de calificaciones parciales.',
    },
    {
      date: new Date(2026, 4, 1), // 1 de mayo 2026
      title: 'Día del Trabajo',
      description: 'No hay clases por el día del trabajo.',
    },
    {
      date: new Date(2026, 5, 15), // 15 de junio 2026
      title: 'Fin de cursos',
      description: 'Finalización del semestre de primavera.',
    },
  ];

  // Ordena eventos por fecha ascendente
  const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendario escolar</h1>
      <p className="text-gray-600">
        A continuación se muestran algunos eventos importantes del calendario escolar. Estos datos son de ejemplo y pueden
        modificarse para reflejar eventos reales.
      </p>
      <div className="grid gap-4">
        {sortedEvents.map((event, index) => {
          const formattedDate = event.date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          return (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 space-y-1"
            >
              <h2 className="text-xl font-semibold">{formattedDate}</h2>
              <p className="font-medium">{event.title}</p>
              {event.description && <p className="text-gray-600">{event.description}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}