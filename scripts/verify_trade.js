// Node 18+ has native fetch

const BASE_URL = 'http://localhost:5001/api';

const log = (msg) => console.log(`[TEST] ${msg}`);

async function run() {
    try {
        // 1. Register User
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

        // 2. Buy Stock
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
        log(`Buy successful. Tx ID: ${buyData.transaction._id}`);

        // 3. Sell Stock
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
        log(`Sell successful. Tx ID: ${sellData.transaction._id}`);

        // 4. Get Portfolio
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

        // 5. Get Transactions
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

    } catch (error) {
        console.error('TEST FAILED:', error);
    }
}

// Check if fetch is available (Node 18+)
if (!globalThis.fetch) {
    console.error("This script requires Node.js v18+ or 'node-fetch' package.");
    process.exit(1);
}

run();
