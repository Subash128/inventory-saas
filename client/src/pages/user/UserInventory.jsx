import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Plus, Edit3, Image as ImageIcon, X,
} from "lucide-react";
import API from "../../utils/api";
import Modal from "../../components/ui/Modal";
import InventoryForm from "../../components/inventory/InventoryForm";
import { AnimatePresence } from "framer-motion";

const stageBadgeColors = {
    Raw: "bg-slate-500/20 text-slate-400",
    Fettled: "bg-blue-500/20 text-blue-400",
    FG: "bg-emerald-500/20 text-emerald-400",
    "Waiting for Machining": "bg-amber-500/20 text-amber-400",
    WIP: "bg-purple-500/20 text-purple-400",
    Rejection: "bg-red-500/20 text-red-400",
    Hold: "bg-orange-500/20 text-orange-400",
    "Waiting for Inspection": "bg-cyan-500/20 text-cyan-400",
};

const UserInventory = () => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [imageModal, setImageModal] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/api/inventory/my");
            setItems(data.data);
            setTotal(data.total);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (formData) => {
        setSubmitLoading(true);
        try {
            await API.post("/api/inventory", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error adding item");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = async (formData) => {
        setSubmitLoading(true);
        try {
            await API.put(`/api/inventory/${editItem._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setEditItem(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Error updating item");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">My Inventory</h1>
                    <p className="text-sm text-dark-400 mt-0.5">
                        {total} entries submitted
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white font-medium text-sm hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                    <Plus size={16} />
                    Add Entry
                </motion.button>
            </div>

            {/* Items Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Tag No</th>
                                <th>Location</th>
                                <th>Item Name</th>
                                <th>Stage</th>
                                <th>Qty</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12">
                                        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12">
                                        <div className="text-dark-500">
                                            <Plus
                                                size={32}
                                                className="mx-auto mb-2 text-dark-600"
                                            />
                                            <p>No entries yet. Click "Add Entry" to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, i) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <td>
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.itemName}
                                                    onClick={() => setImageModal(item.imageUrl)}
                                                    className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform border border-dark-700/50"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-dark-800/60 flex items-center justify-center text-dark-600">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="font-mono text-brand-400 font-semibold">
                                            {item.tagNo}
                                        </td>
                                        <td className="text-xs">{item.locationName}</td>
                                        <td className="font-medium text-white">{item.itemName}</td>
                                        <td>
                                            <span
                                                className={`stage-badge ${stageBadgeColors[item.stage] || "bg-dark-700 text-dark-300"
                                                    }`}
                                            >
                                                {item.stage}
                                            </span>
                                        </td>
                                        <td className="font-semibold">{item.quantity}</td>
                                        <td className="text-xs text-dark-500">
                                            {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setEditItem(item)}
                                                className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Inventory Entry"
                size="lg"
            >
                <InventoryForm onSubmit={handleAdd} loading={submitLoading} />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editItem}
                onClose={() => setEditItem(null)}
                title="Edit Inventory Entry"
                size="lg"
            >
                <InventoryForm
                    onSubmit={handleEdit}
                    initialData={editItem}
                    loading={submitLoading}
                />
            </Modal>

            {/* Image Lightbox */}
            <AnimatePresence>
                {imageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setImageModal(null)}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-dark-800/80 text-white hover:bg-dark-700 transition-all"
                            onClick={() => setImageModal(null)}
                        >
                            <X size={20} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={imageModal}
                            alt="Full size"
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserInventory;
