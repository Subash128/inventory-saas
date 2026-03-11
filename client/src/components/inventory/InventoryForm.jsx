import { useState, useEffect, useRef } from "react";
import { Upload, X, Image as ImageIcon, Camera, RefreshCw } from "lucide-react";

const TAG_RANGES = [
    { min: 100,  max: 200,  location: "Melting" },
    { min: 201,  max: 400,  location: "PDC Fettling Bay-1 (25001 Back Side)" },
    { min: 401,  max: 600,  location: "PDC Fettling Bay-2 (14001 Back Side)" },
    { min: 601,  max: 800,  location: "MC Shop Bay 2 (Old Machine Shop Bay)" },
    { min: 801,  max: 999,  location: "MC Shop Bay 1 (New Machine Shop Bay)" },
    { min: 1000, max: 1999, location: "Quality - PDC" },
    { min: 2000, max: 9999, location: "Quality - MC Shop" },
];

const getLocationByTag = (tagNo) => {
    const num = parseInt(tagNo);
    if (isNaN(num)) return "";
    const match = TAG_RANGES.find((r) => num >= r.min && num <= r.max);
    return match ? match.location : "";
};

const STAGES = [
    "Raw", "Fettled", "FG", "Waiting for Machining",
    "WIP", "Rejection", "Hold", "Waiting for Inspection",
];

const InventoryForm = ({ onSubmit, initialData = null, loading = false }) => {
    const [form, setForm] = useState({
        tagNo: "",
        locationName: "",
        itemName: "",
        stage: "",
        quantity: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [facingMode, setFacingMode] = useState("environment"); // rear camera default
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setForm({
                tagNo: initialData.tagNo || "",
                locationName: initialData.locationName || "",
                itemName: initialData.itemName || "",
                stage: initialData.stage || "",
                quantity: initialData.quantity || "",
            });
            if (initialData.imageUrl) setImagePreview(initialData.imageUrl);
        }
    }, [initialData]);

    // Start camera stream
    const startCamera = async (facing = facingMode) => {
        setCameraError("");
        try {
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            setStream(newStream);
            setShowCamera(true);
            // Wait for videoRef to mount
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                    videoRef.current.play();
                }
            }, 100);
        } catch (err) {
            setCameraError("Camera access denied. Please allow camera permission or use file upload.");
            setShowCamera(false);
        }
    };

    // Stop camera stream
    const stopCamera = () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        setStream(null);
        setShowCamera(false);
        setCameraError("");
    };

    // Flip camera
    const flipCamera = () => {
        const newFacing = facingMode === "environment" ? "user" : "environment";
        setFacingMode(newFacing);
        startCamera(newFacing);
    };

    // Capture photo from video
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            setImageFile(file);
            setImagePreview(URL.createObjectURL(blob));
            stopCamera();
        }, "image/jpeg", 0.92);
    };

    // Cleanup stream on unmount
    useEffect(() => {
        return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
    }, [stream]);

    const handleTagChange = (e) => {
        const tagNo = e.target.value;
        setForm({ ...form, tagNo, locationName: getLocationByTag(tagNo) });
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
        if (imageFile) formData.append("image", imageFile);
        onSubmit(formData);
    };

    const inputClass =
        "w-full px-4 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all text-sm";
    const labelClass = "block text-sm font-medium text-dark-300 mb-1.5";

    const locationFound = form.tagNo && getLocationByTag(form.tagNo);
    const locationUnknown = form.tagNo && !getLocationByTag(form.tagNo);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tag Number & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Tag Number *</label>
                    <input
                        type="number"
                        name="tagNo"
                        value={form.tagNo}
                        onChange={handleTagChange}
                        required
                        min="0"
                        placeholder="Enter tag number"
                        className={inputClass}
                    />
                    {locationFound && (
                        <p className="mt-1 text-xs text-brand-400">✓ Location auto-filled</p>
                    )}
                    {locationUnknown && (
                        <p className="mt-1 text-xs text-red-400">⚠ Unknown tag — enter location manually</p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>Location</label>
                    <input
                        type="text"
                        name="locationName"
                        value={form.locationName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Auto-filled or enter manually"
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
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Quantity */}
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

            {/* Image Upload */}
            <div>
                <label className={labelClass}>Image (Optional)</label>

                {/* Camera View */}
                {showCamera && (
                    <div className="relative rounded-xl overflow-hidden border border-dark-700/50 bg-black mb-3">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-h-64 object-cover"
                        />
                        {/* Camera Controls */}
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
                            {/* Flip Camera */}
                            <button
                                type="button"
                                onClick={flipCamera}
                                className="p-2.5 rounded-full bg-dark-800/80 text-white hover:bg-dark-700 transition-all"
                            >
                                <RefreshCw size={18} />
                            </button>
                            {/* Capture */}
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-14 h-14 rounded-full bg-white border-4 border-dark-400 hover:bg-gray-100 transition-all shadow-lg"
                            />
                            {/* Close Camera */}
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="p-2.5 rounded-full bg-dark-800/80 text-red-400 hover:bg-dark-700 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {/* Hidden canvas for capture */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {/* Error */}
                {cameraError && (
                    <p className="text-xs text-red-400 mb-2">⚠ {cameraError}</p>
                )}

                {/* Preview */}
                {imagePreview ? (
                    <div className="flex items-center gap-3">
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
                        {/* Retake button */}
                        <button
                            type="button"
                            onClick={() => { removeImage(); startCamera(); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800/60 border border-dark-700/50 text-dark-300 hover:text-white hover:border-brand-500/40 transition-all text-sm"
                        >
                            <Camera size={15} />
                            Retake
                        </button>
                    </div>
                ) : (
                    !showCamera && (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Camera Button */}
                            <button
                                type="button"
                                onClick={() => startCamera()}
                                className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-dark-700/50 hover:border-brand-500/40 hover:bg-dark-800/30 transition-all text-dark-500 hover:text-dark-300 gap-2"
                            >
                                <Camera size={24} />
                                <span className="text-sm">Take Photo</span>
                            </button>

                            {/* File Upload Button */}
                            <label className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-dark-700/50 cursor-pointer hover:border-brand-500/40 hover:bg-dark-800/30 transition-all text-dark-500 hover:text-dark-300 gap-2">
                                <Upload size={24} />
                                <span className="text-sm">Upload File</span>
                                <span className="text-xs">PNG, JPG up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )
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
