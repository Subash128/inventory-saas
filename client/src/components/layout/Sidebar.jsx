import { NavLink } from "react-router-dom";
import { LayoutDashboard, Boxes } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-5 fixed">
      <h2 className="text-2xl font-bold mb-8">Inventory SaaS</h2>

      <nav className="space-y-4">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-700"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/inventory"
          className={({ isActive }) =>
            `flex items-center gap-2 p-2 rounded ${
              isActive ? "bg-blue-600" : "hover:bg-gray-700"
            }`
          }
        >
          <Boxes size={18} />
          Inventory
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;