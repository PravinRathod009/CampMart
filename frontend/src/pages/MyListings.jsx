import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import { ListRowSkeleton } from "../components/Skeletons";
import ErrorState from "../components/ErrorState";

const statusStyles = {
  Available: "bg-green-100 text-green-700",
  Reserved: "bg-yellow-100 text-yellow-700",
  Sold: "bg-red-100 text-red-600",
};

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMine = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/products/mine/all");
      setProducts(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMine(); }, []);

  const markSold = async (id) => {
    await api.put(`/products/${id}/sold`);
    fetchMine();
  };

  const remove = async (id) => {
    if (!confirm("Delete this listing?")) return;
    await api.delete(`/products/${id}`);
    fetchMine();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800 dark:text-gray-100">My Listings</h1>

      {loading ? (
        <div className="card divide-y divide-gray-100">
          {Array.from({ length: 3 }).map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={fetchMine} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="You haven't posted anything yet"
          description="List your first item and start selling to other students on campus."
          actionLabel="Post a Listing"
          actionTo="/create-listing"
        />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="card p-3 sm:p-4 flex flex-col xs:flex-row sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <img
                src={p.images?.[0] || "https://via.placeholder.com/100"}
                alt={p.title}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0 w-full">
                <Link to={`/products/${p._id}`} className="font-semibold text-gray-800 dark:text-gray-100 hover:text-primary line-clamp-1">{p.title}</Link>
                <p className="text-primary font-bold">₹{p.price}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[p.status] || "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Approval: {p.approvalStatus}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">👁 {p.views}</span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                {p.status !== "Sold" && (
                  <button onClick={() => markSold(p._id)} className="flex-1 sm:flex-none text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark">
                    Mark Sold
                  </button>
                )}
                <button onClick={() => remove(p._id)} className="flex-1 sm:flex-none text-sm border border-red-400 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
