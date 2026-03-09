import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Tag number → Location mapping
const TAG_MAP = {
    100: "Melting",
    201: "PDC Fettling Bay-1 (25001 Back Side)",
    401: "PDC Fettling Bay-2 (14001 Back Side)",
    601: "MC Shop Bay 2 (Old Machine Shop Bay)",
    801: "MC Shop Bay 1 (New Machine Shop Bay)",
    1000: "Quality - PDC",
    2000: "Quality - MC Shop",
};

const STAGES = [
    "Raw",
    "Fettled",
    "FG",
    "Waiting for Machining",
    "WIP",
    "Rejection",
    "Hold",
    "Waiting for Inspection",
];

const InventoryForm = ({ onSubmit, initialData = null, loading = false }) => {
    const [form, setForm] = useState({
        tagNo: "",
        locationName: "",
        itemName: "",
        stage: "",
        quantity: "",
        tons: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                tagNo: initialData.tagNo || "",
                locationName: initialData.locationName || "",
                itemName: initialData.itemName || "",
                stage: initialData.stage || "",
                quantity: initialData.quantity || "",
                tons: initialData.tons || "",
            });
            if (initialData.imageUrl) {
                setImagePreview(initialData.imageUrl);
            }
        }
    }, [initialData]);

    const handleTagChange = (e) => {
        const tagNo = e.target.value;
        setForm({
            ...form,
            tagNo,
            locationName: TAG_MAP[tagNo] || "",
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("tagNo", form.tagNo);
        formData.append("locationName", form.locationName);
        formData.append("itemName", form.itemName);
        formData.append("stage", form.stage);
        formData.append("quantity", form.quantity);
        formData.append("tons", form.tons);
        if (imageFile) {
            formData.append("image", imageFile);
        }
        onSubmit(formData);
    };

    const inputClass =
        "w-full px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm";
    const labelClass = "block text-sm font-medium text-dark-300 mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag Number & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tag Number *</label>
                    <select
                        name="tagNo"
                        value={form.tagNo}
                        onChange={handleTagChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select Tag</option>
                        {Object.entries(TAG_MAP).map(([tag, loc]) => (
                            <option key={tag} value={tag}>
                                {tag} - {loc}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Location</label>
                    <input
                        type="text"
                        value={form.locationName}
                        readOnly
                        className={`${inputClass} opacity-60 cursor-not-allowed`}
                        placeholder="Auto-filled from Tag"
                    />
                </div>
            </div>

            {/* Item Name */}
            <div>
                <label className={labelClass}>Item Name *</label>
                <input
                    type="text"
                    name="itemName"
                    value={form.itemName}
                    onChange={handleChange}
                    required
                    placeholder="Enter item name"
                    className={inputClass}
                />
            </div>

            {/* Stage */}
            <div>
                <label className={labelClass}>Stage *</label>
                <select
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                    required
                    className={inputClass}
                >
                    <option value="">Select Stage</option>
                    {STAGES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* Quantity & Tons */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Quantity *</label>
                    <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="0"
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Tons *</label>
                    <input
                        type="number"
                        name="tons"
                        value={form.tons}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Image Upload */}
            <div>
                <label className={labelClass}>Image (Optional)</label>
                {imagePreview ? (
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl border border-dark-700/50"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-700/50 rounded-xl cursor-pointer hover:border-brand-500/40 hover:bg-dark-800/30 transition-all">
                        <div className="flex flex-col items-center gap-2 text-dark-500">
                            <Upload size={24} />
                            <span className="text-sm">Click to upload image</span>
                            <span className="text-xs">PNG, JPG up to 5MB</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gradient-brand text-white font-semibold
          hover:shadow-lg hover:shadow-brand-500/25 transition-all
          disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <ImageIcon size={18} />
                        {initialData ? "Update Item" : "Add Item"}
                    </>
                )}
            </button>
        </form>
    );
};

export default InventoryForm;
