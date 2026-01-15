import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Simple check for token updates (basic approach)
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);
        };

        checkAuth();
        // Listen for storage events (doesn't trigger on same page, but good practice)
        window.addEventListener('storage', checkAuth);
        // Polling or custom event dispatch would be better in a real app
        // For now, we rely on the component re-mounting/updating 
        const interval = setInterval(checkAuth, 1000);

        return () => {
            window.removeEventListener('storage', checkAuth);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        ...(isAuthenticated ? [
            { path: '/spendings', label: 'Spending' }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-blue-500/30">
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/5 shadow-lg">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        FinAI Mate
                    </Link>

                    <nav className="flex items-center gap-2 md:gap-6">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-full -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        <div className="h-6 w-px bg-white/10 mx-2" />

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all border border-red-500/20"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Ambient Background Effects */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse delay-700" />

                <Outlet />
            </main>

            <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 bg-slate-900/50">
                <p>© {new Date().getFullYear()} FinAI Mate. Built for the future.</p>
            </footer>
        </div>
    );
};

export default Layout;
