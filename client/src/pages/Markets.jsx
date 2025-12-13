import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api'; 
import StockCard from '../components/StockCard';
import { TrendingUp, TrendingDown, Activity, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Markets = () => {
    const [gainers, setGainers] = useState([]);
    const [losers, setLosers] = useState([]);
    const [active, setActive] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gainersRes, losersRes, activeRes] = await Promise.all([
                    api.get('/trade/movers?type=gainers'),
                    api.get('/trade/movers?type=losers'),
                    api.get('/trade/movers?type=active')
                ]);
                setGainers(gainersRes.data);
                setLosers(losersRes.data);
                setActive(activeRes.data);
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StockList = ({ title, icon: Icon, data, color }) => (
        <section className="bg-[#1E222D] border border-[#2A2E39] rounded-xl overflow-hidden flex-1 min-w-[300px]">
            <div className="p-4 border-b border-[#2A2E39] flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
            <div className="divide-y divide-[#2A2E39] max-h-[500px] overflow-y-auto custom-scrollbar">
                {data.map((stock) => (
                    <div 
                        key={stock.symbol} 
                        onClick={() => navigate(`/stock/${stock.symbol}`)}
                        className="p-4 flex justify-between items-center hover:bg-[#2A2E39]/50 cursor-pointer group"
                    >
                        <div>
                            <h3 className="text-white font-bold group-hover:text-primary transition-colors">{stock.symbol}</h3>
                            <p className="text-xs text-gray-500 truncate w-32">{stock.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-medium">${stock.price?.toFixed(2)}</p>
                            <p className={`text-xs font-bold ${stock.change >= 0 ? 'text-primary' : 'text-accent'}`}>
                                {stock.change > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-[#131722] pb-20 text-gray-300 font-sans">
            <Navbar />
            <div className="max-w-[1400px] mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Layers className="w-8 h-8 text-secondary" /> Market Explorer
                </h1>
                <p className="text-gray-500 mb-8">Live overview of top performing and trending assets.</p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-6">
                        <StockList title="Top Gainers" icon={TrendingUp} data={gainers} color="text-primary" />
                        <StockList title="Top Losers" icon={TrendingDown} data={losers} color="text-accent" />
                        <StockList title="Most Active" icon={Activity} data={active} color="text-yellow-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Markets;
