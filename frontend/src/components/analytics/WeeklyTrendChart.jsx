import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-ink-100 font-medium">
        Week {d.week}, {d.year}
      </p>
      <p className="text-emerald-400 figure">
        {currency} {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
};

const WeeklyTrendChart = ({ data, currency = 'USD' }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink-500 text-center py-16">No weekly data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#6B7684', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6B7684', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Area type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} fill="url(#areaGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default WeeklyTrendChart;