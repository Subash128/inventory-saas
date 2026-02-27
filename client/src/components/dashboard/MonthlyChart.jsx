import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MonthlyChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Monthly Growth</h2>
      <LineChart width={900} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
};

export default MonthlyChart;