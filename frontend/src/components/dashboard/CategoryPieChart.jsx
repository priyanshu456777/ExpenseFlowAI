import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E', '#818CF8', '#34D399', '#FB7185'];

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-ink-100 font-medium">{item.name}</p>
      <p className="text-ink-400 figure">
        {currency} {item.value.toFixed(2)}
      </p>
    </div>
  );
};

const CategoryPieChart = ({ data, currency = 'USD' }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-500 text-center py-16">No category data yet.</p>;
  }

  const chartData = data.map((d) => ({ name: d.category, value: d.total }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          verticalAlign="bottom"
          height={48}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;