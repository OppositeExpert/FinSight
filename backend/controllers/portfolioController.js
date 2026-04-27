const Holding = require('../models/Holding');
const { getMarketPrices, getHistoricalPrices, getHistoricalPriceWithFallback } = require('../utils/yahooFinance');

// @desc    Get aggregated portfolio with live P&L
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id }).sort({ buyDate: -1 });
    const marketData = await getMarketPrices();
    const { prices, usdToInr } = marketData;

    // Aggregate by asset
    const assetIds = ['BTC', 'GOLD', 'NIFTY50'];
    const aggregated = [];

    for (const assetId of assetIds) {
      const assetTxns = holdings.filter((h) => h.assetId === assetId);
      const buys = assetTxns.filter((t) => t.type === 'BUY');
      const sells = assetTxns.filter((t) => t.type === 'SELL');

      const totalBuyQty = buys.reduce((sum, t) => sum + t.quantity, 0);
      const totalSellQty = sells.reduce((sum, t) => sum + t.quantity, 0);
      const totalQty = totalBuyQty - totalSellQty;

      // Weighted average buy price (only from BUYs)
      const totalBuyCost = buys.reduce((sum, t) => sum + t.buyPrice * t.quantity, 0);
      const avgBuyPrice = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0;

      const currentPrice = prices[assetId]?.price || 0;
      const currentValue = totalQty * currentPrice;
      const investedValue = totalQty * avgBuyPrice;
      const unrealizedPnL = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (unrealizedPnL / investedValue) * 100 : 0;

      aggregated.push({
        assetId,
        name: prices[assetId]?.name || assetId,
        totalQty,
        avgBuyPrice: Math.round(avgBuyPrice * 100) / 100,
        currentPrice: Math.round(currentPrice * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        investedValue: Math.round(investedValue * 100) / 100,
        unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
        transactionCount: assetTxns.length,
      });
    }

    const totalValue = aggregated.reduce((sum, a) => sum + a.currentValue, 0);
    const totalInvested = aggregated.reduce((sum, a) => sum + a.investedValue, 0);
    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    res.json({
      holdings: aggregated,
      totalValue: Math.round(totalValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100,
      totalPnLPercent: Math.round(totalPnLPercent * 100) / 100,
      marketPrices: prices,
      usdToInr,
      transactions: holdings,
    });
  } catch (error) {
    console.error('Get portfolio error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get portfolio value history for performance chart
// @route   GET /api/portfolio/history
// @access  Private
const getPortfolioHistory = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id }).sort({ buyDate: 1 });

    if (holdings.length === 0) {
      return res.json([]);
    }

    const earliestDate = new Date(holdings[0].buyDate);
    earliestDate.setHours(0, 0, 0, 0);

    // 1. Fetch Live Data FIRST to use as an impenetrable failsafe
    const liveMarketData = await getMarketPrices();
    const livePrices = liveMarketData.prices;

    // 2. Fetch using your internal database IDs
    const [btcHistory, goldHistory, niftyHistory, fxHistory] = await Promise.all([
      getHistoricalPrices('BTC', earliestDate),
      getHistoricalPrices('GOLD', earliestDate),
      getHistoricalPrices('NIFTY50', earliestDate),
      getHistoricalPrices('USDINR', earliestDate),
    ]);

    const buildRawPriceMap = (history) => {
      const map = {};
      if (!history || !Array.isArray(history)) return map;
      for (const h of history) {
        const dateKey = new Date(h.date).toISOString().split('T')[0];
        map[dateKey] = h.close;
      }
      return map;
    };

    const priceMaps = {
      'BTC': buildRawPriceMap(btcHistory),
      'GOLD': buildRawPriceMap(goldHistory),
      'NIFTY50': buildRawPriceMap(niftyHistory),
      'USDINR': buildRawPriceMap(fxHistory)
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sortedDates = [];
    const cursor = new Date(earliestDate);
    while (cursor <= today) {
      sortedDates.push(cursor.toISOString().split('T')[0]);
      cursor.setDate(cursor.getDate() + 1);
    }

    // 3. CRITICAL PRESENTATION FIX: Seed the fallback cache with Live Prices.
    // If an asset's historical fetch fails (like Nifty50 was),
    // it won't drop to ₹0. It will hold its current value.
    let lastKnownPrices = {
      'BTC': (livePrices['BTC']?.price || 5400000) / 83.5, 
      'GOLD': (livePrices['GOLD']?.price || 18000) / 83.5,
      'NIFTY50': livePrices['NIFTY50']?.price || 260,
      'USDINR': 83.5
    };

    const result = [];
    const runningQty = { BTC: 0, GOLD: 0, NIFTY50: 0 };
    const runningInvested = { BTC: 0, GOLD: 0, NIFTY50: 0 };
    let holdingIdx = 0;

    for (const dateStr of sortedDates) {
      while (holdingIdx < holdings.length) {
        const h = holdings[holdingIdx];
        const hDate = new Date(h.buyDate).toISOString().split('T')[0];
        if (hDate > dateStr) break;

        if (h.type === 'BUY') {
          runningQty[h.assetId] += h.quantity;
          runningInvested[h.assetId] += h.quantity * h.buyPrice;
        } else {
          runningQty[h.assetId] -= h.quantity;
          const totalQty = runningQty[h.assetId] + h.quantity;
          if (totalQty > 0) {
            const avgCost = runningInvested[h.assetId] / totalQty;
            runningInvested[h.assetId] -= h.quantity * avgCost;
          }
        }
        holdingIdx++;
      }

      let totalValue = 0;
      let totalInvested = 0;

      let fxRate = priceMaps['USDINR']?.[dateStr];
      if (fxRate) lastKnownPrices['USDINR'] = fxRate;
      else fxRate = lastKnownPrices['USDINR'];

      for (const assetId of ['BTC', 'GOLD', 'NIFTY50']) {
        const qty = runningQty[assetId];
        if (qty > 0) {
          
          let assetPrice = priceMaps[assetId]?.[dateStr];
          if (assetPrice) lastKnownPrices[assetId] = assetPrice;
          else assetPrice = lastKnownPrices[assetId];

          let valueInINR = 0;
          if (assetId === 'BTC' || assetId === 'GOLD') {
            valueInINR = qty * assetPrice * fxRate;
          } else {
            valueInINR = qty * assetPrice; 
          }

          totalValue += valueInINR;
          totalInvested += runningInvested[assetId];
        }
      }

      const hasHoldings = Object.values(runningQty).some((q) => q > 0);
      if (hasHoldings && totalValue > 0) {
        result.push({
          date: dateStr,
          totalValue: Math.round(totalValue),
          investedAmount: Math.round(totalInvested),
        });
      }
    }

    // --- Inject "Live" data point ---
    let liveTotalValue = 0;
    let liveTotalInvested = 0;

    for (const assetId of ['BTC', 'GOLD', 'NIFTY50']) {
      const qty = runningQty[assetId];
      if (qty > 0) {
        liveTotalValue += qty * (livePrices[assetId]?.price || 0);
        liveTotalInvested += runningInvested[assetId];
      }
    }

    if (liveTotalValue > 0) {
      const nowStr = new Date().toISOString().split('T')[0];
      if (result.length > 0 && result[result.length - 1].date === nowStr) {
        result[result.length - 1].totalValue = Math.round(liveTotalValue);
        result[result.length - 1].investedAmount = Math.round(liveTotalInvested);
      } else {
        result.push({
          date: nowStr,
          totalValue: Math.round(liveTotalValue),
          investedAmount: Math.round(liveTotalInvested),
        });
      }
    }

    const maxPoints = 90;
    if (result.length > maxPoints) {
      const step = Math.ceil(result.length / maxPoints);
      const sampled = result.filter((_, i) => i % step === 0 || i === result.length - 1);
      return res.json(sampled);
    }

    res.json(result);
  } catch (error) {
    console.error('Get portfolio history error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new portfolio transaction (BUY/SELL)
// @route   POST /api/portfolio
// @access  Private
const addHolding = async (req, res) => {
  try {
    const { assetId, buyPrice, quantity, buyDate, type } = req.body;

    if (!['BTC', 'GOLD', 'NIFTY50'].includes(assetId)) {
      return res.status(400).json({ message: 'Invalid asset. Must be BTC, GOLD, or NIFTY50.' });
    }

    if (!['BUY', 'SELL'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be BUY or SELL.' });
    }

    if (type === 'SELL') {
      const existingHoldings = await Holding.find({
        user: req.user._id,
        assetId,
      });

      const totalBought = existingHoldings
        .filter((h) => h.type === 'BUY')
        .reduce((sum, h) => sum + h.quantity, 0);
      const totalSold = existingHoldings
        .filter((h) => h.type === 'SELL')
        .reduce((sum, h) => sum + h.quantity, 0);
      const available = totalBought - totalSold;

      if (quantity > available) {
        return res.status(400).json({
          message: `Insufficient holdings. You have ${available} units of ${assetId} available to sell.`,
        });
      }
    }

    let resolvedPrice = buyPrice;
    let autoFetched = false;
    const txDate = buyDate || new Date().toISOString().split('T')[0];

    if (resolvedPrice === null || resolvedPrice === undefined || resolvedPrice === '' || isNaN(resolvedPrice)) {
      const dateStr = typeof txDate === 'string' ? txDate.split('T')[0] : new Date(txDate).toISOString().split('T')[0];
      const historicalData = await getHistoricalPriceWithFallback(assetId, dateStr);
      resolvedPrice = historicalData.priceInr;
      autoFetched = true;
    }

    const holding = await Holding.create({
      user: req.user._id,
      assetId,
      buyPrice: resolvedPrice,
      quantity,
      buyDate: txDate,
      type,
    });

    res.status(201).json({
      ...holding.toObject(),
      autoFetched,
      fetchedPrice: autoFetched ? resolvedPrice : undefined,
    });
  } catch (error) {
    console.error('Add holding error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio, getPortfolioHistory, addHolding };