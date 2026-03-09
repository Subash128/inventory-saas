import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    UserPlus, Trash2, Edit3, Users, Shield, User, Loader2,
} from "lucide-react";
import API from "../../utils/api";
import Modal from "../../components/ui/Modal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "" });
    const [deleteUser, setDeleteUser] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get("/api/auth/users");
            setUsers(data);
        } catch (err) {
            console.error("Fetch users error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitLoading(true);

        try {
            await API.post("/api/auth/register", form);
            setShowAddModal(false);
            setForm({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Error creating user");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await API.delete(`/api/auth/users/${deleteUser._id}`);
            setDeleteUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting user");
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await API.put(`/api/auth/users/${editUser._id}`, editForm);
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Error updating user");
        } finally {
            setSubmitLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-dark-400 mt-0.5">
                        {users.length} registered users
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white font-medium text-sm hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                    <UserPlus size={16} />
                    Create User
                </motion.button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    users.map((u, i) => (
                        <motion.div
                            key={u._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card rounded-2xl p-5 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === "admin"
                                            ? "gradient-brand"
                                            : "bg-emerald-600/30"
                                            }`}
                                    >
                                        {u.role === "admin" ? (
                                            <Shield size={18} className="text-white" />
                                        ) : (
                                            <User size={18} className="text-emerald-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{u.name}</h3>
                                        <p className="text-sm text-dark-400">{u.email}</p>
                                    </div>
                                </div>

                                {u.role !== "admin" && (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => {
                                                setEditUser(u);
                                                setEditForm({ name: u.name });
                                            }}
                                            className="p-1.5 rounded-lg text-dark-500 hover:text-brand-400 hover:bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteUser(u)}
                                            className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === "admin"
                                        ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                                        : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                        }`}
                                >
                                    {u.role.toUpperCase()}
                                </span>
                                <span className="text-xs text-dark-500">
                                    Joined {new Date(u.createdAt).toLocaleDateString("en-IN")}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add User Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setError("");
                }}
                title="Create New User"
            >
                <form onSubmit={handleAddUser} className="space-y-4">
                    {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            placeholder="Enter full name"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            placeholder="user@company.com"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">
                            Password *
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Minimum 6 characters"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">
                            Role
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className={inputClass}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full py-3 rounded-xl gradient-brand text-white font-semibold
              hover:shadow-lg hover:shadow-brand-500/25 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Create User
                            </>
                        )}
                    </button>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={!!editUser}
                onClose={() => setEditUser(null)}
                title="Edit User"
            >
                <form onSubmit={handleEditUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                            placeholder="Enter full name"
                            className={inputClass}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full py-3 rounded-xl gradient-brand text-white font-semibold
              hover:shadow-lg hover:shadow-brand-500/25 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Edit3 size={18} />
                                Update User
                            </>
                        )}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteUser}
                onClose={() => setDeleteUser(null)}
                title="Delete User"
                size="sm"
            >
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={24} className="text-red-400" />
                    </div>
                    <p className="text-dark-200 mb-2">
                        Delete user <strong className="text-white">{deleteUser?.name}</strong>?
                    </p>
                    <p className="text-dark-500 text-sm mb-6">
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setDeleteUser(null)}
                            className="px-4 py-2 rounded-xl bg-dark-700 text-dark-200 hover:bg-dark-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteUser}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
