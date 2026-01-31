import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface PaymentStatusChartProps {
  data: PaymentStatusData[];
}

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4">
        <h3 className="font-semibold">Estado de Pagos del Mes</h3>
        <p className="text-sm text-muted-foreground">Distribución de cobranza</p>
      </div>
      
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = ((data.value / total) * 100).toFixed(1);
                  return (
                    <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.value} alumnos ({percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">
              {item.name}: <span className="font-medium">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
