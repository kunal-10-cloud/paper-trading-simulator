const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTransactions, getPortfolio } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/transactions', protect, getTransactions);
router.get('/portfolio', protect, getPortfolio);

module.exports = router;
