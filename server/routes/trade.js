const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio, getTransactions, searchSymbol, getPrice } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/transactions', protect, getTransactions);
router.get('/portfolio', protect, getPortfolio);
router.get('/search/:query', protect, searchSymbol);
router.get('/price/:symbol', protect, getPrice);

module.exports = router;
