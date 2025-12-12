const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const MarketDataService = require('../services/marketData');

// @desc    Buy stock
// @route   POST /api/trade/buy
// @access  Private
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

        // Deduct balance
        user.balance -= cost;
        await user.save();

        // Create transaction
        await Transaction.create({
            user: req.user._id,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            price: price,
            type: 'BUY',
        });

        // Update Portfolio
        let portfolioItem = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

        if (portfolioItem) {
            // Calculate new average price
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

// @desc    Sell stock
// @route   POST /api/trade/sell
// @access  Private
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

        // Add balance
        user.balance += gain;
        await user.save();

        // Create transaction
        await Transaction.create({
            user: req.user._id,
            symbol: symbol.toUpperCase(),
            quantity: qty,
            price: price,
            type: 'SELL',
        });

        // Update Portfolio
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

// @desc    Get transactions
// @route   GET /api/trade/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get portfolio
// @route   GET /api/trade/portfolio
// @access  Private
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

// @desc    Search symbol
// @route   GET /api/trade/search/:query
// @access  Private
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
