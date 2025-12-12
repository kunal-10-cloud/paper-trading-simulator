const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { getLastPrice } = require('../services/marketDataService');

// @desc    Buy stock
// @route   POST /api/trade/buy
// @access  Private
exports.buyStock = async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const userId = req.user.id;

        if (!symbol || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Please provide a valid symbol and quantity' });
        }

        const currentPrice = await getLastPrice(symbol);
        const totalCost = currentPrice * quantity;

        const user = await User.findById(userId);

        if (user.balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // 1. Create Transaction
        const transaction = await Transaction.create({
            user: userId,
            symbol: symbol.toUpperCase(),
            quantity,
            price: currentPrice,
            totalAmount: totalCost,
            type: 'BUY',
        });

        // 2. Update User Balance (Safe atomic update)
        await User.findByIdAndUpdate(userId, {
            $inc: { balance: -totalCost },
        });

        // 3. Update Portfolio
        let portfolioItem = await Portfolio.findOne({ user: userId, symbol: symbol.toUpperCase() });

        if (portfolioItem) {
            // Calculate new average price
            // New Avg = ((Old Qty * Old Avg) + (New Qty * New Price)) / (Old Qty + New Qty)
            const oldTotalVal = portfolioItem.quantity * portfolioItem.avgPrice;
            const newTotalVal = oldTotalVal + totalCost;
            const newQuantity = portfolioItem.quantity + Number(quantity);
            const newAvgPrice = newTotalVal / newQuantity;

            portfolioItem.quantity = newQuantity;
            portfolioItem.avgPrice = newAvgPrice;
            await portfolioItem.save();
        } else {
            await Portfolio.create({
                user: userId,
                symbol: symbol.toUpperCase(),
                quantity,
                avgPrice: currentPrice,
            });
        }

        res.status(200).json({
            success: true,
            message: `Successfully bought ${quantity} shares of ${symbol}`,
            transaction,
        });
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
        const userId = req.user.id;

        if (!symbol || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Please provide a valid symbol and quantity' });
        }

        const portfolioItem = await Portfolio.findOne({ user: userId, symbol: symbol.toUpperCase() });

        if (!portfolioItem || portfolioItem.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough shares to sell' });
        }

        const currentPrice = await getLastPrice(symbol);
        const totalRevenue = currentPrice * quantity;

        // 1. Create Transaction
        const transaction = await Transaction.create({
            user: userId,
            symbol: symbol.toUpperCase(),
            quantity,
            price: currentPrice,
            totalAmount: totalRevenue,
            type: 'SELL',
        });

        // 2. Update User Balance
        await User.findByIdAndUpdate(userId, {
            $inc: { balance: totalRevenue },
        });

        // 3. Update Portfolio
        if (portfolioItem.quantity - quantity === 0) {
            await Portfolio.deleteOne({ _id: portfolioItem._id });
        } else {
            portfolioItem.quantity -= quantity;
            // Avg price doesn't change on sell, technically, unless we use FIFO/LIFO, but for weighted avg it stays same logic usually
            // Actually weighted avg implies cost basis doesn't change on sell, just quantity reduces.
            await portfolioItem.save();
        }

        res.status(200).json({
            success: true,
            message: `Successfully sold ${quantity} shares of ${symbol}`,
            transaction,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user transactions
// @route   GET /api/trade/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user portfolio
// @route   GET /api/trade/portfolio
// @access  Private
exports.getPortfolio = async (req, res) => {
    try {
        const portfolioItems = await Portfolio.find({ user: req.user.id });

        // Fetch current prices for all items to calculate real-time value
        const enrichedPortfolio = await Promise.all(portfolioItems.map(async (item) => {
            const currentPrice = await getLastPrice(item.symbol);
            const currentValue = currentPrice * item.quantity;
            const costBasis = item.avgPrice * item.quantity;
            const pnl = currentValue - costBasis;
            const pnlPercent = costBasis === 0 ? 0 : ((pnl / costBasis) * 100);

            return {
                symbol: item.symbol,
                quantity: item.quantity,
                avgPrice: item.avgPrice,
                currentPrice,
                currentValue,
                pnl,
                pnlPercent: parseFloat(pnlPercent.toFixed(2)),
            };
        }));

        res.status(200).json(enrichedPortfolio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
