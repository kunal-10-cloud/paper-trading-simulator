import Navbar from '../components/Navbar';

const Trade = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">Trade Stocks</h1>
                <div className="bg-white p-6 rounded shadow max-w-lg">
                    <input type="text" placeholder="Search Symbol..." className="w-full border p-2 rounded mb-4" />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                </div>
            </div>
        </div>
    );
};

export default Trade;
