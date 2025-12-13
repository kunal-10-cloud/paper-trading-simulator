import { useEffect, useState } from 'react';
import { getMarketNews } from '../services/api';
import { ExternalLink } from 'lucide-react';

const MarketNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data } = await getMarketNews();
                setNews(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-surface rounded-xl border border-border"></div>;

    return (
        <div className="bg-surface border border-border rounded-xl p-6 h-full">
            <h2 className="text-lg font-bold text-text mb-4 border-b border-border pb-2">Market Pulse</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {news.map((item) => (
                    <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group p-3 rounded-lg hover:bg-background transition-colors"
                    >
                        <div className="flex gap-4">
                            {item.image && (
                                <img src={item.image} alt="News" className="w-16 h-16 object-cover rounded bg-background border border-border" />
                            )}
                            <div>
                                <h4 className="text-sm font-medium text-text group-hover:text-primary transition-colors line-clamp-2">{item.headline}</h4>
                                <div className="flex gap-2 mt-2 text-xs text-muted">
                                    <span>{item.source}</span>
                                    <span>•</span>
                                    <span>{new Date(item.datetime * 1000).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default MarketNews;
