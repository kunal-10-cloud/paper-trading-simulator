const { YahooFinance } = require('yahoo-finance2');

async function test() {
    console.log("Testing V3 Instantiation...");
    try {
        const yf = new YahooFinance();
        const res = await yf.quote('AAPL');
        console.log("AAPL Price:", res.regularMarketPrice);

        // Check for trending or search availability
        if (yf.trending) {
            console.log("Trending available");
        } else {
            console.log("Trending NOT available on instance");
        }

        if (yf.dailyGainers) {
            console.log("dailyGainers available");
        } else {
            console.log("dailyGainers NOT available");
        }

    } catch (e) {
        console.error("V3 Test Failed:", e.message);

        // Try fallback: maybe default export is the instance but needs strict mode? 
        // Or maybe just try the singleton pattern correctly if it exists.
        try {
            const yfDefault = require('yahoo-finance2').default;
            const res2 = await yfDefault.quote('AAPL');
            console.log("Default Export Quote Success:", res2.regularMarketPrice);
        } catch (e2) {
            console.error("Default Export Failed too:", e2.message);
        }
    }
}

test();
