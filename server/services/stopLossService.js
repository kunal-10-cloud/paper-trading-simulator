const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const MarketDataService = require('./marketData');

class StopLossService {

    // Check all active stop-losses
    static async checkStopLosses() {
        try {
            console.log('Running Stop-Loss Check...');

            // 1. Find all portfolios with active stop-loss
            const portfolios = await Portfolio.find({ stopLossActive: true });

            if (portfolios.length === 0) return;

            // 2. Get unique symbols to fetch prices efficiently
            const symbols = [...new Set(portfolios.map(p => p.symbol))];

            // 3. Fetch current prices
            // Note: In a real app we would batch this. Here we'll just loop for simplicity 
            // or use a batch method if MarketDataService supports it (it has _fetchQuotes but that's internal maybe?)
            // We'll just fetch one by one for reliability since this is a prototype/paper trading
            const prices = {};
            for (const sym of symbols) {
                try {
                    prices[sym] = await MarketDataService.getRealTimePrice(sym);
                } catch (e) {
                    console.error(`Failed to fetch price for ${sym} in StopLossService`);
                }
            }

            // 4. Evaluate Stop Losses
            for (const p of portfolios) {
                const currentPrice = prices[p.symbol];

                if (!currentPrice) continue;

                if (currentPrice <= p.stopLossPrice) {
                    await this.triggerStopLoss(p, currentPrice);
                }
            }

        } catch (error) {
            console.error('Error in StopLossService:', error);
        }
    }

    static async triggerStopLoss(portfolioItem, executionPrice) {
        console.log(`TRIGGERING STOP LOSS for ${portfolioItem.symbol} at $${executionPrice} (SL: $${portfolioItem.stopLossPrice})`);

        try {
            const user = await User.findById(portfolioItem.user);
            if (!user) return; // Logic error?

            const quantity = portfolioItem.quantity;
            const gain = executionPrice * quantity;

            // Update Balance
            user.balance += gain;
            await user.save();

            // Create Sell Transaction
            await Transaction.create({
                user: user._id,
                symbol: portfolioItem.symbol,
                quantity: quantity,
                price: executionPrice,
                type: 'SELL',
                totalAmount: gain,
                isStopLoss: true,
            });

            // Remove Portfolio Item
            await Portfolio.deleteOne({ _id: portfolioItem._id });

            // Notification (Ideally socket.io, here just console/log)
            console.log(`STOP LOSS EXECUTED: Sold ${quantity} ${portfolioItem.symbol} for User ${user.email}`);

        } catch (error) {
            console.error(`Failed to execute stop loss for ${portfolioItem._id}:`, error);
        }
    }
}

module.exports = StopLossService;
