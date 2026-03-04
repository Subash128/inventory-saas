import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("inventory")) return "Inventory Management";
    if (path.includes("users")) return "User Management";
    if (path.includes("reports")) return "Monthly Report";
    return "Admin Panel";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 glass border-b border-dark-700/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
    >
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 transition-all lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-white">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
          ${user?.role === "admin"
              ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
              : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
            }`}
        >
          <Shield size={12} />
          {user?.role?.toUpperCase() || "USER"}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-dark-200 hidden md:block">
            {user?.name || "User"}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg
            text-dark-400 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-200 text-sm"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </motion.header>
  );
};

export default Navbar;