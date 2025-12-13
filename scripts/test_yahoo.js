const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        console.log("Fetching AAPL...");
        const quote = await yahooFinance.quote('AAPL');
        console.log("AAPL Price:", quote.regularMarketPrice);

        console.log("Fetching RELIANCE.NS...");
        const quoteNS = await yahooFinance.quote('RELIANCE.NS');
        console.log("RELIANCE.NS Price:", quoteNS.regularMarketPrice);

        console.log("Fetching RELIANCE (expect fail or weird)...");
        try {
            const quoteR = await yahooFinance.quote('RELIANCE');
            console.log("RELIANCE Price:", quoteR.regularMarketPrice);
        } catch (e) {
            console.log("RELIANCE failed as expected:", e.message);
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

test();
