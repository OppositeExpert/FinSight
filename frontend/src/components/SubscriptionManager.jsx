import { useState } from 'react';
import { createSubscription, deleteSubscription } from '../api/expenseApi';
import { FiRepeat, FiPlus, FiTrash2, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const CYCLE_LABELS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const CYCLE_COLORS = {
  monthly: '#4ecdc4',
  quarterly: '#a78bfa',
  yearly: '#f472b6',
};

const SubscriptionManager = ({ subscriptions, onSubscriptionChanged }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    cycle: 'monthly',
  });
  const [loading, setLoading] = useState(false);

  // Check if due within 7 days
  const isDueSoon = (dueDay) => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    let daysUntilDue;
    if (dueDay >= currentDay) {
      daysUntilDue = dueDay - currentDay;
    } else {
      daysUntilDue = daysInMonth - currentDay + dueDay;
    }
    return daysUntilDue <= 7;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.dueDate) return;
    setLoading(true);
    try {
      await createSubscription({
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: parseInt(formData.dueDate),
      });
      setFormData({ name: '', amount: '', dueDate: '', cycle: 'monthly' });
      setShowForm(false);
      onSubscriptionChanged();
    } catch (err) {
      console.error('Error adding subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubscription(id);
      onSubscriptionChanged();
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  };

  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.cycle === 'monthly') return acc + sub.amount;
    if (sub.cycle === 'quarterly') return acc + sub.amount / 3;
    if (sub.cycle === 'yearly') return acc + sub.amount / 12;
    return acc;
  }, 0);

  return (
    <div className="glass-card subscription-card" id="subscription-manager-card">
      <div className="card-header-custom">
        <FiRepeat className="card-header-icon" />
        <h3>Subscriptions</h3>
        <button
          className="sub-add-toggle"
          onClick={() => setShowForm(!showForm)}
          id="toggle-sub-form"
        >
          <FiPlus /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="sub-form">
          <div className="sub-form-row">
            <input
              type="text"
              name="name"
              placeholder="Name (e.g. Netflix)"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              id="sub-name-input"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              className="form-input"
              id="sub-amount-input"
            />
          </div>
          <div className="sub-form-row">
            <input
              type="number"
              name="dueDate"
              placeholder="Due Day (1-31)"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min="1"
              max="31"
              className="form-input"
              id="sub-duedate-input"
            />
            <select
              name="cycle"
              value={formData.cycle}
              onChange={handleChange}
              className="form-input form-select"
              id="sub-cycle-input"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button type="submit" className="submit-btn" disabled={loading} id="add-sub-btn">
            {loading ? <span className="spinner" /> : <><FiPlus /> Add Subscription</>}
          </button>
        </form>
      )}

      {subscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <p>No subscriptions yet</p>
          <span>Track your recurring bills</span>
        </div>
      ) : (
        <>
          <div className="sub-list">
            {subscriptions.map((sub) => {
              const dueSoon = isDueSoon(sub.dueDate);
              return (
                <div key={sub._id} className={`sub-item ${dueSoon ? 'sub-due-soon' : ''}`}>
                  <div className="sub-item-left">
                    {dueSoon && (
                      <span className="sub-alert-dot" title="Due soon!">
                        <FiAlertCircle />
                      </span>
                    )}
                    <div className="sub-item-info">
                      <span className="sub-name">{sub.name}</span>
                      <span className="sub-due">
                        <FiCalendar /> Due: Day {sub.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="sub-item-right">
                    <span className="sub-amount">{formatAmount(sub.amount)}</span>
                    <span
                      className="sub-cycle-badge"
                      style={{
                        color: CYCLE_COLORS[sub.cycle],
                        borderColor: `${CYCLE_COLORS[sub.cycle]}44`,
                        backgroundColor: `${CYCLE_COLORS[sub.cycle]}15`,
                      }}
                    >
                      {CYCLE_LABELS[sub.cycle]}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(sub._id)}
                      id={`delete-sub-${sub._id}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sub-total">
            <span>Est. Monthly Cost:</span>
            <span className="sub-total-amount">{formatAmount(Math.round(totalMonthly))}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionManager;
