import { Link } from "react-router-dom";

const UserHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome {user?.name}
      </h1>

      <div className="space-x-4">
        <Link
          to="/user/inventory"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          My Inventory
        </Link>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserHome;