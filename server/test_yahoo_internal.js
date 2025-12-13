const yahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log("Starting Yahoo Finance Test...");
    try {
        const result = await yahooFinance.quote('AAPL');
        console.log("AAPL Quote Success:", result.regularMarketPrice);
    } catch (error) {
        console.error("AAPL Quote Failed:", error.message);
    }

    try {
        const resultNS = await yahooFinance.quote('RELIANCE.NS');
        console.log("RELIANCE.NS Quote Success:", resultNS.regularMarketPrice);
    } catch (error) {
        console.error("RELIANCE.NS Quote Failed:", error.message);
    }

    try {
        const trending = await yahooFinance.trending('US');
        console.log("Trending Success. Count:", trending.quotes.length);
    } catch (error) {
        console.error("Trending Failed:", error.message);
    }
}

test();
