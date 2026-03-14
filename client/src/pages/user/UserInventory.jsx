import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Edit3, Image as ImageIcon, X,
    Search, Filter, ClipboardList, CheckCircle2,
} from "lucide-react";
import API from "../../utils/api";
import Modal from "../../components/ui/Modal";
import InventoryForm from "../../components/inventory/InventoryForm";

const TAG_RANGES = [
    { min: 100,  max: 200,  label: "100–200",   location: "Melting" },
    { min: 201,  max: 400,  label: "201–400",   location: "PDC Fettling Bay-1" },
    { min: 401,  max: 600,  label: "401–600",   location: "PDC Fettling Bay-2" },
    { min: 601,  max: 800,  label: "601–800",   location: "MC Shop Bay 2" },
    { min: 801,  max: 999,  label: "801–999",   location: "MC Shop Bay 1" },
    { min: 1000, max: 1999, label: "1000–1999", location: "Quality PDC" },
    { min: 2000, max: 9999, label: "2000+",     location: "Quality MC" },
];

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
    const [successMsg, setSuccessMsg] = useState(false);

    // Filter states
    const [tagSearch, setTagSearch] = useState("");
    const [tagRangeFilter, setTagRangeFilter] = useState("");

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
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 3000);
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

    // Client-side filter
    const filteredItems = items.filter((item) => {
        const matchesTag = tagSearch
            ? String(item.tagNo).includes(tagSearch.trim())
            : true;
        const matchesRange = tagRangeFilter
            ? (() => {
                const range = TAG_RANGES.find((r) => r.label === tagRangeFilter);
                if (!range) return true;
                const num = parseInt(item.tagNo);
                return num >= range.min && num <= range.max;
            })()
            : true;
        return matchesTag && matchesRange;
    });

    const hasFilter = tagSearch || tagRangeFilter;

    const clearFilters = () => {
        setTagSearch("");
        setTagRangeFilter("");
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

            {/* Success Banner */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    >
                        <CheckCircle2 size={18} className="shrink-0" />
                        <p className="text-sm font-medium">Entry submitted successfully!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Bar */}
            {items.length > 0 && (
                <div className="glass-card rounded-2xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Tag number search */}
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
                            <input
                                type="number"
                                placeholder="Search by tag number..."
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 text-sm"
                            />
                        </div>

                        {/* Location range dropdown */}
                        <select
                            value={tagRangeFilter}
                            onChange={(e) => setTagRangeFilter(e.target.value)}
                            className="px-3 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white text-sm focus:outline-none focus:border-brand-500/50 sm:w-56"
                        >
                            <option value="">All Locations</option>
                            {TAG_RANGES.map((r) => (
                                <option key={r.label} value={r.label}>
                                    {r.label} — {r.location}
                                </option>
                            ))}
                        </select>

                        {/* Clear button */}
                        {hasFilter && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-dark-700/60 border border-dark-700/50 text-dark-300 hover:text-red-400 hover:border-red-500/30 transition-all text-sm"
                            >
                                <X size={14} />
                                Clear
                            </button>
                        )}

                        <button
                            className="flex items-center justify-center px-3 py-2.5 rounded-xl gradient-brand text-white text-sm"
                        >
                            <Filter size={15} />
                        </button>
                    </div>

                    {/* Match count */}
                    {hasFilter && (
                        <p className="text-xs text-dark-500 mt-2">
                            Showing {filteredItems.length} of {total} entries
                        </p>
                    )}
                </div>
            )}

            {/* Table */}
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
                                    <td colSpan="8" className="text-center py-12">
                                        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12">
                                        <div className="text-dark-500 flex flex-col items-center gap-2">
                                            <ClipboardList size={32} className="text-dark-600" />
                                            <p>No entries yet. Click "Add Entry" to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12">
                                        <div className="text-dark-500 flex flex-col items-center gap-2">
                                            <Search size={28} className="text-dark-600" />
                                            <p className="text-sm">No entries match this filter.</p>
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs text-brand-400 hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, i) => (
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
                                            <span className={`stage-badge ${stageBadgeColors[item.stage] || "bg-dark-700 text-dark-300"}`}>
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
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Entry" size="lg">
                <InventoryForm onSubmit={handleAdd} loading={submitLoading} />
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Inventory Entry" size="lg">
                <InventoryForm onSubmit={handleEdit} initialData={editItem} loading={submitLoading} />
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
