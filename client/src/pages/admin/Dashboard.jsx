import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { Boxes, Package, Weight, AlertTriangle } from "lucide-react";
import API from "../../utils/api";

const STAGE_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#06b6d4",
  "#10b981", "#f59e0b", "#ef4444", "#ec4899",
];

const TAG_NAMES = {
  100: "Melting",
  201: "PDC Fettling-1",
  401: "PDC Fettling-2",
  601: "MC Shop Bay 2",
  801: "MC Shop Bay 1",
  1000: "Quality PDC",
  2000: "Quality MC",
};

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalItems: 0, totalQuantity: 0, rejectionCount: 0,
  });
  const [stageData, setStageData] = useState([]);
  const [tagData, setTagData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [summaryRes, stageRes, tagRes, monthlyRes] = await Promise.all([
        API.get("/api/analytics/summary"),
        API.get("/api/analytics/stage-distribution"),
        API.get("/api/analytics/tag-stock"),
        API.get("/api/analytics/monthly-growth"),
      ]);

      setSummary(summaryRes.data);

      setStageData(
        stageRes.data.map((d) => ({
          name: d._id,
          value: d.totalQuantity,
          count: d.count,
        }))
      );

      setTagData(
        tagRes.data.map((d) => ({
          name: TAG_NAMES[d._id] || `Tag ${d._id}`,
          tagNo: d._id,
          qty: d.totalQuantity,
        }))
      );

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      setMonthlyData(
        monthlyRes.data.map((d) => ({
          name: `${months[d._id.month - 1]} ${d._id.year}`,
          qty: d.totalQuantity,
        }))
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Items",
      value: summary.totalItems,
      icon: Boxes,
      gradient: "gradient-brand",
      glow: "glow-brand",
    },
    {
      title: "Total Quantity",
      value: summary.totalQuantity,
      icon: Package,
      gradient: "gradient-info",
      glow: "",
    },
    {
      title: "Rejections",
      value: summary.rejectionCount,
      icon: AlertTriangle,
      gradient: "gradient-danger",
      glow: "",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card rounded-2xl p-5 relative overflow-hidden group`}
          >
            {/* Gradient accent */}
            <div
              className={`absolute top-0 right-0 w-24 h-24 ${card.gradient} rounded-full -translate-y-8 translate-x-8 opacity-20 group-hover:opacity-30 transition-opacity`}
            />

            <div className="relative z-10">
              <div
                className={`w-10 h-10 rounded-xl ${card.gradient} flex items-center justify-center mb-3 ${card.glow}`}
              >
                <card.icon size={20} className="text-white" />
              </div>
              <p className="text-dark-400 text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                <CountUp
                  end={card.value}
                  duration={2}
                  decimals={card.decimals || 0}
                  separator=","
                />
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Stage Distribution
          </h3>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid rgba(148,163,184,0.1)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No data available
            </div>
          )}
        </motion.div>

        {/* Tag-wise Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Tag-wise Stock
          </h3>
          {tagData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid rgba(148,163,184,0.1)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="qty" fill="#6366f1" radius={[6, 6, 0, 0]} name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-dark-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Growth Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Monthly Growth Trend
        </h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(148,163,184,0.1)",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="qty"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", strokeWidth: 0, r: 4 }}
                name="Quantity"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-dark-500">
            No data available yet
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
