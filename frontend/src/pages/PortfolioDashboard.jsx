import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LiveMarketPrices from '../components/portfolio/LiveMarketPrices';
import PortfolioValue from '../components/portfolio/PortfolioValue';
import AllocationChart from '../components/portfolio/AllocationChart';
import PerformanceChart from '../components/portfolio/PerformanceChart';
import PortfolioTransactionForm from '../components/portfolio/TransactionForm';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import { fetchPortfolio, fetchPortfolioHistory } from '../api/expenseApi';

const PortfolioDashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolio = useCallback(async () => {
    try {
      const res = await fetchPortfolio();
      setPortfolio(res.data);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchPortfolioHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching portfolio history:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadPortfolio(), loadHistory()]);
    setLoading(false);
  }, [loadPortfolio, loadHistory]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDataRefresh = () => {
    loadPortfolio();
    loadHistory();
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-top-row">
          <div className="dashboard-title-section">
            <h1 className="dashboard-title">Portfolio Tracker</h1>
            <p className="dashboard-subtitle">Track your investments in real-time</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading your portfolio data...</p>
          </div>
        ) : (
          <>
            {/* Row 1: Live Market Prices */}
            <LiveMarketPrices marketPrices={portfolio?.marketPrices} />

            {/* Row 2: Portfolio Value Hero */}
            <PortfolioValue
              totalValue={portfolio?.totalValue || 0}
              totalInvested={portfolio?.totalInvested || 0}
              totalPnL={portfolio?.totalPnL || 0}
              totalPnLPercent={portfolio?.totalPnLPercent || 0}
            />

            {/* Row 3: Allocation Chart + Transaction Form */}
            <div className="dashboard-grid">
              <AllocationChart holdings={portfolio?.holdings || []} />
              <PortfolioTransactionForm onTransactionAdded={handleDataRefresh} />
            </div>

            {/* Row 4: Performance Chart (full width) */}
            <div className="portfolio-full-width-row">
              <PerformanceChart data={history} />
            </div>

            {/* Row 5: Holdings Table */}
            <HoldingsTable holdings={portfolio?.holdings || []} />
          </>
        )}
      </main>
    </div>
  );
};

export default PortfolioDashboard;
