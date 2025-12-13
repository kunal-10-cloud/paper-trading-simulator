import { useNavigate } from 'react-router-dom';

const StockCard = ({ symbol, name, price, changePercent }) => {
    const navigate = useNavigate();
    const isPositive = changePercent >= 0;

    return (
        <div 
            onClick={() => navigate(`/stock/${symbol}`)}
            className="min-w-[160px] bg-[#1E222D] border border-[#2A2E39] p-4 rounded-xl flex-shrink-0 cursor-pointer hover:border-gray-500 transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded bg-[#131722] flex items-center justify-center font-bold text-white text-xs">
                    {symbol.substring(0, 2)}
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-primary bg-primary/10' : 'text-accent bg-accent/10'}`}>
                    {isPositive ? '+' : ''}{changePercent?.toFixed(2)}%
                </span>
            </div>
            <h3 className="text-white font-bold group-hover:text-primary transition-colors">{symbol}</h3>
            <p className="text-xs text-gray-500 truncate mb-2">{name}</p>
            <p className="text-lg font-bold text-white">${price?.toFixed(2)}</p>
        </div>
    );
};

export default StockCard;
