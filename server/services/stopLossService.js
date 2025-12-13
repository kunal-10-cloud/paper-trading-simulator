const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const MarketDataService = require('./marketData');

class StopLossService {


    static async checkStopLosses() {
        try {
            console.log('Running Stop-Loss Check...');


            const portfolios = await Portfolio.find({ stopLossActive: true });

            if (portfolios.length === 0) return;


            const symbols = [...new Set(portfolios.map(p => p.symbol))];


            const prices = {};
            for (const sym of symbols) {
                try {
                    prices[sym] = await MarketDataService.getRealTimePrice(sym);
                } catch (e) {
                    console.error(`Failed to fetch price for ${sym} in StopLossService`);
                }
            }


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
            if (!user) return; 

            const quantity = portfolioItem.quantity;
            const gain = executionPrice * quantity;


            user.balance += gain;
            await user.save();


            await Transaction.create({
                user: user._id,
                symbol: portfolioItem.symbol,
                quantity: quantity,
                price: executionPrice,
                type: 'SELL',
                totalAmount: gain,
                isStopLoss: true,
            });


            await Portfolio.deleteOne({ _id: portfolioItem._id });

            console.log(`STOP LOSS EXECUTED: Sold ${quantity} ${portfolioItem.symbol} for User ${user.email}`);

        } catch (error) {
            console.error(`Failed to execute stop loss for ${portfolioItem._id}:`, error);
        }
    }
}

module.exports = StopLossService;
