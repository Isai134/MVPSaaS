import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface PaymentChartProps {
  summary: Record<string, number>;
}

// Define a color palette for the chart segments.  Use distinct colors but
// avoid specifying explicit names that may clash with Tailwind.  The
// default colors will be used by Recharts.
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * PaymentChart renders a pie chart summarising the distribution of payment
 * statuses using Recharts.  This improves visual appeal over the basic
 * text list.  The summary prop should be an object where keys are
 * statuses (e.g. 'pagado', 'pendiente') and values are counts.
 */
export default function PaymentChart({ summary }: PaymentChartProps) {
  const data = Object.entries(summary).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
  }));

  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">
          No hay datos de pagos para mostrar gráficamente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col items-center">
      <h2 className="text-sm text-gray-500 mb-4">Distribución de pagos</h2>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => `${value} pago${value !== 1 ? 's' : ''}`}
        />
        <Legend />
      </PieChart>
    </div>
  );
}