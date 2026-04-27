const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

// ==========================================
// In-memory cache for Yahoo Finance data
// ==========================================
const priceCache = new Map();
const PRICE_TTL = 5 * 60 * 1000; // 5 minutes
const HISTORICAL_TTL = 60 * 60 * 1000; // 1 hour

// Asset symbol mapping
const SYMBOL_MAP = {
  BTC: 'BTC-USD',
  GOLD: 'GLD',
  NIFTY50: 'NIFTYBEES.NS',
  USDINR: 'USDINR=X',
};

const ASSET_NAMES = {
  BTC: 'Bitcoin',
  GOLD: 'Gold ETF (GLD)',
  NIFTY50: 'Nifty 50 (NIFTYBEES)',
};

/**
 * Get live market prices for all 3 assets + USD-INR exchange rate.
 * Uses in-memory cache with 5-minute TTL to prevent rate limiting.
 */
const getMarketPrices = async () => {
  const cacheKey = 'market_prices';
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < PRICE_TTL) {
    return cached.data;
  }

  try {
    // Fetch all quotes in parallel
    const symbols = [...Object.values(SYMBOL_MAP), 'USDINR=X'];
    const quotes = await Promise.all(
      symbols.map((symbol) =>
        yahooFinance
          .quote(symbol)
          .then((q) => ({ symbol, data: q, error: null }))
          .catch((err) => ({ symbol, data: null, error: err.message }))
      )
    );

    // Extract USD-INR rate
    const usdInrQuote = quotes.find((q) => q.symbol === 'USDINR=X');
    const usdToInr = usdInrQuote?.data?.regularMarketPrice || 84; // fallback

    // Build prices object
    const prices = {};
    for (const [assetId, symbol] of Object.entries(SYMBOL_MAP)) {
      const quote = quotes.find((q) => q.symbol === symbol);

      if (quote?.data) {
        const q = quote.data;
        const isUSD = q.currency === 'USD';
        const conversionRate = isUSD ? usdToInr : 1;
        const priceInr = q.regularMarketPrice * conversionRate;
        const changeInr = (q.regularMarketChange || 0) * conversionRate;

        prices[assetId] = {
          assetId,
          name: ASSET_NAMES[assetId],
          symbol,
          price: priceInr,
          priceUsd: isUSD ? q.regularMarketPrice : null,
          change: changeInr,
          changePercent: q.regularMarketChangePercent || 0,
          currency: 'INR',
          originalCurrency: q.currency,
          usdToInr: isUSD ? usdToInr : null,
        };
      } else {
        // Use stale cache if available
        const stale = priceCache.get(cacheKey);
        if (stale?.data?.prices?.[assetId]) {
          prices[assetId] = stale.data.prices[assetId];
        } else {
          prices[assetId] = {
            assetId,
            name: ASSET_NAMES[assetId],
            symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            currency: 'INR',
            error: quote?.error || 'Data unavailable',
          };
        }
      }
    }

    const result = { prices, usdToInr, fetchedAt: new Date().toISOString() };
    priceCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Yahoo Finance fetch error:', error.message);
    // Return stale cache on error
    const stale = priceCache.get(cacheKey);
    if (stale) return stale.data;
    throw error;
  }
};

/**
 * Get historical daily close prices for a symbol.
 * Cached with 1-hour TTL.
 */
const getHistoricalPrices = async (assetId, startDate) => {
  const symbol = SYMBOL_MAP[assetId];
  if (!symbol) throw new Error(`Unknown asset: ${assetId}`);

  const cacheKey = `historical_${assetId}_${startDate}`;
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < HISTORICAL_TTL) {
    return cached.data;
  }

  try {
    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: new Date(),
      interval: '1d',
    }, {
      validateOHLCV: false,
    });

    const data = result
      .filter((r) => r.close != null)
      .map((r) => ({
        date: r.date,
        close: r.close,
      }));

    priceCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Historical fetch error for ${assetId}:`, error.message);
    const stale = priceCache.get(cacheKey);
    if (stale) return stale.data;
    return [];
  }
};

/**
 * Get the historical closing price for a specific date, with fallback
 * for weekends/holidays. Steps back 1 day at a time up to 7 days.
 * For USD-denominated assets (BTC, GOLD), also fetches historical USDINR
 * for the same resolved trading date for precise INR conversion.
 *
 * @param {string} assetId - 'BTC', 'GOLD', or 'NIFTY50'
 * @param {string} dateString - 'YYYY-MM-DD' format
 * @returns {{ priceInr: number, priceUsd: number|null, resolvedDate: string, usdToInr: number|null }}
 */
const getHistoricalPriceWithFallback = async (assetId, dateString) => {
  const symbol = SYMBOL_MAP[assetId];
  if (!symbol) throw new Error(`Unknown asset: ${assetId}`);

  const isUSD = assetId === 'BTC' || assetId === 'GOLD';
  const MAX_LOOKBACK = 7;

  // Parse the date string as a local calendar date (noon to avoid TZ shifts)
  const parseDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  let targetDate = parseDate(dateString);
  let assetClose = null;
  let resolvedDateStr = null;

  // Step back up to 7 days to find a valid trading day
  for (let attempt = 0; attempt < MAX_LOOKBACK; attempt++) {
    const period1 = new Date(targetDate);
    period1.setHours(0, 0, 0, 0);

    const period2 = new Date(targetDate);
    period2.setHours(23, 59, 59, 999);

    try {
      const result = await yahooFinance.historical(symbol, {
        period1,
        period2,
        interval: '1d',
      });

      if (result && result.length > 0) {
        assetClose = result[result.length - 1].close;
        resolvedDateStr = targetDate.toISOString().split('T')[0];
        break;
      }
    } catch (err) {
      console.error(`Historical fallback attempt ${attempt} for ${symbol}:`, err.message);
    }

    // Step back 1 day
    targetDate.setDate(targetDate.getDate() - 1);
  }

  if (assetClose === null) {
    throw new Error(
      `Could not find a valid closing price for ${assetId} within ${MAX_LOOKBACK} days of ${dateString}`
    );
  }

  // For USD assets, fetch historical USDINR for the SAME resolved date
  let usdToInr = null;
  let priceInr = assetClose;

  if (isUSD) {
    let fxDate = parseDate(resolvedDateStr);

    for (let attempt = 0; attempt < MAX_LOOKBACK; attempt++) {
      const p1 = new Date(fxDate);
      p1.setHours(0, 0, 0, 0);
      const p2 = new Date(fxDate);
      p2.setHours(23, 59, 59, 999);

      try {
        const fxResult = await yahooFinance.historical('USDINR=X', {
          period1: p1,
          period2: p2,
          interval: '1d',
        });

        if (fxResult && fxResult.length > 0) {
          usdToInr = fxResult[fxResult.length - 1].close;
          break;
        }
      } catch (err) {
        console.error(`FX fallback attempt ${attempt} for USDINR=X:`, err.message);
      }

      fxDate.setDate(fxDate.getDate() - 1);
    }

    // Fallback to current live rate if historical FX unavailable
    if (!usdToInr) {
      try {
        const marketData = await getMarketPrices();
        usdToInr = marketData.usdToInr || 84;
      } catch {
        usdToInr = 84;
      }
      console.warn(`Using live/fallback FX rate (${usdToInr}) for ${assetId} on ${resolvedDateStr}`);
    }

    priceInr = assetClose * usdToInr;
  }

  return {
    priceInr: Math.round(priceInr * 100) / 100,
    priceUsd: isUSD ? assetClose : null,
    resolvedDate: resolvedDateStr,
    usdToInr,
  };
};

module.exports = {
  getMarketPrices,
  getHistoricalPrices,
  getHistoricalPriceWithFallback,
  SYMBOL_MAP,
  ASSET_NAMES,
};
