import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import InventoryList from "./pages/admin/InventoryList";
import Login from "./pages/Login";
import UserHome from "./pages/UserHome";
import AdminLayout from "./components/layout/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* User Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserHome />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
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



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;