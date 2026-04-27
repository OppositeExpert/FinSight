import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="tooltip-value"
            style={{ color: entry.name === 'totalValue' ? '#00d2ff' : '#8b92b3' }}
          >
            {entry.name === 'totalValue' ? '📈 Portfolio' : '💰 Invested'}: ₹
            {entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ data }) => {
  const chartData = data.map((item) => {
    const d = new Date(item.date);
    return {
      ...item,
      label: `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    };
  });

  return (
    <div className="glass-card chart-card" id="performance-chart-card">
      <div className="card-header-custom">
        <FiTrendingUp className="card-header-icon" />
        <h3>Performance Over Time</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p>No performance data yet</p>
          <span>Add investments to see your portfolio growth</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7b2ff7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7b2ff7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#8b92b3', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#8b92b3', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
                if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
                if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
                return `₹${v}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="legend-text">
                  {value === 'totalValue' ? 'Portfolio Value' : 'Invested Amount'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="investedAmount"
              stroke="#7b2ff7"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#investedGrad)"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#00d2ff"
              strokeWidth={2.5}
              fill="url(#portfolioGrad)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PerformanceChart;
