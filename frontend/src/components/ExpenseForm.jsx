import { useState } from 'react';
import { createTransaction } from '../api/expenseApi';
import { FiPlus, FiDollarSign, FiCalendar, FiTag, FiFileText, FiArrowUp, FiArrowDown } from 'react-icons/fi';

const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping',
  'Bills', 'Health', 'Education', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'
];

const TransactionForm = ({ onTransactionAdded }) => {
  const [txType, setTxType] = useState('expense');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeSwitch = (type) => {
    setTxType(type);
    setFormData({ ...formData, category: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    setLoading(true);
    try {
      await createTransaction({
        ...formData,
        type: txType,
        amount: parseFloat(formData.amount),
      });
      setFormData({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onTransactionAdded();
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card expense-form-card" id="transaction-form-card">
      <div className="card-header-custom">
        <FiPlus className="card-header-icon" />
        <h3>Add Transaction</h3>
      </div>

      {/* Income/Expense Toggle */}
      <div className="type-toggle" id="type-toggle">
        <button
          type="button"
          className={`type-btn ${txType === 'expense' ? 'active expense-active' : ''}`}
          onClick={() => handleTypeSwitch('expense')}
        >
          <FiArrowDown /> Expense
        </button>
        <button
          type="button"
          className={`type-btn ${txType === 'income' ? 'active income-active' : ''}`}
          onClick={() => handleTypeSwitch('income')}
        >
          <FiArrowUp /> Income
        </button>
      </div>

      {success && (
        <div className={`success-toast ${txType === 'income' ? 'income-toast' : ''}`}>
          ✓ {txType === 'income' ? 'Income' : 'Expense'} added successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="tx-amount">
            <FiDollarSign className="label-icon" /> Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            id="tx-amount"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tx-category">
            <FiTag className="label-icon" /> Category
          </label>
          <select
            name="category"
            id="tx-category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-input form-select"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="tx-date">
            <FiCalendar className="label-icon" /> Date
          </label>
          <input
            type="date"
            name="date"
            id="tx-date"
            value={formData.date}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tx-notes">
            <FiFileText className="label-icon" /> Notes
          </label>
          <textarea
            name="notes"
            id="tx-notes"
            placeholder="Optional notes..."
            value={formData.notes}
            onChange={handleChange}
            className="form-input form-textarea"
            rows="2"
          />
        </div>
        <button
          type="submit"
          className={`submit-btn ${txType === 'income' ? 'submit-btn-income' : ''}`}
          disabled={loading}
          id="add-transaction-btn"
        >
          {loading ? <span className="spinner" /> : (
            <>
              <FiPlus /> Add {txType === 'income' ? 'Income' : 'Expense'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
