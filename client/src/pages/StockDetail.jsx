import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getStockPrice, buyStock, sellStock } from '../services/api';

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [price, setPrice] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [activeTab, setActiveTab] = useState('BUY');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const { data } = await getStockPrice(symbol);
                setPrice(data.price);
            } catch (err) {
                setError('Failed to fetch price');
            }
        };
        fetchPrice();
        // Poll for price every 10 seconds? Maybe later.
    }, [symbol]);

    const handleTrade = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!quantity || quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            const tradeFunc = activeTab === 'BUY' ? buyStock : sellStock;
            const { data } = await tradeFunc({ symbol, quantity: Number(quantity) });
            setMessage(data.message);
            setQuantity('');
            // Refresh price after trade?
        } catch (err) {
            setError(err.response?.data?.message || 'Trade failed');
        } finally {
            setLoading(false);
        }
    };

    const estimatedCost = price && quantity ? (price * quantity).toFixed(2) : '0.00';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8 max-w-2xl mx-auto">
                <button onClick={() => navigate('/trade')} className="text-blue-600 hover:underline mb-4">&larr; Back to Search</button>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Current Price</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {price ? `$${price.toFixed(2)}` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex mb-6 border-b">
                            <button
                                className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'BUY' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('BUY')}
                            >
                                Buy
                            </button>
                            <button
                                className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'SELL' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('SELL')}
                            >
                                Sell
                            </button>
                        </div>

                        <form onSubmit={handleTrade} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="Number of shares"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Estimated {activeTab === 'BUY' ? 'Cost' : 'Credit'}</span>
                                <span className="text-xl font-bold text-gray-900">${estimatedCost}</span>
                            </div>

                            {message && <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{message}</div>}
                            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

                            <button
                                type="submit"
                                className={`w-full py-3 rounded-lg text-white font-bold shadow-sm transition-all transform active:scale-95 ${activeTab === 'BUY'
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={loading || !price}
                            >
                                {loading ? 'Processing...' : `Place ${activeTab} Order`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
