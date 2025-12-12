const Transaction = require('../models/Transaction');

// @desc    Buy stock
// @route   POST /api/trade/buy
// @access  Private
exports.buyStock = async (req, res) => {
    res.status(200).json({ message: 'Buy Stock' });
};

// @desc    Sell stock
// @route   POST /api/trade/sell
// @access  Private
exports.sellStock = async (req, res) => {
    res.status(200).json({ message: 'Sell Stock' });
};

// @desc    Get user transactions
// @route   GET /api/trade/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    res.status(200).json({ message: 'Get Transactions' });
};
