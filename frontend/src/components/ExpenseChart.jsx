import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

const CATEGORY_COLORS = {
  Food: '#ff6b6b',
  Transport: '#4ecdc4',
  Entertainment: '#a78bfa',
  Shopping: '#f472b6',
  Bills: '#fbbf24',
  Health: '#34d399',
  Education: '#60a5fa',
  Other: '#94a3b8',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-value">
          ₹{data.value.toLocaleString('en-IN')}
        </p>
        <p className="tooltip-percent">{(data.payload.percent * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const ExpenseChart = ({ transactions }) => {
  // Filter only expenses for the pie chart
  const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);

  // Aggregate by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const totalAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      percent: totalAmount > 0 ? value / totalAmount : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass-card chart-card" id="expense-chart-card">
      <div className="card-header-custom">
        <FiPieChart className="card-header-icon" />
        <h3>Spending Breakdown</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <p>No data to visualize</p>
          <span>Start adding expenses to see your chart</span>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={10}
                formatter={(value) => <span className="legend-text">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-center-label">
            <span className="center-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
            <span className="center-sub">Expenses</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
