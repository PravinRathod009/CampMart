import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ProductCard = ({ product, isWishlisted = false }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishBusy, setWishBusy] = useState(false);

  const image = product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image";

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    setWishBusy(true);
    try {
      await api.post(`/users/wishlist/${product._id}`);
      setWishlisted((w) => !w);
      showToast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️", "success");
    } catch (err) {
      // global error toast handles failure
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="card overflow-hidden group"
    >
      <Link to={`/products/${product._id}`} className="block" aria-label={`View ${product.title}`}>
        <div className="relative h-32 sm:h-40 md:h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.img
            src={image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-accent text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow">
              {discountPercent}% OFF
            </span>
          )}

          {product.status && product.status !== "Available" && (
            <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {product.status}
            </span>
          )}

          <button
            onClick={toggleWishlist}
            disabled={wishBusy}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur flex items-center justify-center shadow hover:bg-white dark:hover:bg-gray-900 transition-colors"
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill={wishlisted ? "#ef4444" : "none"}
              stroke={wishlisted ? "#ef4444" : "#6b7280"}
              strokeWidth="2"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </button>
        </div>

        <div className="p-2.5 sm:p-3">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base line-clamp-1">{product.title}</h3>

          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
            <span className="text-primary font-bold text-base sm:text-lg">₹{product.price}</span>
            {hasDiscount && (
              <span className="text-gray-400 text-xs sm:text-sm line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {product.seller?.rating > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
              <span aria-hidden="true">⭐</span>
              <span>{product.seller.rating.toFixed(1)}</span>
              {product.seller?.isVerifiedSeller && (
                <span className="text-green-600 ml-1" title="Verified Seller">✅</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            <span className="truncate">{product.condition}</span>
            <span className="truncate max-w-[45%] text-right">{product.location}</span>
          </div>

          <span className="inline-block mt-2 text-[10px] sm:text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
