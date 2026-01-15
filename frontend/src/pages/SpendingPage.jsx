import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SpendingPage = () => {
    const [spendings, setSpendings] = useState([]);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'FOOD',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTH', 'OTHER'];

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchSpendings = async () => {
        try {
            const response = await axios.get('/api/spendings/', getAuthHeader());
            setSpendings(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSpendings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/spendings/', formData, getAuthHeader());
            setFormData({ ...formData, amount: '', description: '' });
            fetchSpendings();
        } catch (err) {
            setError('Failed to add spending.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this?')) return;
        try {
            await axios.delete(`/api/spendings/${id}`, getAuthHeader());
            fetchSpendings();
        } catch (err) {
            console.error(err);
            setError('Failed to delete spending.');
        }
    };

    const totalSpent = useMemo(() => spendings.reduce((sum, item) => sum + item.amount, 0), [spendings]);

    const categoryStats = useMemo(() => {
        const stats = spendings.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
            return acc;
        }, {});
        return Object.entries(stats).sort((a, b) => b[1] - a[1]);
    }, [spendings]);

    const maxCategorySpent = categoryStats.length > 0 ? categoryStats[0][1] : 0;

    const getCategoryColor = (cat) => {
        const colors = {
            FOOD: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            TRANSPORT: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            UTILITIES: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            ENTERTAINMENT: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            HEALTH: 'text-red-400 bg-red-500/10 border-red-500/20',
            OTHER: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        };
        return colors[cat] || colors.OTHER;
    };

    const getCategoryBarColor = (cat) => {
        const colors = {
            FOOD: 'bg-orange-500',
            TRANSPORT: 'bg-blue-500',
            UTILITIES: 'bg-yellow-500',
            ENTERTAINMENT: 'bg-purple-500',
            HEALTH: 'bg-red-500',
            OTHER: 'bg-gray-500'
        };
        return colors[cat] || colors.OTHER;
    }

    return (
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
            {/* Header & Main Stats */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <div className="md:col-span-2 space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Financial Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg">Track, Analyze, and Optimize your spending.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-col justify-center items-center shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-slate-300 text-sm font-medium uppercase tracking-wider mb-1 z-10">Total Spent</span>
                    <span className="text-4xl font-bold text-white z-10">${totalSpent.toFixed(2)}</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form & Category Breakdown */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Add Expense Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">+</span>
                            New Transaction
                        </h3>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Amount ($)"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                required
                                className="text-lg font-semibold"
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Weekly Groceries"
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white appearance-none cursor-pointer hover:bg-slate-800"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>
                            <Input
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <Button type="submit" className="w-full py-3 text-lg shadow-lg shadow-blue-500/20" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Transaction'}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">Spending by Category</h3>
                        <div className="space-y-5">
                            {categoryStats.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">No data to display</p>
                            ) : (
                                categoryStats.map(([cat, amount]) => (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-300 font-medium">{cat}</span>
                                            <span className="text-white font-bold">${amount.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(amount / totalSpent) * 100}%` }}
                                                className={`h-full ${getCategoryBarColor(cat)}`}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Transaction List */}
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden min-h-[600px]"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                            <span className="text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {spendings.length} {spendings.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        <div className="p-4 space-y-3">
                            <AnimatePresence mode='popLayout'>
                                {spendings.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-20"
                                    >
                                        <div className="text-6xl mb-4">💸</div>
                                        <h3 className="text-xl font-medium text-white mb-2">No transactions yet</h3>
                                        <p className="text-slate-500">Add your first expense to get started!</p>
                                    </motion.div>
                                ) : (
                                    spendings.slice().reverse().map((spending) => (
                                        <motion.div
                                            key={spending.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                                            className="p-4 rounded-2xl bg-slate-800/30 border border-white/5 flex items-center justify-between group cursor-default transition-colors"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${getCategoryColor(spending.category)}`}>
                                                    {spending.category[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white text-lg">{spending.description}</p>
                                                    <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                                        <span className="bg-white/5 px-2 py-0.5 rounded text-xs border border-white/5">{spending.category}</span>
                                                        <span>{spending.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="font-bold text-white text-xl">
                                                    -${spending.amount.toFixed(2)}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(spending.id)}
                                                    className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SpendingPage;
