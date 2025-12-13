const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');

dotenv.config();


require('./config/passport')(passport);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());


app.use(
    session({
        secret: process.env.SESSION_SECRET || 'secret',
        resave: false,
        saveUninitialized: false,
    })
);


app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/trade', require('./routes/trade'));

const PORT = process.env.PORT || 5000;

const StopLossService = require('./services/stopLossService');


setInterval(() => {
    StopLossService.checkStopLosses();
}, 10000);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

