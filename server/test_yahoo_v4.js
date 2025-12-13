const YahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log("Testing V4 Instantiation...");
    try {
        const yf = new YahooFinance();
        const res = await yf.quote('AAPL');
        console.log("AAPL Price (Instance):", res.regularMarketPrice);
    } catch (e) {
        console.error("Instance Test Failed:", e.message);
    }

    try {
        const res = await YahooFinance.quote('AAPL');
        console.log("Static Test Success:", res.regularMarketPrice);
    } catch (e) {
        console.error("Static Test Failed:", e.message);
    }
}

test();
