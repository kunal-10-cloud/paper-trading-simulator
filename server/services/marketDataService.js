// Mock Market Data Service
// In the future, replace this with calls to Yahoo Finance or Alpha Vantage

const getLastPrice = async (symbol) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a random "realistic" price based on hash of symbol to be consistent-ish
    // or just completely random for now.
    // Let's use a simple map for demo purposes so prices don't fluctuate wildly every millisecond
    const demoPrices = {
        'RELIANCE': 2500.00,
        'TCS': 3500.00,
        'INFY': 1500.00,
        'AAPL': 150.00,
        'GOOGL': 2800.00,
        'TSLA': 900.00,
    };

    if (demoPrices[symbol.toUpperCase()]) {
        // Add small random fluctuation +- 1%
        const base = demoPrices[symbol.toUpperCase()];
        const fluctuation = base * 0.01 * (Math.random() - 0.5);
        return parseFloat((base + fluctuation).toFixed(2));
    }

    // Default random price for unknown symbols
    return parseFloat((Math.random() * 1000 + 50).toFixed(2));
};

module.exports = {
    getLastPrice,
};
