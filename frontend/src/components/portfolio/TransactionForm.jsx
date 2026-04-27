import { useState } from 'react';
import { FiPlus, FiDollarSign, FiHash, FiCalendar, FiTag, FiZap } from 'react-icons/fi';
import { addPortfolioTransaction } from '../../api/expenseApi';

const ASSETS = [
  { id: 'BTC', label: 'Bitcoin (BTC-USD)' },
  { id: 'GOLD', label: 'Gold ETF (GLD)' },
  { id: 'NIFTY50', label: 'Nifty 50 (NIFTYBEES.NS)' },
];

const PortfolioTransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    assetId: 'BTC',
    type: 'BUY',
    quantity: '',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isAutoFetch = !formData.buyPrice || formData.buyPrice === '';
  const isBuy = formData.type === 'BUY';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    try {
      // Build payload — omit buyPrice if blank to trigger auto-fetch
      const payload = {
        assetId: formData.assetId,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        buyDate: formData.buyDate,
      };

      if (formData.buyPrice && formData.buyPrice !== '') {
        payload.buyPrice = parseFloat(formData.buyPrice);
      }
      // If buyPrice is omitted, backend will auto-fetch from Yahoo Finance

      const res = await addPortfolioTransaction(payload);

      const autoMsg = res.data?.autoFetched
        ? ` at auto-fetched price ₹${Number(res.data.fetchedPrice).toLocaleString('en-IN')}`
        : '';

      setToast({
        type: formData.type === 'BUY' ? 'success' : 'sell',
        message: `${formData.type === 'BUY' ? 'Bought' : 'Sold'} ${formData.quantity} ${formData.assetId}${autoMsg} successfully!`,
      });

      setFormData({
        assetId: formData.assetId,
        type: 'BUY',
        quantity: '',
        buyPrice: '',
        buyDate: new Date().toISOString().split('T')[0],
      });

      if (onTransactionAdded) onTransactionAdded();

      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add transaction',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" id="portfolio-transaction-form">
      <div className="card-header-custom">
        <FiPlus className="card-header-icon" />
        <h3>Log Transaction</h3>
      </div>

      {toast && (
        <div
          className={`success-toast ${
            toast.type === 'error' ? 'auth-error' : toast.type === 'sell' ? '' : 'income-toast'
          }`}
        >
          {toast.message}
        </div>
      )}

      <form className="expense-form" onSubmit={handleSubmit}>
        {/* BUY / SELL Toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn ${isBuy ? 'income-active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'BUY' })}
            disabled={loading}
          >
            📈 BUY
          </button>
          <button
            type="button"
            className={`type-btn ${!isBuy ? 'expense-active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'SELL' })}
            disabled={loading}
          >
            📉 SELL
          </button>
        </div>

        {/* Asset Dropdown */}
        <label>
          <FiTag className="label-icon" /> Asset
        </label>
        <select
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          className="form-input form-select"
          required
          disabled={loading}
        >
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label>
          <FiHash className="label-icon" /> Quantity
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. 0.5"
          step="any"
          min="0.0001"
          required
          disabled={loading}
        />

        {/* Price — OPTIONAL */}
        <label>
          <FiDollarSign className="label-icon" /> Price per unit (₹)
          <span className="label-optional">optional</span>
        </label>
        <input
          type="number"
          name="buyPrice"
          value={formData.buyPrice}
          onChange={handleChange}
          className="form-input"
          placeholder="Leave blank to auto-fetch"
          step="any"
          min="0"
          disabled={loading}
        />
        <span className="form-helper-text">
          <FiZap className="helper-icon" />
          Leave blank to auto-fetch the historical closing price for this date.
        </span>

        {/* Date */}
        <label>
          <FiCalendar className="label-icon" /> Date
        </label>
        <input
          type="date"
          name="buyDate"
          value={formData.buyDate}
          onChange={handleChange}
          className="form-input"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className={`submit-btn ${isBuy ? 'submit-btn-income' : ''} ${isAutoFetch && !loading ? 'submit-btn-auto' : ''}`}
          disabled={loading || !formData.quantity}
        >
          {loading ? (
            <>
              <div className="spinner" />
              {isAutoFetch ? 'Fetching Price & Saving...' : 'Saving...'}
            </>
          ) : (
            <>
              {isAutoFetch ? <FiZap /> : <FiPlus />}
              {isBuy ? 'Add Buy Order' : 'Add Sell Order'}
              {isAutoFetch && ' ⚡'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PortfolioTransactionForm;
