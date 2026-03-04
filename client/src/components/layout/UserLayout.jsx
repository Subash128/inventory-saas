import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Boxes,
    LogOut,
    Menu,
    User,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const UserLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const isActive = location.pathname === "/user/inventory";

    return (
        <div className="min-h-screen bg-dark-950">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-gradient-to-b from-dark-900 via-dark-900 to-dark-950
          border-r border-dark-700/50 shadow-2xl transition-all duration-300`}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-700/50">
                    <div className="w-9 h-9 rounded-lg gradient-success flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-lg font-bold text-white">JHI</h1>
                            <p className="text-[10px] text-dark-400 -mt-0.5 font-medium uppercase tracking-wider">
                                User Panel
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-2">
                    <NavLink to="/user/inventory">
                        <div
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
              ${isActive
                                    ? "bg-emerald-600/20 text-emerald-400"
                                    : "text-dark-400 hover:text-white hover:bg-dark-800/60"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-500" />
                            )}
                            <Boxes size={20} className="flex-shrink-0" />
                            {sidebarOpen && (
                                <span className="text-sm font-medium">My Inventory</span>
                            )}
                        </div>
                    </NavLink>
                </nav>

                {/* Toggle */}
                <div className="p-3 border-t border-dark-700/50">
                    <button
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 transition-all"
                    >
                        {sidebarOpen ? (
                            <ChevronLeft size={18} />
                        ) : (
                            <ChevronRight size={18} />
                        )}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
                    }`}
            >
                {/* Navbar */}
                <header className="h-16 glass border-b border-dark-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 transition-all lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-lg font-semibold text-white">My Inventory</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                            User
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center">
                                <User size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-dark-200 hidden md:block">
                                {user?.name || "User"}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                        >
                            <LogOut size={16} />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
};

export default UserLayout;
