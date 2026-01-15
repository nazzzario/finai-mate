import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Home = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [spendings, setSpendings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        if (token) {
            fetchSpendings(token);
        }
    }, []);

    const fetchSpendings = async (token) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/spendings/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSpendings(response.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    // Data Processing for Charts
    const categoryData = useMemo(() => {
        const stats = spendings.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
            return acc;
        }, {});
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    }, [spendings]);

    const monthlyData = useMemo(() => {
        const stats = spendings.reduce((acc, item) => {
            // "2024-01-15" -> "Jan"
            const date = new Date(item.date);
            const month = date.toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + item.amount;
            return acc;
        }, {});

        // Sorting months is tricky if not handled well, for simplicity we trust the data oder or list them
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months
            .filter(m => stats[m] !== undefined)
            .map(m => ({ name: m, amount: stats[m] }));
    }, [spendings]);

    const totalSpent = useMemo(() => spendings.reduce((sum, item) => sum + item.amount, 0), [spendings]);

    const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#4ade80'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center relative">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="container mx-auto px-6 py-20 text-center z-10"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                    >
                        Master Your Money with <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI-Powered Precision
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Experience the next generation of personal finance. Track expenses effortlessly, visualize your spending habits, and build a secure financial future.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex gap-4 justify-center">
                        <Link to="/register" className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all shadow-lg shadow-white/10">
                            Start Your Journey
                        </Link>
                        <Link to="/login" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all">
                            Sign In
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left"
                    >
                        <LandingFeatureCard icon="🚀" title="Smart Tracking" description="Log expenses in seconds with our intuitive interface." />
                        <LandingFeatureCard icon="📊" title="Visual Analytics" description="Understand where your money goes with interactive charts." />
                        <LandingFeatureCard icon="🛡️" title="Secure & Private" description="Your data is encrypted and secure with bank-grade standards." />
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back, User!</h1>
                    <p className="text-slate-400">Here's what your finances look like.</p>
                </div>
                <Link
                    to="/spendings"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                    + Add New Expense
                </Link>
            </motion.div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Stat Cards */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Net Spending</span>
                        <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </motion.div>

                    {/* Category Pie Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 h-[350px]">
                        <h3 className="text-lg font-bold text-white mb-4">By Category</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Monthly Bar Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 h-[350px]">
                        <h3 className="text-lg font-bold text-white mb-4">Monthly Overview</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Recent Transactions List */}
                    <motion.div variants={itemVariants} className="lg:col-span-3 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                            <Link to="/spendings" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</Link>
                        </div>
                        <div className="p-4">
                            {spendings.length === 0 ? (
                                <p className="text-center py-10 text-slate-500">No transactions recorded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {spendings.slice(-5).reverse().map((s) => (
                                        <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                    {s.category[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{s.description}</p>
                                                    <p className="text-xs text-slate-500">{s.date} • {s.category}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-white">-${s.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

const LandingFeatureCard = ({ icon, title, description }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
);

export default Home;
