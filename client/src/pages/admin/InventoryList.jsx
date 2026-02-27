import { useEffect, useState } from "react";
import axios from "axios";

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    tag: "",
  });

  const fetchData = async () => {
    const { data } = await axios.get("/api/inventory", {
      params: filters,
    });
    setItems(data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Inventory Management</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="stage"
          placeholder="Stage"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="tag"
          placeholder="Tag"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply
        </button>
      </div>
<div className="flex gap-4 mt-4">
  <a
    href="/api/export/excel"
    className="bg-green-600 text-white px-4 py-2 rounded"
  >
    Export Excel
  </a>

  <a
    href="/api/export/pdf"
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Export PDF
  </a>
</div>
      {/* Table */}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Stage</th>
            <th className="p-2">Tag</th>
            <th className="p-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-t">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.stage}</td>
              <td className="p-2">{item.tag}</td>
              <td className="p-2">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;