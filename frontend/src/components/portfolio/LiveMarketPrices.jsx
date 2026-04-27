import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const ASSET_ICONS = {
  BTC: '₿',
  GOLD: '🥇',
  NIFTY50: '📊',
};

const ASSET_COLORS = {
  BTC: { bg: 'rgba(247, 147, 26, 0.12)', border: 'rgba(247, 147, 26, 0.25)', text: '#f7931a' },
  GOLD: { bg: 'rgba(255, 215, 0, 0.12)', border: 'rgba(255, 215, 0, 0.25)', text: '#ffd700' },
  NIFTY50: { bg: 'rgba(0, 210, 255, 0.12)', border: 'rgba(0, 210, 255, 0.25)', text: '#00d2ff' },
};

const LiveMarketPrices = ({ marketPrices }) => {
  if (!marketPrices) return null;

  const assets = ['BTC', 'GOLD', 'NIFTY50'];

  return (
    <div className="live-prices-row" id="live-market-prices">
      {assets.map((assetId) => {
        const data = marketPrices[assetId];
        if (!data) return null;

        const isPositive = data.changePercent >= 0;
        const colors = ASSET_COLORS[assetId];

        return (
          <div
            key={assetId}
            className="live-price-card glass-card"
            style={{
              borderColor: colors.border,
              background: `linear-gradient(135deg, ${colors.bg}, rgba(15, 20, 50, 0.65))`,
            }}
          >
            <div className="live-price-header">
              <span className="live-price-icon" style={{ color: colors.text }}>
                {ASSET_ICONS[assetId]}
              </span>
              <div className="live-price-name-wrap">
                <span className="live-price-name">{data.name}</span>
                <span className="live-price-symbol">{data.symbol}</span>
              </div>
            </div>
            <div className="live-price-value">
              ₹{data.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className={`live-price-change ${isPositive ? 'change-positive' : 'change-negative'}`}>
              {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
              <span>
                {isPositive ? '+' : ''}
                {data.changePercent.toFixed(2)}%
              </span>
              <span className="change-abs">
                ({isPositive ? '+' : ''}₹{Math.abs(data.change).toLocaleString('en-IN', { maximumFractionDigits: 2 })})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveMarketPrices;
