import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const StageChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Stage Distribution</h2>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="stage"
          outerRadius={100}
          fill="#8884d8"
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default StageChart;