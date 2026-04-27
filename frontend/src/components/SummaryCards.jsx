import { useEffect, useState } from 'react';
import { FiArrowDownCircle, FiArrowUpCircle, FiTarget, FiActivity, FiHash } from 'react-icons/fi';

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

const SummaryCards = ({ transactions }) => {
  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = transactions
    .filter((t) => t.type === 'expense' || !t.type)
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = incomeTotal - expenseTotal;
  const totalCount = transactions.length;

  // Average daily spend for current month
  const now = new Date();
  const daysPassed = now.getDate();
  const avgDaily = daysPassed > 0 ? Math.round(expenseTotal / daysPassed) : 0;

  return (
    <div className="summary-cards" id="summary-cards">
      <div className="summary-card gradient-income">
        <div className="summary-icon-wrap">
          <FiArrowUpCircle className="summary-icon" />
        </div>
        <div className="summary-content">
          <span className="summary-label">Total Income</span>
          <span className="summary-value income-value">
            <AnimatedCounter value={Math.round(incomeTotal)} prefix="₹" />
          </span>
        </div>
      </div>

      <div className="summary-card gradient-expense">
        <div className="summary-icon-wrap">
          <FiArrowDownCircle className="summary-icon" />
        </div>
        <div className="summary-content">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-value expense-value">
            <AnimatedCounter value={Math.round(expenseTotal)} prefix="₹" />
          </span>
        </div>
      </div>

      <div className="summary-card gradient-savings">
        <div className="summary-icon-wrap">
          <FiTarget className="summary-icon" />
        </div>
        <div className="summary-content">
          <span className="summary-label">Net Savings</span>
          <span className={`summary-value ${netSavings >= 0 ? 'income-value' : 'expense-value'}`}>
            <AnimatedCounter value={Math.abs(Math.round(netSavings))} prefix={netSavings >= 0 ? '₹' : '-₹'} />
          </span>
        </div>
      </div>

      <div className="summary-card gradient-daily">
        <div className="summary-icon-wrap">
          <FiActivity className="summary-icon" />
        </div>
        <div className="summary-content">
          <span className="summary-label">Avg. Daily Spend</span>
          <span className="summary-value">
            <AnimatedCounter value={avgDaily} prefix="₹" />
          </span>
        </div>
      </div>

      <div className="summary-card gradient-count">
        <div className="summary-icon-wrap">
          <FiHash className="summary-icon" />
        </div>
        <div className="summary-content">
          <span className="summary-label">Transactions</span>
          <span className="summary-value">
            <AnimatedCounter value={totalCount} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
