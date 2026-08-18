import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get("/users/wishlist");
      setProducts(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800 dark:text-gray-100">My Wishlist</h1>

      {loading ? (
        <ProductGridSkeleton count={6} />
      ) : error ? (
        <ErrorState onRetry={fetchWishlist} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          description="Save items you're interested in and find them here later."
          actionLabel="Browse Products"
          actionTo="/"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} isWishlisted />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
