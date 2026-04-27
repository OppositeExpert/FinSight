import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setDisplay(Math.round(current));
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{display.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

const PortfolioValue = ({ totalValue, totalInvested, totalPnL, totalPnLPercent }) => {
  const isPositive = totalPnL >= 0;

  return (
    <div className="portfolio-hero-card glass-card" id="portfolio-value-card">
      <div className="portfolio-hero-row">
        <div className="portfolio-hero-main">
          <div className="portfolio-hero-label">
            <FiDollarSign className="portfolio-hero-icon" />
            <span>Total Portfolio Value</span>
          </div>
          <div className="portfolio-hero-value">
            <AnimatedCounter value={Math.round(totalValue)} prefix="₹" />
          </div>
        </div>

        <div className="portfolio-hero-stats">
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Total Invested</span>
            <span className="portfolio-stat-value">
              ₹{Math.round(totalInvested).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="portfolio-stat-divider" />
          <div className="portfolio-stat">
            <span className="portfolio-stat-label">Unrealized P&L</span>
            <span className={`portfolio-stat-value ${isPositive ? 'pnl-positive' : 'pnl-negative'}`}>
              <span className="pnl-icon-inline">
                {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
              </span>
              {isPositive ? '+' : ''}₹{Math.abs(Math.round(totalPnL)).toLocaleString('en-IN')}
              <span className="pnl-percent">
                ({isPositive ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioValue;
