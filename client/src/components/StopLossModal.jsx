import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { setStopLoss } from '../services/api';

const StopLossModal = ({ symbol, currentPrice, isOpen, onClose, onSuccess }) => {
    const [type, setType] = useState('price'); // 'price' or 'percent'
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calculatedPrice, setCalculatedPrice] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setValue('');
            setError(null);
            setCalculatedPrice(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (value && currentPrice) {
            const val = parseFloat(value);
            if (!isNaN(val)) {
                if (type === 'price') {
                    setCalculatedPrice(val);
                } else {
                    setCalculatedPrice(currentPrice * (1 - (val / 100)));
                }
            } else {
                setCalculatedPrice(null);
            }
        }
    }, [value, type, currentPrice]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await setStopLoss(symbol, type, value);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to set Stop Loss');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1E222D] border border-[#2A2E39] rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="text-accent w-5 h-5" />
                        Set Stop Loss for {symbol}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Stop Loss Method</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'price' ? 'bg-primary text-black' : 'bg-[#2A2E39] text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setType('price')}
                            >
                                Exact Price
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-2 rounded-lg font-medium transition-all ${type === 'percent' ? 'bg-primary text-black' : 'bg-[#2A2E39] text-gray-400 hover:text-white'
                                    }`}
                                onClick={() => setType('percent')}
                            >
                                Percentage Drop
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {type === 'price' ? 'Stop Price ($)' : 'Trailling Percent (%)'}
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={type === 'price' ? 'e.g. 145.50' : 'e.g. 5'}
                            className="w-full bg-[#131722] border border-[#2A2E39] rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    {calculatedPrice !== null && (
                        <div className="bg-[#2A2E39]/50 p-3 rounded-lg border border-[#2A2E39]">
                            <p className="text-sm text-gray-400">Estimated Trigger Price:</p>
                            <p className="text-lg font-bold text-white">${calculatedPrice.toFixed(2)}</p>
                            {calculatedPrice >= currentPrice && (
                                <p className="text-xs text-accent mt-1">Warning: Trigger price is above current market price ({currentPrice.toFixed(2)})</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg border border-[#2A2E39] text-gray-400 font-medium hover:text-white hover:bg-[#2A2E39] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-lg bg-accent text-white font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Setting...' : 'Confirm Set Stop Loss'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StopLossModal;
