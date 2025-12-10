import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-gray-800 p-4 text-white flex justify-between">
            <h1 className="text-xl font-bold">Paper Trading</h1>
            <div className="space-x-4">
                <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
                <Link to="/trade" className="hover:text-gray-300">Trade</Link>
                <Link to="/" className="hover:text-gray-300">Login</Link>
            </div>
        </nav>
    );
};

export default Navbar;
