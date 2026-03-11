import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const LOCATION_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899",
];

const TAG_RANGES = [
  { min: 100,  max: 200,  location: "Melting" },
  { min: 201,  max: 400,  location: "PDC Fettling-1" },
  { min: 401,  max: 600,  location: "PDC Fettling-2" },
  { min: 601,  max: 800,  location: "MC Shop Bay 2" },
  { min: 801,  max: 999,  location: "MC Shop Bay 1" },
  { min: 1000, max: 1999, location: "Quality PDC" },
  { min: 2000, max: 9999, location: "Quality MC" },
];

const getLocationLabel = (tagNo) => {
  const num = parseInt(tagNo);
  const match = TAG_RANGES.find((r) => num >= r.min && num <= r.max);
  return match ? match.location : `Tag ${tagNo}`;
};

// Group raw tag data into location buckets
const groupByLocation = (data = []) => {
  const map = {};
  data.forEach((d) => {
    const label = getLocationLabel(d.tag);
    if (!map[label]) map[label] = { name: label, qty: 0 };
    map[label].qty += d.total;
  });
  return Object.values(map);
};

const TagChart = ({ data = [] }) => {
  const locationData = groupByLocation(data);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Location-wise Stock</h2>

      {locationData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
              angle={-20}
              textAnchor="end"
              height={70}
              interval={0}
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
              formatter={(value) => [value, "Quantity"]}
            />
            <Bar dataKey="qty" radius={[6, 6, 0, 0]} name="Quantity">
              {locationData.map((_, i) => (
                <Cell key={i} fill={LOCATION_COLORS[i % LOCATION_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-dark-500">
          No data available
        </div>
      )}
    </div>
  );
};

export default TagChart;
