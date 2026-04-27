import { FiList } from 'react-icons/fi';

const ASSET_LABELS = {
  BTC: 'Bitcoin',
  GOLD: 'Gold ETF',
  NIFTY50: 'Nifty 50',
};

const ASSET_BADGE_COLORS = {
  BTC: { bg: 'rgba(247, 147, 26, 0.12)', color: '#f7931a', border: 'rgba(247, 147, 26, 0.25)' },
  GOLD: { bg: 'rgba(255, 215, 0, 0.12)', color: '#ffd700', border: 'rgba(255, 215, 0, 0.25)' },
  NIFTY50: { bg: 'rgba(0, 210, 255, 0.12)', color: '#00d2ff', border: 'rgba(0, 210, 255, 0.25)' },
};

const HoldingsTable = ({ holdings }) => {
  const activeHoldings = holdings.filter((h) => h.totalQty > 0);

  return (
    <div className="glass-card" id="holdings-table-card">
      <div className="card-header-custom">
        <FiList className="card-header-icon" />
        <h3>Holdings Summary</h3>
        <span className="expense-count">
          {activeHoldings.length} asset{activeHoldings.length !== 1 ? 's' : ''}
        </span>
      </div>
      {activeHoldings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <p>No holdings yet</p>
          <span>Start investing to see your portfolio here</span>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Qty</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Current Value</th>
                <th>P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              {activeHoldings.map((h) => {
                const isPositive = h.unrealizedPnL >= 0;
                const badgeColor = ASSET_BADGE_COLORS[h.assetId];

                return (
                  <tr key={h.assetId} className="expense-row">
                    <td>
                      <span
                        className="category-badge"
                        style={{
                          background: badgeColor.bg,
                          color: badgeColor.color,
                          borderColor: badgeColor.border,
                        }}
                      >
                        {ASSET_LABELS[h.assetId]}
                      </span>
                    </td>
                    <td className="expense-amount">
                      {h.totalQty % 1 === 0 ? h.totalQty : h.totalQty.toFixed(4)}
                    </td>
                    <td>₹{h.avgBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td>₹{h.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="expense-amount">
                      ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={isPositive ? 'amount-income' : 'amount-expense'} style={{ fontWeight: 700 }}>
                      {isPositive ? '+' : ''}₹{h.unrealizedPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td>
                      <span
                        className={`type-badge ${isPositive ? 'type-income' : 'type-expense'}`}
                      >
                        {isPositive ? '▲' : '▼'} {Math.abs(h.pnlPercent).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HoldingsTable;
