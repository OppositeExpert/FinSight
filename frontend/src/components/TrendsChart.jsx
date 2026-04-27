import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="tooltip-value"
            style={{ color: entry.name === 'income' ? '#34d399' : '#ff6b6b' }}
          >
            {entry.name === 'income' ? '↑ Income' : '↓ Expense'}: ₹{entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const TrendsChart = ({ data }) => {
  const chartData = data.map((item) => ({
    ...item,
    label: MONTH_LABELS[parseInt(item.month.split('-')[1]) - 1] + ' ' + item.month.split('-')[0].slice(2),
  }));

  return (
    <div className="glass-card chart-card" id="trends-chart-card">
      <div className="card-header-custom">
        <FiTrendingUp className="card-header-icon" />
        <h3>Income vs Expense Trends</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p>No trend data yet</p>
          <span>Add transactions across multiple months</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#8b92b3', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8b92b3', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="legend-text">
                  {value === 'income' ? 'Income' : 'Expenses'}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ff6b6b"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendsChart;
