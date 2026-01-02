const YahooFinance = require('yahoo-finance2').default;
const axios = require('axios');

const yahooFinance = new YahooFinance({
    suppressNotices: ['yahooSurvey']
});

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const getFinnhubKey = () => process.env.FINNHUB_API_KEY;

class MarketDataService {

    static async getRealTimePrice(symbol) {
        try {
            // Priority: Finnhub (usually more reliable for real-time prices)
            const apiKey = getFinnhubKey();
            if (apiKey) {
                try {
                    const response = await axios.get(`${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
                    if (response.data && response.data.c !== undefined && response.data.c !== 0) {
                        return response.data.c;
                    }
                } catch (err) {
                    console.error(`Finnhub quote failed for ${symbol}:`, err.message);
                }
            }

            // Fallback: Yahoo Finance
            const quote = await yahooFinance.quote(symbol);
            return quote.regularMarketPrice;
        } catch (error) {
            console.error(`Yahoo quote failed for ${symbol}:`, error.message);
            if (!symbol.includes('.') && symbol.length > 2) {
                try {
                    const quoteNS = await yahooFinance.quote(symbol + '.NS');
                    return quoteNS.regularMarketPrice;
                } catch (e) { }
            }
            return this._getMockPrice(symbol);
        }
    }

    static async getFullQuote(symbol) {
        try {
            const apiKey = getFinnhubKey();
            let finnhubData = null;
            if (apiKey) {
                try {
                    const response = await axios.get(`${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
                    if (response.data && response.data.c !== undefined && response.data.c !== 0) {
                        finnhubData = {
                            price: response.data.c,
                            change: response.data.d,
                            changePercent: response.data.dp,
                            previousClose: response.data.pc
                        };
                    }
                } catch (err) { }
            }

            if (finnhubData) return finnhubData;

            const quote = await yahooFinance.quote(symbol);
            return {
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent,
                previousClose: quote.regularMarketPreviousClose
            };
        } catch (error) {
            if (!symbol.includes('.') && symbol.length > 2) {
                try {
                    const quoteNS = await yahooFinance.quote(symbol + '.NS');
                    return {
                        price: quoteNS.regularMarketPrice,
                        change: quoteNS.regularMarketChange,
                        changePercent: quoteNS.regularMarketChangePercent,
                        previousClose: quoteNS.regularMarketPreviousClose
                    };
                } catch (e) { }
            }
            return {
                price: this._getMockPrice(symbol),
                change: 0,
                changePercent: 0,
                previousClose: 0
            };
        }
    }

    static async getChartData(symbol, range = '1d') {
        let interval = '15m';
        let period1 = new Date();
        const rangeUpper = range.toUpperCase();

        if (rangeUpper === '1D') { interval = '5m'; period1.setDate(period1.getDate() - 1); }
        else if (rangeUpper === '1W') { interval = '15m'; period1.setDate(period1.getDate() - 7); }
        else if (rangeUpper === '1M') { interval = '1h'; period1.setDate(period1.getDate() - 30); }
        else if (rangeUpper === '3MO' || rangeUpper === '3M') { interval = '1d'; period1.setDate(period1.getDate() - 90); }
        else if (rangeUpper === '6M') { interval = '1d'; period1.setDate(period1.getDate() - 180); }
        else if (rangeUpper === '1Y') { interval = '1wk'; period1.setDate(period1.getDate() - 365); }
        else { interval = '1d'; period1.setDate(period1.getDate() - 30); }

        const queryOptions = { period1: period1.toISOString().split('T')[0], interval: interval };

        const fetchChart = async (sym) => {
            const result = await yahooFinance.chart(sym, queryOptions);
            if (!result || !result.quotes) return [];
            return result.quotes.map(q => ({
                time: q.date.toISOString(),
                open: q.open,
                high: q.high,
                low: q.low,
                close: q.close,
                volume: q.volume
            })).filter(q => q.close !== null);
        };

        try {
            return await fetchChart(symbol);
        } catch (error) {

            if (!symbol.includes('.') && symbol.length > 2) {
                try { return await fetchChart(symbol + '.NS'); } catch (e) { }
            }
            return this._getMockChart(symbol, rangeUpper);
        }
    }

    static async searchSymbol(query) {
        try {
            const results = await yahooFinance.search(query);
            return results.quotes
                .filter(q => q.isYahooFinance !== false)
                .map(q => ({
                    symbol: q.symbol,
                    description: q.shortname || q.longname || q.symbol,
                    type: q.quoteType,
                    exchange: q.exchange
                }));
        } catch (error) {
            return [];
        }
    }

    static async getIndices() {
        const symbols = ['^GSPC', '^DJI', '^IXIC', '^NSEI', '^BSESN'];
        try {
            const quotes = await yahooFinance.quote(symbols);
            return quotes.map(q => ({
                symbol: q.symbol,
                name: q.shortName || q.symbol,
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                changePercent: q.regularMarketChangePercent
            }));
        } catch (error) {
            return this._getMockIndices();
        }
    }

    static async getScreeners(type = 'gainers') {
        try {
            if (type === 'losers') {
                try {
                    const result = await yahooFinance.dailyLosers({ count: 20 });
                    if (result && result.quotes && result.quotes.length > 0) return this._mapQuotes(result.quotes);
                } catch (e) { }
                return await this._fetchQuotes(['PFE', 'INTC', 'WBA', 'MMM', 'NKE', 'PYPL', 'VZ', 'T', 'GM', 'F']);
            }

            if (type === 'active') {
                try {
                    const trending = await yahooFinance.trending('US');
                    if (trending && trending.quotes && trending.quotes.length > 0) {
                        const symbols = trending.quotes.map(q => q.symbol).slice(0, 10);
                        return await this._fetchQuotes(symbols);
                    }
                } catch (e) { }
                return await this._fetchQuotes(['AMD', 'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NFLX', 'BRK-B']);
            }

            try {
                const result = await yahooFinance.dailyGainers({ count: 20 });
                if (result && result.quotes && result.quotes.length > 0) return this._mapQuotes(result.quotes);
            } catch (e) { }
            return await this._fetchQuotes(['NVDA', 'SMCI', 'ARM', 'PLTR', 'ELF', 'PANW', 'CRWD', 'MDB', 'ZS', 'DDOG']);

        } catch (error) {
            console.error(`Screener [${type}] failed:`, error.message);
            return await this._fetchQuotes(['AAPL', 'TSLA', 'MSFT']);
        }
    }

    static _mapQuotes(quotes) {
        return quotes.map(q => ({
            symbol: q.symbol,
            name: q.shortName || q.longName || q.symbol,
            price: q.regularMarketPrice || 0,
            change: q.regularMarketChange || 0,
            changePercent: q.regularMarketChangePercent || 0,
            volume: q.regularMarketVolume || 0,
            marketCap: q.marketCap || 0
        }));
    }

    static async _fetchQuotes(symbols) {
        try {
            const quotes = await yahooFinance.quote(symbols);
            return quotes.map(q => ({
                symbol: q.symbol,
                name: q.shortName || q.longName,
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                changePercent: q.regularMarketChangePercent,
                volume: q.regularMarketVolume,
                marketCap: q.marketCap
            }));
        } catch (e) {
            return [];
        }
    }

    static async getMarketNews() {
        try {
            const news = await yahooFinance.search('finance', { newsCount: 12 });
            return news.news.map(n => ({
                id: n.uuid,
                headline: n.title,
                summary: n.publisher,
                url: n.link,
                image: n.thumbnail ? n.thumbnail.resolutions[0].url : null,
                datetime: n.providerPublishTime * 1000
            }));
        } catch (error) {
            return this._getMockNews();
        }
    }

    static async getCompanyNews(symbol) {
        try {
            const result = await yahooFinance.search(symbol, { newsCount: 10 });
            return result.news.map(n => ({
                id: n.uuid,
                headline: n.title,
                summary: n.publisher,
                url: n.link,
                image: n.thumbnail ? n.thumbnail.resolutions[0].url : null,
                datetime: n.providerPublishTime * 1000
            }));
        } catch (error) {
            return [];
        }
    }

    static async getCompanyProfile(symbol) {
        const apiKey = getFinnhubKey();
        if (apiKey) {
            try {
                const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol.toUpperCase()}&token=${apiKey}`);
                if (response.data && response.data.name) {
                    return {
                        name: response.data.name,
                        ticker: response.data.ticker,
                        logo: response.data.logo,
                        marketCapitalization: response.data.marketCapitalization,
                        weburl: response.data.weburl,
                        finnhubIndustry: response.data.finnhubIndustry
                    };
                }
            } catch (err) { }
        }

        const tryFetch = async (sym) => {
            const profile = await yahooFinance.quoteSummary(sym, { modules: ["summaryProfile", "price"] });
            return {
                name: profile.price.shortName,
                ticker: sym,
                logo: `https://logo.clearbit.com/${profile.price.shortName ? profile.price.shortName.split(' ')[0].toLowerCase() : 'stock'}.com`,
                marketCapitalization: profile.price.marketCap,
                weburl: profile.summaryProfile.website,
                finnhubIndustry: profile.summaryProfile.industry
            };
        }
        try {
            return await tryFetch(symbol);
        } catch (error) {
            try { return await tryFetch(symbol + '.NS'); } catch (e) { }
            return { name: symbol, ticker: symbol };
        }
    }

    static async getFinancials(symbol) {
        try {
            const quote = await yahooFinance.quote(symbol);
            return {
                metric: {
                    "52WeekHigh": quote.fiftyTwoWeekHigh,
                    "52WeekLow": quote.fiftyTwoWeekLow,
                    "marketCapitalization": quote.marketCap,
                    "peBasicExclExtraTTM": quote.trailingPE
                }
            };
        } catch (error) {
            return {};
        }
    }

    static async getRecommendations(symbol) {
        try {
            const result = await yahooFinance.quoteSummary(symbol, { modules: ["recommendationTrend"] });
            return result.recommendationTrend.trend;
        } catch (error) {
            return [];
        }
    }
    static _getMockPrice(symbol) {
        return 100 + (Math.random() * 5);
    }

    static _getMockChart(symbol, range) {
        const points = range === '1D' ? 20 : range === '1W' ? 50 : 100;
        const volatility = range === '1Y' ? 10 : 2;
        let price = 150;

        return Array.from({ length: points }, (_, i) => {
            price = price + (Math.random() - 0.5) * volatility;
            return {
                time: new Date(Date.now() - (points - i) * 3600000).toISOString(),
                close: price,
                high: price + 1,
                low: price - 1,
                open: price
            };
        });
    }

    static _getMockIndices() {
        return [
            { symbol: '^GSPC', name: 'S&P 500 (Offline)', price: 4500.00, change: 0, changePercent: 0 },
        ];
    }

    static _getMockNews() {
        return [{ id: 1, headline: "Market Data Unavailable", summary: "Check server logs.", url: "#", datetime: Date.now() }];
    }
}

module.exports = MarketDataService;
