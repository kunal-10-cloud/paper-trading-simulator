import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4 text-white flex justify-between items-center px-8">
            <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold">Paper Trading</Link>
            <div className="space-x-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
                        <Link to="/trade" className="hover:text-gray-300">Trade</Link>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-gray-300">Login</Link>
                        <Link to="/register" className="hover:text-gray-300">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
