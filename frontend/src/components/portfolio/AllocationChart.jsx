import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiPieChart } from 'react-icons/fi';

const ASSET_COLORS = {
  BTC: '#f7931a',
  GOLD: '#ffd700',
  NIFTY50: '#00d2ff',
};

const ASSET_LABELS = {
  BTC: 'Bitcoin',
  GOLD: 'Gold ETF',
  NIFTY50: 'Nifty 50',
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

const AllocationChart = ({ holdings }) => {
  const chartData = holdings
    .filter((h) => h.currentValue > 0)
    .map((h) => ({
      name: ASSET_LABELS[h.assetId] || h.assetId,
      value: Math.round(h.currentValue * 100) / 100,
      assetId: h.assetId,
      percent: 0,
    }));

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  chartData.forEach((d) => {
    d.percent = totalValue > 0 ? d.value / totalValue : 0;
  });

  return (
    <div className="glass-card chart-card" id="allocation-chart-card">
      <div className="card-header-custom">
        <FiPieChart className="card-header-icon" />
        <h3>Portfolio Allocation</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No allocations yet</p>
          <span>Add investments to see your portfolio breakdown</span>
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
                    key={entry.assetId}
                    fill={ASSET_COLORS[entry.assetId] || '#94a3b8'}
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
            <span className="center-amount">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className="center-sub">Portfolio</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocationChart;
