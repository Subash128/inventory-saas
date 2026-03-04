import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import UserLayout from "./components/layout/UserLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import InventoryList from "./pages/admin/InventoryList";
import UserManagement from "./pages/admin/UserManagement";
import MonthlyReport from "./pages/admin/MonthlyReport";
import UserInventory from "./pages/user/UserInventory";

// Smart redirect based on role
const HomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/inventory" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Root redirect */}
        <Route path="/" element={<HomeRedirect />} />

        {/* ─── Admin Routes ─── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <InventoryList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <MonthlyReport />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ─── User Routes ─── */}
        <Route
          path="/user/inventory"
          element={
            <ProtectedRoute>
              <UserLayout>
                <UserInventory />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;