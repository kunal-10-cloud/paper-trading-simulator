import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Globe, Clock } from 'lucide-react';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data } = await api.get('/trade/news/market');
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-20 text-text font-sans">
            <Navbar />
            <div className="max-w-[1000px] mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-text mb-8 flex items-center gap-3">
                    <Globe className="w-8 h-8 text-blue-500" /> Global Market News
                </h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {news.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-surface border border-border rounded-xl overflow-hidden hover:border-muted transition-all group"
                            >
                                <div className="flex flex-col md:flex-row">
                                    {item.image && (
                                        <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                                            <img src={item.image} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                                {item.summary}
                                            </div>
                                            <h2 className="text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors">{item.headline}</h2>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted text-sm mt-4">
                                            <Clock className="w-4 h-4" />
                                            {new Date(item.datetime).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
