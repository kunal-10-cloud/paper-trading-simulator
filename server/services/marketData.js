const axios = require('axios');
const yahooFinance = require('yahoo-finance2').default;

const priceCache = {};
const CACHE_DURATION = 10000; 
class MarketDataService {
    static async getRealTimePrice(symbol) {
        if (!symbol) throw new Error("Symbol is required");
        const uppercaseSymbol = symbol.toUpperCase();

        if (priceCache[uppercaseSymbol] && (Date.now() - priceCache[uppercaseSymbol].timestamp < CACHE_DURATION)) {
            return priceCache[uppercaseSymbol].price;
        }

        try {
            if (process.env.FINNHUB_API_KEY) {
                const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${uppercaseSymbol}&token=${process.env.FINNHUB_API_KEY}`);
                if (response.data && response.data.c) { 
                    const price = Number(response.data.c);
                    priceCache[uppercaseSymbol] = { price, timestamp: Date.now() };
                    return price;
                }
            }
        } catch (error) {
            console.warn(`Finnhub failed for ${uppercaseSymbol}: ${error.message}. Falling back to Yahoo.`);
        }
        try {
            const quote = await yahooFinance.quote(uppercaseSymbol);
            const price = quote.regularMarketPrice;
            if (price === undefined) throw new Error("Price not found");

            priceCache[uppercaseSymbol] = { price, timestamp: Date.now() };
            return price;
        } catch (error) {
            console.error(`Yahoo Finance failed for ${uppercaseSymbol}: ${error.message}`);
            throw new Error(`Could not fetch price for ${uppercaseSymbol}`);
        }
    }

    static async getChartData(symbol, range = '1mo') { 
        const uppercaseSymbol = symbol.toUpperCase();
        const intervalMap = {
            '1d': '5m',   
            '5d': '15m',
            '1mo': '1d',  
            '6mo': '1d',
            '1y': '1wk',
            'ytd': '1d',
            'max': '1mo'
        };
        const interval = intervalMap[range] || '1d';

        const endDate = new Date();
        const startDate = new Date();

        switch (range) {
            case '1d': startDate.setDate(endDate.getDate() - 1); break;
            case '5d': startDate.setDate(endDate.getDate() - 5); break;
            case '1mo': startDate.setMonth(endDate.getMonth() - 1); break;
            case '6mo': startDate.setMonth(endDate.getMonth() - 6); break;
            case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
            case 'ytd': startDate.setMonth(0, 1); break; 
            default: startDate.setMonth(endDate.getMonth() - 1); 
        }

        try {
            const result = await yahooFinance.historical(uppercaseSymbol, {
                period1: startDate,
                interval: interval
            });
            return result.map(candle => ({
                time: candle.date.toISOString().split('T')[0], 
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            }));

        } catch (error) {
            console.error(`Chart data failed for ${uppercaseSymbol}: ${error.message}`);
            throw error;
        }
    }

    static async searchSymbol(query) {
        if (!query) return [];
        try {
            const result = await yahooFinance.search(query);
            return result.quotes
                .filter(q => q.isYahooFinance !== false) 
                .map(q => ({
                    symbol: q.symbol,
                    description: q.shortname || q.longname || q.symbol,
                    type: q.quoteType,
                    exchange: q.exchange
                }));
        } catch (error) {
            console.error(`Search failed: ${error.message}`);
            return [];
        }
    }
}

module.exports = MarketDataService;
