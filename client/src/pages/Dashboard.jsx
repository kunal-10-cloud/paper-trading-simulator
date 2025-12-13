import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api, { getPortfolio, getIndices } from '../services/api';
import StockCard from '../components/StockCard';
import MarketNews from '../components/MarketNews';
import StopLossModal from '../components/StopLossModal';
import { ArrowUpRight, TrendingUp, DollarSign, Activity, ShieldAlert } from 'lucide-react';

const Dashboard = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [balance, setBalance] = useState(0);

    const [indices, setIndices] = useState([]);
    const [trending, setTrending] = useState([]);
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);

    const [selectedStock, setSelectedStock] = useState(null);
    const [isStopLossModalOpen, setIsStopLossModalOpen] = useState(false);

    const fetchPortfolioData = async () => {
        try {
            const { data: portfolioData } = await getPortfolio();
            setPortfolio(portfolioData);
            const total = portfolioData.reduce((acc, item) => acc + item.currentValue, 0);
            setTotalValue(total);

            const { data: userData } = await api.get('/auth/me');
            setBalance(userData.balance);
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchPortfolioData();

                const { data: indicesData } = await getIndices();
                setIndices(indicesData);

                // Fetch all categories for the dashboard
                const [activeRes, gainersRes, losersRes] = await Promise.all([
                    api.get('/trade/movers?type=active'),
                    api.get('/trade/movers?type=gainers'),
                    api.get('/trade/movers?type=losers')
                ]);
                setTrending(activeRes.data);
                setGainers(gainersRes.data);
                setLosers(losersRes.data);

            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const openStopLossModal = (stock) => {
        setSelectedStock(stock);
        setIsStopLossModalOpen(true);
    };

    const StockRow = ({ title, icon: Icon, data, color }) => (
        <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${color}`} /> {title}
                </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {data.length > 0 ? data.map((stock, i) => (
                    <StockCard key={i} {...stock} />
                )) : (
                    <div className="text-gray-500 text-sm">Loading market data...</div>
                )}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-[#131722] pb-20 text-gray-300 font-sans">
            <Navbar />

            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* Indices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {indices.map((idx, i) => (
                        <a href={`/stock/${idx.symbol}`} key={i} className="bg-[#1E222D] border border-[#2A2E39] p-5 rounded-xl flex justify-between items-center hover:border-gray-600 transition-colors cursor-pointer group">
                            <div>
                                <h3 className="text-sm text-gray-400 font-medium mb-1 group-hover:text-primary transition-colors">{idx.name}</h3>
                                <p className="text-xl font-bold text-white">{idx.price?.toFixed(2)}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-sm font-bold ${idx.changePercent < 0 ? 'text-accent bg-accent/10' : 'text-primary bg-primary/10'}`}>
                                {idx.changePercent > 0 ? '+' : ''}{idx.changePercent?.toFixed(2)}%
                            </div>
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-2">

                        {/* Portfolio Summary */}
                        <div className="bg-gradient-to-r from-[#1E222D] to-[#202A36] border border-[#2A2E39] rounded-xl p-8 flex justify-between items-center shadow-lg relative overflow-hidden mb-8">
                            {/* ... existing portfolio UI ... */}
                            <div className="relative z-10">
                                <p className="text-gray-400 mb-2 font-medium flex items-center gap-2"><BriefcaseIcon className="w-4 h-4" /> Total Portfolio Value</p>
                                <h1 className="text-4xl font-bold text-white mb-2">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
                                <p className="text-primary text-sm font-medium flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" /> +$1,240.50 (Today)
                                </p>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-gray-400 mb-1 text-sm font-medium">Buying Power</p>
                                <p className="text-xl font-semibold text-white">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                <button className="mt-4 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-black font-bold text-sm transition-all">Deposit Funds</button>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10">
                                <Activity className="w-48 h-48 text-primary" />
                            </div>
                        </div>

                        {/* Expanded Market Sections */}
                        <StockRow title="Trending (Most Active)" icon={Activity} data={trending} color="text-yellow-500" />
                        <StockRow title="Top Gainers" icon={TrendingUp} data={gainers} color="text-primary" />
                        <StockRow title="Top Losers" icon={ArrowUpRight} data={losers} color="text-accent" />

                        {/* Holdings Summary */}
                        <section className="bg-[#1E222D] border border-[#2A2E39] rounded-xl overflow-hidden mt-8">
                            <div className="p-6 border-b border-[#2A2E39]">
                                <h2 className="text-lg font-bold text-white">Your Holdings</h2>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-[#131722] text-xs uppercase text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Symbol</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4">Avg Cost</th>
                                        <th className="px-6 py-4">Current Price</th>
                                        <th className="px-6 py-4">Market Value</th>
                                        <th className="px-6 py-4 text-right">Return</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2A2E39]">
                                    {portfolio.length > 0 ? portfolio.map((item) => (
                                        <tr key={item.symbol} className="hover:bg-[#2A2E39]/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">
                                                <button
                                                    onClick={() => window.location.href = `/stock/${item.symbol}`}
                                                    className="hover:text-primary hover:underline text-left"
                                                >
                                                    {item.symbol}
                                                </button>
                                                {item.stopLossActive && (
                                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded">SL: ${item.stopLossPrice?.toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{item.quantity}</td>
                                            <td className="px-6 py-4 text-gray-400">${item.avgPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-300">${item.currentPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 font-medium text-white">${item.currentValue.toFixed(2)}</td>
                                            <td className={`px-6 py-4 text-right font-medium ${item.pnl >= 0 ? 'text-primary' : 'text-accent'}`}>
                                                {item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)} ({item.pnlPercentage.toFixed(2)}%)
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openStopLossModal(item)}
                                                    className="p-2 bg-[#2A2E39] hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                                                    title="Set Stop Loss"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No holdings found. Start trading!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <MarketNews />
                        {/* AI Sentiment Box same as before */}
                        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Market Sentiment
                            </h2>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Overall Mood</span>
                                <span className="text-primary font-bold">Bullish</span>
                            </div>
                            <div className="w-full bg-[#131722] rounded-full h-2 mb-6">
                                <div className="bg-primary h-2 rounded-full w-[75%] shadow-[0_0_10px_rgba(0,227,150,0.5)]"></div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                AI analysis of news headlines suggests strong buying pressure in the Tech sector. Focus on NASDAQ tickers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {selectedStock && (
                <StopLossModal
                    isOpen={isStopLossModalOpen}
                    onClose={() => setIsStopLossModalOpen(false)}
                    symbol={selectedStock.symbol}
                    currentPrice={selectedStock.currentPrice}
                    onSuccess={fetchPortfolioData}
                />
            )}
        </div>
    );
};


const BriefcaseIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
)

export default Dashboard;
