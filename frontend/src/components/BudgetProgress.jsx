import { useState } from 'react';
import { FiTarget, FiEdit2, FiCheck } from 'react-icons/fi';
import { saveBudget } from '../api/expenseApi';

const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping',
  'Bills', 'Health', 'Education', 'Other'
];

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

const BudgetProgress = ({ budget, transactions, selectedMonth, onBudgetUpdated }) => {
  const [editingCat, setEditingCat] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Get expense totals by category for the current month
  const expenses = transactions.filter((t) => t.type === 'expense' || !t.type);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const limits = budget?.limits || {};
  // Convert Map-like object if needed
  const limitsObj = limits instanceof Map
    ? Object.fromEntries(limits)
    : (typeof limits === 'object' ? { ...limits } : {});

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setEditValue(limitsObj[cat] || '');
  };

  const handleSave = async (cat) => {
    setSaving(true);
    try {
      const newLimits = { ...limitsObj, [cat]: parseFloat(editValue) || 0 };
      if (newLimits[cat] === 0) delete newLimits[cat];
      await saveBudget({ month: selectedMonth, limits: newLimits });
      setEditingCat(null);
      onBudgetUpdated();
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="glass-card budget-card" id="budget-progress-card">
      <div className="card-header-custom">
        <FiTarget className="card-header-icon" />
        <h3>Budget vs Actuals</h3>
      </div>

      <div className="budget-list">
        {EXPENSE_CATEGORIES.map((cat) => {
          const spent = categoryTotals[cat] || 0;
          const limit = limitsObj[cat] || 0;
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver85 = limit > 0 && (spent / limit) >= 0.85;
          const isOverBudget = limit > 0 && spent > limit;

          return (
            <div key={cat} className="budget-row">
              <div className="budget-row-header">
                <div className="budget-cat-info">
                  <span
                    className="budget-cat-dot"
                    style={{ background: CATEGORY_COLORS[cat] }}
                  />
                  <span className="budget-cat-name">{cat}</span>
                </div>
                <div className="budget-amounts">
                  <span className={`budget-spent ${isOverBudget ? 'over-budget' : ''}`}>
                    {formatAmount(spent)}
                  </span>
                  {editingCat === cat ? (
                    <span className="budget-edit-inline">
                      <span className="budget-slash">/</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="budget-limit-input"
                        placeholder="Limit"
                        autoFocus
                      />
                      <button
                        className="budget-save-btn"
                        onClick={() => handleSave(cat)}
                        disabled={saving}
                      >
                        <FiCheck />
                      </button>
                    </span>
                  ) : (
                    <span className="budget-limit-display" onClick={() => handleEdit(cat)}>
                      <span className="budget-slash">/</span>
                      <span className="budget-limit-text">
                        {limit > 0 ? formatAmount(limit) : 'Set limit'}
                      </span>
                      <FiEdit2 className="budget-edit-icon" />
                    </span>
                  )}
                </div>
              </div>
              {limit > 0 && (
                <div className="budget-bar-track">
                  <div
                    className={`budget-bar-fill ${isOver85 ? 'budget-bar-warn' : ''}`}
                    style={{
                      width: `${pct}%`,
                      background: isOver85
                        ? '#ff4d4d'
                        : CATEGORY_COLORS[cat],
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
