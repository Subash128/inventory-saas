import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, Trash2, Edit3, Image as ImageIcon,
  ChevronLeft, ChevronRight, FileSpreadsheet, FileText, X,
} from "lucide-react";
import API from "../../utils/api";
import Modal from "../../components/ui/Modal";
import InventoryForm from "../../components/inventory/InventoryForm";

const STAGES = [
  "Raw", "Fettled", "FG", "Waiting for Machining",
  "WIP", "Rejection", "Hold", "Waiting for Inspection",
];

// Same ranges as InventoryForm
const TAG_RANGES = [
  { min: 100,  max: 200,  label: "100–200",  location: "Melting" },
  { min: 201,  max: 400,  label: "201–400",  location: "PDC Fettling Bay-1 (25001 Back Side)" },
  { min: 401,  max: 600,  label: "401–600",  location: "PDC Fettling Bay-2 (14001 Back Side)" },
  { min: 601,  max: 800,  label: "601–800",  location: "MC Shop Bay 2 (Old Machine Shop Bay)" },
  { min: 801,  max: 999,  label: "801–999",  location: "MC Shop Bay 1 (New Machine Shop Bay)" },
  { min: 1000, max: 1999, label: "1000–1999",location: "Quality - PDC" },
  { min: 2000, max: 9999, label: "2000+",    location: "Quality - MC Shop" },
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

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", stage: "", tagMin: "", tagMax: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (filters.search)  params.search = filters.search;
      if (filters.stage)   params.stage  = filters.stage;
      if (filters.tagMin)  params.tagMin = filters.tagMin;
      if (filters.tagMax)  params.tagMax = filters.tagMax;

      const { data } = await API.get("/api/inventory", { params });
      setItems(data.data);
      setTotal(data.total);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handleSearch = () => fetchData(1);

  // When user picks a range from the dropdown, set tagMin & tagMax
  const handleTagRangeChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setFilters({ ...filters, tagMin: "", tagMax: "" });
    } else {
      const range = TAG_RANGES.find((r) => r.label === val);
      if (range) {
        setFilters({ ...filters, tagMin: range.min, tagMax: range.max });
      }
    }
  };

  const handleAdd = async (formData) => {
    setSubmitLoading(true);
    try {
      await API.post("/api/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      fetchData(1);
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

  const handleDelete = async () => {
    try {
      await API.delete(`/api/inventory/${deleteId}`);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting item");
    }
  };

  const handleExport = (type) => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    window.open(`${baseURL}/api/export/${type}?token=${token}`, "_blank");
  };

  // Derive selected range label for controlled select
  const selectedRangeLabel =
    TAG_RANGES.find(
      (r) => r.min === Number(filters.tagMin) && r.max === Number(filters.tagMax)
    )?.label || "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Inventory Items</h1>
          <p className="text-sm text-dark-400 mt-0.5">
            {total} total items in the system
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all text-sm"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all text-sm"
          >
            <FileText size={16} />
            PDF
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-brand text-white font-medium text-sm hover:shadow-lg hover:shadow-brand-500/25 transition-all"
          >
            <Plus size={16} />
            Add Item
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              placeholder="Search by item name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 text-sm"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white text-sm focus:outline-none focus:border-brand-500/50"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Tag Range Filter — now shows location ranges */}
          <select
            value={selectedRangeLabel}
            onChange={handleTagRangeChange}
            className="px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white text-sm focus:outline-none focus:border-brand-500/50"
          >
            <option value="">All Locations</option>
            {TAG_RANGES.map((r) => (
              <option key={r.label} value={r.label}>
                {r.label} — {r.location}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium flex items-center justify-center"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

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
                <th>Actions</th>
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
                  <td colSpan="8" className="text-center py-12 text-dark-500">
                    No inventory items found
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
                    <td className="font-mono text-brand-400 font-semibold">{item.tagNo}</td>
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <p className="text-sm text-dark-400">
              Page {page} of {pages} ({total} items)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchData(page + 1)}
                disabled={page >= pages}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item" size="lg">
        <InventoryForm onSubmit={handleAdd} loading={submitLoading} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Inventory Item" size="lg">
        <InventoryForm onSubmit={handleEdit} initialData={editItem} loading={submitLoading} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Item" size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <p className="text-dark-200 mb-6">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl bg-dark-700 text-dark-200 hover:bg-dark-600 transition-all">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all">
              Delete
            </button>
          </div>
        </div>
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

export default InventoryList;
