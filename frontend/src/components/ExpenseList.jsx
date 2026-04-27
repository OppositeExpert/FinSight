import { FiTrash2, FiInbox, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { deleteTransaction } from '../api/expenseApi';

const CATEGORY_COLORS = {
  Food: '#ff6b6b',
  Transport: '#4ecdc4',
  Entertainment: '#a78bfa',
  Shopping: '#f472b6',
  Bills: '#fbbf24',
  Health: '#34d399',
  Education: '#60a5fa',
  Other: '#94a3b8',
  Salary: '#34d399',
  Freelance: '#4ecdc4',
  Investment: '#a78bfa',
  Gift: '#f472b6',
  Refund: '#fbbf24',
};

const TransactionList = ({ transactions, onTransactionDeleted }) => {
  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      onTransactionDeleted();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="glass-card expense-list-card" id="transaction-list-card">
      <div className="card-header-custom">
        <FiInbox className="card-header-icon" />
        <h3>Recent Transactions</h3>
        <span className="expense-count">{transactions.length} entries</span>
      </div>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No transactions yet for this period</p>
          <span>Add your first transaction above!</span>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table" id="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={tx._id} className="expense-row" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="expense-date">{formatDate(tx.date)}</td>
                  <td>
                    <span className={`type-badge ${tx.type === 'income' ? 'type-income' : 'type-expense'}`}>
                      {tx.type === 'income' ? <FiArrowUp /> : <FiArrowDown />}
                      {tx.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td>
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[tx.category] || '#94a3b8'}22`,
                        color: CATEGORY_COLORS[tx.category] || '#94a3b8',
                        borderColor: `${CATEGORY_COLORS[tx.category] || '#94a3b8'}44`,
                      }}
                    >
                      {tx.category}
                    </span>
                  </td>
                  <td className={`expense-amount ${tx.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </td>
                  <td className="expense-notes">{tx.notes || '—'}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(tx._id)}
                      title="Delete transaction"
                      id={`delete-tx-${tx._id}`}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
