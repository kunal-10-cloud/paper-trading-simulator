const BASE_URL = 'http://localhost:5001/api';

const log = (msg) => console.log(`[TEST] ${msg}`);

async function run() {
    try {
        const randomId = Math.floor(Math.random() * 10000);
        const userData = {
            username: `testuser${randomId}`,
            email: `test${randomId}@example.com`,
            password: 'password123',
        };

        log(`Registering user: ${userData.email}`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
        const user = await regRes.json();
        const token = user.token;
        log(`User registered. Token: ${token.substring(0, 10)}... Balance: ${user.balance}`);

        log('Buying 10 RELIANCE...');
        const buyRes = await fetch(`${BASE_URL}/trade/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ symbol: 'RELIANCE', quantity: 10 }),
        });

        if (!buyRes.ok) throw new Error(`Buy failed: ${await buyRes.text()}`);
        const buyData = await buyRes.json();
        log(`Buy successful. New Balance: ${buyData.balance}`);

        log('Selling 5 RELIANCE...');
        const sellRes = await fetch(`${BASE_URL}/trade/sell`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ symbol: 'RELIANCE', quantity: 5 }),
        });

        if (!sellRes.ok) throw new Error(`Sell failed: ${await sellRes.text()}`);
        const sellData = await sellRes.json();
        log(`Sell successful. New Balance: ${sellData.balance}`);

        log('Fetching Portfolio...');
        const portRes = await fetch(`${BASE_URL}/trade/portfolio`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!portRes.ok) throw new Error(`Get Portfolio failed: ${await portRes.text()}`);
        const portfolio = await portRes.json();
        log('Portfolio:');
        console.table(portfolio);

        const reliance = portfolio.find(p => p.symbol === 'RELIANCE');
        if (reliance && reliance.quantity === 5) {
            log('PASS: Portfolio quantity is correct (5).');
        } else {
            console.error('FAIL: Portfolio quantity incorrect.');
        }

        log('Fetching Transactions...');
        const txRes = await fetch(`${BASE_URL}/trade/transactions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const transactions = await txRes.json();
        log(`Found ${transactions.length} transactions.`);
        if (transactions.length >= 2) {
            log('PASS: Transaction count correct.');
        } else {
            console.error('FAIL: Transaction count incorrect.');
        }

        // 6. Get Candles (Graph Data)
        log('Fetching Candles for RELIANCE...');
        const candlesRes = await fetch(`${BASE_URL}/trade/candles/RELIANCE`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (!candlesRes.ok) throw new Error(`Get Candles failed: ${await candlesRes.text()}`);
        const candles = await candlesRes.json();
        log(`Received ${candles.length} candles.`);
        if (candles.length > 0 && candles[0].close) {
            log('PASS: Candles data structure valid.');
        } else {
            console.error('FAIL: Candles data invalid.');
        }

        // 7. Get Indices
        log('Fetching Indices...');
        const indicesRes = await fetch(`${BASE_URL}/trade/indices`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const indices = await indicesRes.json();
        log(`Received ${indices.length} indices.`);
        if (indices.length > 0) {
            log('PASS: Indices data valid.');
        }

        // 8. Get Movers (Screeners)
        log('Fetching Movers...');
        const moversRes = await fetch(`${BASE_URL}/trade/movers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const movers = await moversRes.json();
        log(`Received ${movers.length} movers.`);
        if (movers.length > 0) {
            log('PASS: Movers (Screeners) data valid.');
        } else {
            log('WARN: No movers returned (could be empty trending list).');
        }


    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

if (!globalThis.fetch) {
    console.error("This script requires Node.js v18+ or 'node-fetch' package.");
    process.exit(1);
}

run();
