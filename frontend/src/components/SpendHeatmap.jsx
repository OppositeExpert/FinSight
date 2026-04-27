import { FiGrid } from 'react-icons/fi';

const SpendHeatmap = ({ data, selectedMonth }) => {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card heatmap-card" id="spend-heatmap-card">
        <div className="card-header-custom">
          <FiGrid className="card-header-icon" />
          <h3>Daily Spend Heatmap</h3>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <p>No spending data</p>
          <span>Add expenses to see your heatmap</span>
        </div>
      </div>
    );
  }

  const maxSpend = Math.max(...data.map((d) => d.total), 1);

  // Get the day of week for the 1st of the month
  const [year, month] = selectedMonth.split('-').map(Number);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  const getIntensity = (total) => {
    if (total === 0) return 0;
    return Math.max(0.15, total / maxSpend);
  };

  const formatAmount = (val) => {
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  return (
    <div className="glass-card heatmap-card" id="spend-heatmap-card">
      <div className="card-header-custom">
        <FiGrid className="card-header-icon" />
        <h3>Daily Spend Heatmap</h3>
      </div>

      <div className="heatmap-grid-container">
        {/* Day-of-week headers */}
        <div className="heatmap-day-labels">
          {dayLabels.map((d) => (
            <span key={d} className="heatmap-day-label">{d}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="heatmap-grid">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="heatmap-cell heatmap-empty" />
          ))}

          {data.map((day) => {
            const intensity = getIntensity(day.total);
            const isToday = isCurrentMonth && today.getDate() === day.day;
            const isFuture = isCurrentMonth && day.day > today.getDate();

            return (
              <div
                key={day.day}
                className={`heatmap-cell ${isToday ? 'heatmap-today' : ''} ${isFuture ? 'heatmap-future' : ''}`}
                style={{
                  background: isFuture
                    ? 'rgba(255,255,255,0.02)'
                    : day.total > 0
                      ? `rgba(0, 210, 255, ${intensity})`
                      : 'rgba(255,255,255,0.03)',
                }}
                title={`${day.date}: ${day.total > 0 ? formatAmount(day.total) : 'No spending'} (${day.count} txn)`}
              >
                <span className="heatmap-day-num">{day.day}</span>
                {day.total > 0 && !isFuture && (
                  <span className="heatmap-amount">{formatAmount(day.total)}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Less</span>
          <div className="heatmap-legend-cells">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((level) => (
              <div
                key={level}
                className="heatmap-legend-cell"
                style={{
                  background: level === 0
                    ? 'rgba(255,255,255,0.03)'
                    : `rgba(0, 210, 255, ${level})`,
                }}
              />
            ))}
          </div>
          <span className="heatmap-legend-label">More</span>
        </div>
      </div>
    </div>
  );
};

export default SpendHeatmap;
