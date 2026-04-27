import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import MonthFilter from '../components/MonthFilter';
import TransactionForm from '../components/ExpenseForm';
import ExpenseChart from '../components/ExpenseChart';
import TransactionList from '../components/ExpenseList';
import TrendsChart from '../components/TrendsChart';
import BudgetProgress from '../components/BudgetProgress';
import SpendHeatmap from '../components/SpendHeatmap';
import SubscriptionManager from '../components/SubscriptionManager';
import {
  fetchTransactions,
  fetchBudget,
  fetchSubscriptions,
  fetchTrends,
  fetchHeatmap,
} from '../api/expenseApi';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await fetchTransactions(selectedMonth);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [selectedMonth]);

  const loadBudget = useCallback(async () => {
    try {
      const res = await fetchBudget(selectedMonth);
      setBudget(res.data);
    } catch (err) {
      console.error('Error fetching budget:', err);
    }
  }, [selectedMonth]);

  const loadHeatmap = useCallback(async () => {
    try {
      const res = await fetchHeatmap(selectedMonth);
      setHeatmap(res.data);
    } catch (err) {
      console.error('Error fetching heatmap:', err);
    }
  }, [selectedMonth]);

  const loadSubscriptions = useCallback(async () => {
    try {
      const res = await fetchSubscriptions();
      setSubscriptions(res.data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  }, []);

  const loadTrends = useCallback(async () => {
    try {
      const res = await fetchTrends();
      setTrends(res.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadTransactions(),
      loadBudget(),
      loadHeatmap(),
      loadSubscriptions(),
      loadTrends(),
    ]);
    setLoading(false);
  }, [loadTransactions, loadBudget, loadHeatmap, loadSubscriptions, loadTrends]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleDataRefresh = () => {
    loadTransactions();
    loadBudget();
    loadHeatmap();
    loadTrends();
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-top-row">
          <div className="dashboard-title-section">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Track your finances, gain insights</p>
          </div>
          <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
        </div>

        <SummaryCards transactions={transactions} />

        {loading ? (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading your financial data...</p>
          </div>
        ) : (
          <>
            {/* Row 2: Pie Chart + Transaction Form */}
            <div className="dashboard-grid">
              <ExpenseChart transactions={transactions} />
              <TransactionForm onTransactionAdded={handleDataRefresh} />
            </div>

            {/* Row 3: Trends + Budget */}
            <div className="dashboard-grid">
              <TrendsChart data={trends} />
              <BudgetProgress
                budget={budget}
                transactions={transactions}
                selectedMonth={selectedMonth}
                onBudgetUpdated={loadBudget}
              />
            </div>

            {/* Row 4: Heatmap + Subscriptions */}
            <div className="dashboard-grid">
              <SpendHeatmap data={heatmap} selectedMonth={selectedMonth} />
              <SubscriptionManager
                subscriptions={subscriptions}
                onSubscriptionChanged={loadSubscriptions}
              />
            </div>

            {/* Row 5: Transaction List */}
            <TransactionList transactions={transactions} onTransactionDeleted={handleDataRefresh} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
