const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio, getTransactions, searchSymbol, getPrice, getCandles, getIndices, getScreeners, getCompanyProfile, getFinancials, getNews, getMarketNews, getRecommendations } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/transactions', protect, getTransactions);
router.get('/portfolio', protect, getPortfolio);
router.get('/search/:query', protect, searchSymbol);
router.get('/price/:symbol', protect, getPrice);
router.get('/candles/:symbol', protect, getCandles);
router.get('/indices', protect, getIndices);
router.get('/movers', protect, getScreeners);
router.get('/profile/:symbol', protect, getCompanyProfile);
router.get('/financials/:symbol', protect, getFinancials);
router.get('/news/market', protect, getMarketNews);
router.get('/news/:symbol', protect, getNews);
router.get('/recommendations/:symbol', protect, getRecommendations);

module.exports = router;
