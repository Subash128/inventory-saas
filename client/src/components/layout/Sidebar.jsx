import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Boxes,
  Users,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/admin/inventory",
    icon: Boxes,
    label: "Inventory",
  },
  {
    to: "/admin/users",
    icon: Users,
    label: "User Management",
  },
  {
    to: "/admin/reports",
    icon: FileBarChart,
    label: "Monthly Report",
  },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col
          bg-gradient-to-b from-dark-900 via-dark-900 to-dark-950
          border-r border-dark-700/50 shadow-2xl
          ${isOpen ? "w-[260px]" : "w-[72px]"}
          transition-all duration-300`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-700/50">
          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0 glow-brand">
            <Sparkles size={20} className="text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-lg font-bold text-white tracking-tight">
                JHI
              </h1>
              <p className="text-[10px] text-dark-400 -mt-0.5 font-medium uppercase tracking-wider">
                Inventory
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${isActive
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-dark-400 hover:text-white hover:bg-dark-800/60"
                    }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-500"
                      transition={{ type: "spring", bounce: 0.2 }}
                    />
                  )}

                  <item.icon
                    size={20}
                    className={`flex-shrink-0 ${isActive
                        ? "text-brand-400"
                        : "text-dark-500 group-hover:text-brand-400"
                      } transition-colors`}
                  />

                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-3 border-t border-dark-700/50">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
              text-dark-400 hover:text-white hover:bg-dark-800/60
              transition-all duration-200"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            {isOpen && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;