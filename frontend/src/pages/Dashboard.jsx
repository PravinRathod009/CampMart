import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ listings: 0, sold: 0, wishlist: 0, purchases: 0 });
  const [recentListings, setRecentListings] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, wishlistRes, purchasesRes] = await Promise.all([
          api.get("/products/mine/all"),
          api.get("/users/wishlist"),
          api.get("/payments/my-purchases"),
        ]);

        const listings = listingsRes.data;
        setStats({
          listings: listings.length,
          sold: listings.filter((p) => p.status === "Sold").length,
          wishlist: wishlistRes.data.length,
          purchases: purchasesRes.data.length,
        });
        setRecentListings(listings.slice(0, 4));
        setRecentPurchases(purchasesRes.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500 dark:text-gray-400">Loading your dashboard...</p>;

  return (
    <motion.div
      className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        className="text-xl sm:text-2xl font-bold mb-1 text-gray-800 dark:text-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Welcome back, {user?.name?.split(" ")[0]} 👋
      </motion.h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">Here's what's happening with your account.</p>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {[
          { label: "Active Listings", value: stats.listings - stats.sold, color: "text-primary" },
          { label: "Items Sold", value: stats.sold, color: "text-green-600" },
          { label: "Wishlist Items", value: stats.wishlist, color: "text-pink-600" },
          { label: "Items Purchased", value: stats.purchases, color: "text-blue-600" },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
            className="card p-4 text-center"
          >
            <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/create-listing">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark"
          >
            + Post a Listing
          </motion.span>
        </Link>
        <Link to="/my-listings">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary-light dark:hover:bg-primary/10"
          >
            Manage Listings
          </motion.span>
        </Link>
        <Link to="/wishlist">
          <motion.span
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View Wishlist
          </motion.span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Listings</h2>
            <Link to="/my-listings" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentListings.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">You haven't posted anything yet.</p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((p) => (
                <motion.div key={p._id} whileHover={{ x: 4 }}>
                  <Link to={`/products/${p._id}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                    <img src={p.images?.[0] || "https://via.placeholder.com/60"} alt={p.title} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{p.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{p.price} · {p.status}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Recent Purchases</h2>
            <Link to="/wishlist" className="text-xs text-primary hover:underline">Browse more</Link>
          </div>
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">You haven't bought anything yet.</p>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((o) => (
                <motion.div key={o._id} whileHover={{ x: 4 }}>
                  <Link to={`/order-confirmation/${o._id}`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                    <img src={o.product?.images?.[0] || "https://via.placeholder.com/60"} alt={o.product?.title} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-100">{o.product?.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">₹{o.amount} · Paid</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
