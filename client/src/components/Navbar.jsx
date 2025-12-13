import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, LogOut, BarChart2 } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
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
            <nav className="bg-[#1E222D] border-b border-[#2A2E39] p-4 flex justify-between items-center px-8 sticky top-0 z-50">
                <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-8 h-8 text-primary" />
                    ProTrade
                </Link>
                <div className="space-x-4">
                    <Link to="/login" className="px-6 py-2 rounded-lg text-gray-300 hover:text-white font-medium">Login</Link>
                    <Link to="/register" className="px-6 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/90">Sign Up</Link>
                </div>
            </nav>
        );
    }

    return (
        <div className="sticky top-0 z-50 bg-[#1E222D] border-b border-[#2A2E39]">
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">

                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-10">
                    <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white">
                        <BarChart2 className="w-7 h-7 text-primary" />
                        ProTrade
                    </Link>
                    <div className="hidden md:flex gap-6">
                        <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>Dashboard</Link>
                        <Link to="/markets" className={`text-sm font-medium transition-colors ${location.pathname === '/markets' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>Markets</Link>
                        <Link to="/screeners" className={`text-sm font-medium transition-colors ${location.pathname === '/screeners' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>Screeners</Link>
                        <Link to="/news" className={`text-sm font-medium transition-colors ${location.pathname === '/news' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>News</Link>
                    </div>
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-lg px-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search symbol (e.g., AAPL)..."
                            className="w-full bg-[#131722] text-white rounded-md py-2 pl-10 pr-4 border border-[#2A2E39] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right: Profile */}
                <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full"></span>
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer group relative">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-white">{user.username}</p>
                            <p className="text-xs text-primary">Pro Account</p>
                        </div>
                        <div className="w-9 h-9 rounded bg-[#2A2E39] border border-[#363A45] flex items-center justify-center text-primary font-bold">
                            {user.username[0].toUpperCase()}
                        </div>

                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E222D] rounded-lg shadow-xl border border-[#2A2E39] py-1 hidden group-hover:block">
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2A2E39] flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
