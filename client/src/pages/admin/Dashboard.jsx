import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import CountUp from "react-countup";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const fetchData = async () => {
    const res = await axios.get("https://inventory-saas-production-c345.up.railway.app/api/inventory");
    const inventories = res.data.data;

    setData(inventories);

    setTotalItems(inventories.length);

    const qty = inventories.reduce(
      (acc, item) => acc + Number(item.quantity || 0),
      0
    );
    setTotalQuantity(qty);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stageData = Object.values(
    data.reduce((acc, item) => {
      acc[item.stage] = acc[item.stage] || { name: item.stage, value: 0 };
      acc[item.stage].value += 1;
      return acc;
    }, {})
  );

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow p-6 rounded"
        >
          <h3 className="text-gray-500">Total Items</h3>
          <h2 className="text-3xl font-bold">
            <CountUp end={totalItems} duration={2} />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow p-6 rounded"
        >
          <h3 className="text-gray-500">Total Quantity</h3>
          <h2 className="text-3xl font-bold">
            <CountUp end={totalQuantity} duration={2} />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow p-6 rounded"
        >
          <h3 className="text-gray-500">Stages</h3>
          <h2 className="text-3xl font-bold">
            <CountUp end={stageData.length} duration={2} />
          </h2>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="mb-4 font-semibold">Stage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
              >
                {stageData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="mb-4 font-semibold">Inventory by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;