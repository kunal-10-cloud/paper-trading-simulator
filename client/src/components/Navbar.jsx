import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, User, LogOut, BarChart2, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/stock/${searchQuery.toUpperCase()}`);
            setSearchQuery('');
        }
    };

    if (!user) {
        return (
            <nav className="bg-surface border-b border-border p-4 flex justify-between items-center px-8 sticky top-0 z-50 transition-colors duration-200">
                <Link to="/" className="text-2xl font-bold text-text flex items-center gap-2">
                    <BarChart2 className="w-8 h-8 text-primary" />
                    QuantEdge
                </Link>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-background text-muted hover:text-text transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <div className="space-x-4">
                        <Link to="/login" className="px-6 py-2 rounded-lg text-muted hover:text-text font-medium transition-colors">Login</Link>
                        <Link to="/register" className="px-6 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/90">Sign Up</Link>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <div className="sticky top-0 z-50 bg-surface border-b border-border transition-colors duration-200">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">


                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-background border border-border rounded-lg transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-muted group-hover:text-text" />
                    </button>

                    <div className="h-8 w-[1px] bg-border mx-2"></div>

                    <div className="flex items-center gap-10">
                        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-text">
                            <BarChart2 className="w-7 h-7 text-primary" />
                            QuantEdge
                        </Link>
                        <div className="hidden md:flex gap-6">
                            <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-text' : 'text-muted hover:text-text'}`}>Dashboard</Link>
                            <Link to="/markets" className={`text-sm font-medium transition-colors ${location.pathname === '/markets' ? 'text-text' : 'text-muted hover:text-text'}`}>Markets</Link>
                            <Link to="/holdings" className={`text-sm font-medium transition-colors ${location.pathname === '/holdings' ? 'text-text' : 'text-muted hover:text-text'}`}>Holdings</Link>
                            <Link to="/news" className={`text-sm font-medium transition-colors ${location.pathname === '/news' ? 'text-text' : 'text-muted hover:text-text'}`}>News</Link>
                        </div>
                    </div>
                </div>


                <div className="flex-1 max-w-lg px-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search symbol (e.g., AAPL)..."
                            className="w-full bg-background text-text rounded-md py-2 pl-10 pr-4 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>


                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-background text-muted hover:text-text transition-colors">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button className="text-muted hover:text-text transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer group relative">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-text">{user?.username || 'Guest'}</p>
                            <p className="text-xs text-primary">Pro Account</p>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-primary font-bold hover:bg-background transition-colors"
                        >
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
