import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar, Download, FileSpreadsheet, ChevronLeft, ChevronRight,
} from "lucide-react";
import API from "../../utils/api";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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

const MonthlyReport = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/api/analytics/monthly-report", {
                params: { month, year },
            });
            setReport(data);
        } catch (err) {
            console.error("Report fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Monthly Stock Report</h1>
                    <p className="text-sm text-dark-400 mt-0.5">
                        Available stock overview for the selected month
                    </p>
                </div>
            </div>

            {/* Month Selector */}
            <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/60 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-brand-400" />
                        <span className="text-lg font-semibold text-white">
                            {MONTHS[month - 1]} {year}
                        </span>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/60 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {report && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <p className="text-dark-400 text-sm">Total Items</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                            {report.summary?.totalItems || 0}
                        </h3>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <p className="text-dark-400 text-sm">Total Quantity</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                            {report.summary?.totalQuantity || 0}
                        </h3>
                    </motion.div>
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-5"
                    >
                        <p className="text-dark-400 text-sm">Total Tons</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                            {(report.summary?.totalTons || 0).toFixed(2)}
                        </h3>
                    </motion.div> */}
                </div>
            )}

            {/* Report Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Tag No</th>
                                <th>Location</th>
                                <th>Item Name</th>
                                <th>Stage</th>
                                <th>Quantity</th>
                                {/* <th>Tons</th> */}
                                <th>Entries</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12">
                                        <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : report?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-dark-500">
                                        No inventory data for {MONTHS[month - 1]} {year}
                                    </td>
                                </tr>
                            ) : (
                                report?.data?.map((item, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
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
                                        <td className="font-semibold">{item.totalQuantity}</td>
                                        {/* <td>{item.totalTons.toFixed(2)}</td> */}
                                        <td className="text-dark-500">{item.count}</td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
