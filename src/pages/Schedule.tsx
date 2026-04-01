import React from 'react';

/**
 * Página de Horario
 * Muestra un horario semanal con datos ficticios.
 * Solo es accesible para roles administrativos (super_admin, directivo, administrativo)
 */
export default function Schedule() {
  // Datos de ejemplo para el horario semanal
  const schedule = [
    {
      time: '08:00 - 09:00',
      lunes: 'Matemáticas',
      martes: 'Biología',
      miercoles: 'Historia',
      jueves: 'Química',
      viernes: 'Inglés',
    },
    {
      time: '09:00 - 10:00',
      lunes: 'Física',
      martes: 'Matemáticas',
      miercoles: 'Geografía',
      jueves: 'Computación',
      viernes: 'Educación Física',
    },
    {
      time: '10:00 - 11:00',
      lunes: 'Historia',
      martes: 'Química',
      miercoles: 'Matemáticas',
      jueves: 'Arte',
      viernes: 'Civismo',
    },
    {
      time: '11:00 - 12:00',
      lunes: 'Computación',
      martes: 'Inglés',
      miercoles: 'Biología',
      jueves: 'Historia',
      viernes: 'Matemáticas',
    },
    {
      time: '12:00 - 13:00',
      lunes: 'Educación Física',
      martes: 'Arte',
      miercoles: 'Química',
      jueves: 'Geografía',
      viernes: 'Física',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Horario</h1>
      <p className="text-gray-600">
        Este horario es un ejemplo ficticio para demostrar la funcionalidad. Puede ser
        reemplazado con datos dinámicos en el futuro.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">Hora</th>
              <th className="px-4 py-2 border text-left">Lunes</th>
              <th className="px-4 py-2 border text-left">Martes</th>
              <th className="px-4 py-2 border text-left">Miércoles</th>
              <th className="px-4 py-2 border text-left">Jueves</th>
              <th className="px-4 py-2 border text-left">Viernes</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((row) => (
              <tr key={row.time} className="border-t">
                <td className="px-4 py-2 border font-medium">{row.time}</td>
                <td className="px-4 py-2 border">{row.lunes}</td>
                <td className="px-4 py-2 border">{row.martes}</td>
                <td className="px-4 py-2 border">{row.miercoles}</td>
                <td className="px-4 py-2 border">{row.jueves}</td>
                <td className="px-4 py-2 border">{row.viernes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}