import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api, { getStockPrice, getStockCandles, getCompanyProfile, getFinancials, getRecommendations, getCompanyNews } from '../services/api';
import { BadgeCheck, Globe, TrendingUp, DollarSign } from 'lucide-react';

const StockDetail = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();


    const [price, setPrice] = useState(null);
    const [profile, setProfile] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [financials, setFinancials] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [news, setNews] = useState([]);


    const [activeTab, setActiveTab] = useState('Overview');
    const [timeRange, setTimeRange] = useState('1D');
    const [quantity, setQuantity] = useState('');
    const [orderType, setOrderType] = useState('BUY');

    useEffect(() => {
        const fetchAllData = async () => {
            try {

                const [priceRes, profileRes, recsRes, newsRes] = await Promise.all([
                    getStockPrice(symbol),
                    getCompanyProfile(symbol),
                    getRecommendations(symbol),
                    getCompanyNews(symbol)
                ]);

                setPrice(priceRes.data.price);
                setProfile(profileRes.data);
                setRecommendations(recsRes.data);
                setNews(newsRes.data);


                const candles = await getStockCandles(symbol, timeRange);
                setChartData(candles.data);


                const fins = await getFinancials(symbol);
                setFinancials(fins.data.metric);

            } catch (error) {
                console.error("Error loading stock data", error);
            }
        };
        fetchAllData();
    }, [symbol, timeRange]);

    const handleTrade = async (e) => {
        e.preventDefault();
        try {
            const endpoint = `/trade/${orderType.toLowerCase()}`;
            await api.post(endpoint, { symbol, quantity });
            alert('Order Executed Successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Trade Failed');
        }
    };

    const isPositive = chartData.length > 0 && chartData[chartData.length - 1].close >= chartData[0].close;
    const chartColor = isPositive ? "#00E396" : "#FF4560";
    const gradientId = `colorPrice-${isPositive ? 'up' : 'down'}`;

    return (
        <div className="min-h-screen bg-[#131722] text-gray-300 font-sans pb-20">
            <Navbar />


            <div className="bg-[#1E222D] border-b border-[#2A2E39] pt-8 pb-6 px-4">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        {profile?.logo && <img src={profile.logo} alt={symbol} className="w-16 h-16 rounded-lg bg-white p-1" />}
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                {profile?.name || symbol}
                                {profile?.exchange && <span className="text-xs bg-[#2A2E39] text-gray-400 px-2 py-1 rounded">{profile.exchange}</span>}
                            </h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{symbol}</span>
                                {profile?.weburl ? (
                                    <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                        <Globe className="w-3 h-3" /> Website
                                    </a>
                                ) : null}
                                <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-primary" /> FINNHUB VERIFIED</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold text-white">${price?.toLocaleString()}</h2>
                        {chartData.length > 0 && (
                            <p className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                Live Market Data
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 py-8 grid grid-cols-12 gap-8">


                <div className="col-span-12 lg:col-span-9 space-y-8">


                    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-6 h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex bg-[#131722] rounded-lg p-1">
                                {['1D', '1W', '1M', '6M', '1Y'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range ? 'bg-[#2A2E39] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#4B5563', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E222D', borderColor: '#2A2E39', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: chartColor }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="close" 
                                    stroke={chartColor} 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill={`url(#${gradientId})`} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>


                    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl overflow-hidden min-h-[400px]">
                        <div className="border-b border-[#2A2E39] px-6 flex gap-8">
                            {['Overview', 'Financials', 'News'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'Overview' && financials && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <MetricBox label="Market Cap" value={financials.marketCapitalization ? `$${financials.marketCapitalization.toLocaleString()} M` : '-'} />
                                    <MetricBox label="52W High" value={financials['52WeekHigh'] ? `$${financials['52WeekHigh']}` : '-'} />
                                    <MetricBox label="52W Low" value={financials['52WeekLow'] ? `$${financials['52WeekLow']}` : '-'} />
                                    <MetricBox label="P/E Ratio" value={financials.peTTM ? financials.peTTM.toFixed(2) : '-'} />
                                    <MetricBox label="EPS" value={financials.epsTTM ? financials.epsTTM.toFixed(2) : '-'} />
                                    <MetricBox label="Div Yield" value={financials.dividendYieldIndicatedAnnual ? `${financials.dividendYieldIndicatedAnnual.toFixed(2)}%` : '-'} />
                                    <MetricBox label="Beta" value={financials.beta ? financials.beta.toFixed(2) : '-'} />
                                </div>
                            )}

                            {activeTab === 'Financials' && (
                                <div className="text-center py-10 text-gray-500">
                                    <p>Detailed Financial Statements Table (Income/Balance/Cash Flow)</p>
                                    <p className="text-xs mt-2">Data provided by Finnhub Pro</p>
                                </div>
                            )}

                            {activeTab === 'News' && (
                                <div className="space-y-4">
                                    {news.map((item) => (
                                        <a key={item.id} href={item.url} target="_blank" className="block p-4 rounded-lg bg-[#131722] hover:bg-[#2A2E39] transition-colors">
                                            <h4 className="text-white font-medium">{item.headline}</h4>
                                            <p className="text-xs text-gray-500 mt-2">{item.source} - {new Date(item.datetime * 1000).toLocaleDateString()}</p>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>


                <div className="col-span-12 lg:col-span-3 space-y-6">


                    <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Trade {symbol}</h3>
                        <div className="flex bg-[#131722] rounded-lg p-1 mb-4">
                            <button onClick={() => setOrderType('BUY')} className={`flex-1 py-2 text-sm font-bold rounded ${orderType === 'BUY' ? 'bg-primary text-black' : 'text-gray-400'}`}>Buy</button>
                            <button onClick={() => setOrderType('SELL')} className={`flex-1 py-2 text-sm font-bold rounded ${orderType === 'SELL' ? 'bg-accent text-white' : 'text-gray-400'}`}>Sell</button>
                        </div>
                        <form onSubmit={handleTrade} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full bg-[#131722] border border-[#2A2E39] text-white rounded-lg p-3 outline-none focus:border-primary"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Est. Cost</span>
                                <span className="text-white font-medium">${(price * (quantity || 0)).toLocaleString()}</span>
                            </div>
                            <button className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                Submit Order
                            </button>
                        </form>
                    </div>


                    {recommendations.length > 0 && (
                        <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Analyst Ratings</h3>
                            <div className="space-y-2">

                                <div className="flex justify-between text-sm">
                                    <span className="text-primary">Buy</span>
                                    <span className="text-white">{recommendations[0].buy}</span>
                                </div>
                                <div className="w-full bg-[#131722] h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: `${(recommendations[0].buy / (recommendations[0].buy + recommendations[0].hold + recommendations[0].sell)) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-yellow-500">Hold</span>
                                    <span className="text-white">{recommendations[0].hold}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-accent">Sell</span>
                                    <span className="text-white">{recommendations[0].sell}</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

const MetricBox = ({ label, value }) => (
    <div className="bg-[#131722] p-4 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{value || '-'}</p>
    </div>
)

export default StockDetail;
