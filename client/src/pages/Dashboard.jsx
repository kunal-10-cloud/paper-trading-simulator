import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api, { getPortfolio } from '../services/api';

const Dashboard = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: portfolioData } = await getPortfolio();
                setPortfolio(portfolioData);
                const total = portfolioData.reduce((acc, item) => acc + item.currentValue, 0);
                setTotalValue(total);

                const { data: userData } = await api.get('/auth/me');
                setBalance(userData.balance);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Portfolio Value</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${totalValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Cash Balance</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total P&L</h3>
                        <p className={`text-3xl font-bold mt-2 ${totalValue - 0 >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {/* P&L calculation needs total cost. */}
                            ${portfolio.reduce((acc, item) => acc + item.pnl, 0).toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Portfolio Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Your Holdings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {portfolio.map((item) => (
                                    <tr key={item.symbol} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.symbol}</td>
                                        <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                                        <td className="px-6 py-4 text-gray-700">${item.avgPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-gray-700">${item.currentPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">${item.currentValue.toFixed(2)}</td>
                                        <td className={`px-6 py-4 font-medium ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)} ({item.pnlPercentage.toFixed(2)}%)
                                        </td>
                                    </tr>
                                ))}
                                {portfolio.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No stocks in portfolio. Go to <a href="/trade" className="text-blue-600 hover:underline">Trade</a> to start investing.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
