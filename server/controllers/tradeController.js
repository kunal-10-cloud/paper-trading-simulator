const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const MarketDataService = require('../services/marketData');

exports.buyStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const qty = Number(quantity);

        if (!symbol || !qty || qty <= 0) {
            return res.status(400).json({ message: 'Please provide a valid symbol and quantity' });
        }

        const price = await MarketDataService.getRealTimePrice(symbol);
        const cost = price * qty;
        const user = await User.findById(req.user._id);

        if (user.balance < cost) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        user.balance -= cost;
        await user.save();


        await Transaction.create({
            user: req.user._id,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            price: price,
            type: 'BUY',
            totalAmount: cost,
        });

        let portfolioItem = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

        if (portfolioItem) {
            const totalCost = (portfolioItem.quantity * portfolioItem.avgPrice) + cost;
            const newQuantity = portfolioItem.quantity + qty;
            portfolioItem.avgPrice = totalCost / newQuantity;
            portfolioItem.quantity = newQuantity;
            await portfolioItem.save();
        } else {
            await Portfolio.create({
                user: req.user._id,
                symbol: symbol.toUpperCase(),
                quantity: qty,
                avgPrice: price,
            });
        }

        res.status(200).json({ message: `Successfully bought ${qty} shares of ${symbol}`, balance: user.balance });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.sellStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const qty = Number(quantity);

        if (!symbol || !qty || qty <= 0) {
            return res.status(400).json({ message: 'Please provide a valid symbol and quantity' });
        }

        const portfolioItem = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

        if (!portfolioItem || portfolioItem.quantity < qty) {
            return res.status(400).json({ message: 'Insufficient shares' });
        }

        const price = await MarketDataService.getRealTimePrice(symbol);
        const gain = price * qty;
        const user = await User.findById(req.user._id);

        user.balance += gain;
        await user.save();

        await Transaction.create({
            user: req.user._id,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            price: price,
            type: 'SELL',
            totalAmount: gain,
        });

        portfolioItem.quantity -= qty;
        if (portfolioItem.quantity === 0) {
            await Portfolio.deleteOne({ _id: portfolioItem._id });
        } else {
            await portfolioItem.save();
        }

        res.status(200).json({ message: `Successfully sold ${qty} shares of ${symbol}`, balance: user.balance });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ user: req.user._id });

        const portfolioWithValues = await Promise.all(portfolio.map(async (item) => {
            let currentPrice = 0;
            try {
                currentPrice = await MarketDataService.getRealTimePrice(item.symbol);
            } catch (err) {
                console.error(`Could not fetch price for ${item.symbol}`);
            }
            const currentValue = currentPrice * item.quantity;
            const pnl = currentValue - (item.avgPrice * item.quantity);
            const pnlPercentage = item.avgPrice > 0 ? (pnl / (item.avgPrice * item.quantity)) * 100 : 0;

            return {
                ...item.toObject(),
                currentPrice,
                currentValue,
                pnl,
                pnlPercentage
            };
        }));

        res.status(200).json(portfolioWithValues);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.searchSymbol = async (req, res) => {
    try {
        const { query } = req.params;
        const results = await MarketDataService.searchSymbol(query);
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPrice = async (req, res) => {
    try {
        const { symbol } = req.params;
        const price = await MarketDataService.getRealTimePrice(symbol);
        res.status(200).json({ symbol: symbol.toUpperCase(), price });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCandles = async (req, res) => {
    try {
        const { symbol } = req.params;
        const { range } = req.query;
        const candles = await MarketDataService.getChartData(symbol, range);
        res.status(200).json(candles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getIndices = async (req, res) => {
    try {
        const indices = await MarketDataService.getIndices();
        res.status(200).json(indices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getScreeners = async (req, res) => {
    try {
        const { type } = req.query; // 'gainers', 'losers', 'active'
        const screeners = await MarketDataService.getScreeners(type);
        res.status(200).json(screeners);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getCompanyProfile = async (req, res) => {
    try {
        const { symbol } = req.params;
        const profile = await MarketDataService.getCompanyProfile(symbol);
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFinancials = async (req, res) => {
    try {
        const { symbol } = req.params;
        const data = await MarketDataService.getFinancials(symbol);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNews = async (req, res) => {
    try {
        const { symbol } = req.params;
        const news = await MarketDataService.getCompanyNews(symbol);
        res.status(200).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMarketNews = async (req, res) => {
    try {
        const news = await MarketDataService.getMarketNews();
        res.status(200).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const { symbol } = req.params;
        const recs = await MarketDataService.getRecommendations(symbol);
        res.status(200).json(recs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.setStopLoss = async (req, res) => {
    try {
        const { symbol, type, value } = req.body;
        // type: 'price' or 'percent'
        // value: the number (e.g. 150 or 5)

        if (!symbol || !type || !value) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const portfolioItem = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

        if (!portfolioItem) {
            return res.status(404).json({ message: 'Position not found' });
        }

        const currentPrice = await MarketDataService.getRealTimePrice(symbol);

        let stopPrice = 0;
        if (type === 'price') {
            stopPrice = parseFloat(value);
        } else if (type === 'percent') {
            const percent = parseFloat(value);
            stopPrice = currentPrice * (1 - (percent / 100));
        }

        portfolioItem.stopLossType = type;
        portfolioItem.stopLossValue = value;
        portfolioItem.stopLossPrice = stopPrice;
        portfolioItem.stopLossActive = true;

        await portfolioItem.save();

        res.status(200).json({
            message: `Stop-loss set for ${symbol} at $${stopPrice.toFixed(2)}`,
            stopLossPrice: stopPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
