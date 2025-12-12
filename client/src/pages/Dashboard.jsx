import Navbar from '../components/Navbar';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-gray-500">Total Value</h3>
                        <p className="text-2xl font-bold">$100,000.00</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-gray-500">Cash Balance</h3>
                        <p className="text-2xl font-bold">$100,000.00</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-gray-500">P&L</h3>
                        <p className="text-2xl font-bold text-green-500">+$0.00</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
