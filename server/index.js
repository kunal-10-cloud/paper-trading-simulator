const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/trade', require('./routes/trade'));

const PORT = process.env.PORT || 5000;

const StopLossService = require('./services/stopLossService');

// Start Stop-Loss Polling Service (every 10 seconds)
setInterval(() => {
    StopLossService.checkStopLosses();
}, 10000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

