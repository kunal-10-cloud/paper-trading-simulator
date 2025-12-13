import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { searchSymbol } from '../services/api';

const Trade = () => {
    const [symbol, setSymbol] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!symbol) return;

        setLoading(true);
        try {
            const { data } = await searchSymbol(symbol);
            setSearchResults(data);
        } catch (err) {
            console.error('Failed to search symbol', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Trade Stocks</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-xl mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Find Symbol</h2>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g. AAPL"
                            className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                        />
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50" disabled={loading}>
                            {loading ? '...' : 'Search'}
                        </button>
                    </form>

                    {searchResults.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <ul className="space-y-2 max-h-96 overflow-y-auto">
                                {searchResults.map((res) => (
                                    <li key={`${res.symbol}-${res.exchange}`}
                                        className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer rounded border border-transparent hover:border-gray-200 transition-colors"
                                        onClick={() => navigate(`/stock/${res.symbol}`)}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{res.symbol}</p>
                                            <p className="text-sm text-gray-500">{res.description}</p>
                                        </div>
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-medium">{res.exchange}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trade;
