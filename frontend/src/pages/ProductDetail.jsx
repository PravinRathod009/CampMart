import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ErrorState from "../components/ErrorState";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    await api.post(`/users/wishlist/${product._id}`);
    showToast("Updated your wishlist ❤️", "success");
  };

  const reportListing = async () => {
    const reason = prompt("Why are you reporting this listing?");
    if (!reason) return;
    await api.post("/reports", { productId: product._id, reason });
    showToast("Report submitted. Our team will review it.", "info");
  };

  // --- Razorpay "Buy Now" checkout flow ---
  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    if (!window.Razorpay) {
      showToast("Payment gateway failed to load. Please refresh and try again.", "error");
      return;
    }

    setPaying(true);
    let orderCreated = false;
    try {
      const { data } = await api.post("/payments/create-order", { productId: product._id });
      orderCreated = true;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CampusMart",
        description: `Payment for ${data.productTitle}`,
        order_id: data.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#16a34a" },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Send the buyer to a proper payment confirmation / receipt page
            navigate(`/order-confirmation/${data.dbOrderId}`);
          } catch (err) {
            showToast("Payment verification failed. Contact support if money was deducted.", "error");
          }
        },
        modal: {
          // If the buyer closes the checkout without paying, release the hold
          // immediately so other buyers aren't blocked from purchasing it.
          ondismiss: async () => {
            setPaying(false);
            try {
              await api.post(`/payments/release/${product._id}`);
            } catch (err) {
              // ignore — the background cleanup job will release it anyway
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async () => {
        showToast("Payment failed. Please try again.", "error");
        try {
          await api.post(`/payments/release/${product._id}`);
        } catch (err) {
          // background cleanup job covers this too
        }
      });
      rzp.open();
    } catch (err) {
      if (err.response?.status === 409) {
        // Another buyer reserved/bought it first — refresh the product state
        showToast(err.response.data.message, "error", 5000);
        try {
          const { data: refreshed } = await api.get(`/products/${product._id}`);
          setProduct(refreshed);
        } catch (e) {
          // ignore refresh failure
        }
      }
      // other errors already toasted globally by the axios interceptor
    } finally {
      if (!orderCreated) setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
        <div className="h-72 sm:h-96 skeleton rounded-xl" />
        <div className="space-y-3">
          <div className="h-7 w-2/3 skeleton rounded" />
          <div className="h-9 w-1/3 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-5/6 skeleton rounded" />
          <div className="h-12 w-full skeleton rounded-lg mt-6" />
        </div>
      </div>
    );
  }
  if (fetchError) {
    return <ErrorState title="Couldn't load this listing" onRetry={() => window.location.reload()} />;
  }
  if (!product) {
    return (
      <ErrorState
        title="Product not found"
        description="This listing may have been removed or sold out."
        onRetry={() => navigate("/")}
      />
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const isOwnListing = product.seller?._id === user?._id;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[160px] sm:max-w-none">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <div className="h-64 sm:h-80 md:h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
            <motion.img
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              src={product.images?.[activeImg] || "https://via.placeholder.com/600x400?text=No+Image"}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {product.images?.map((img, i) => (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === activeImg}
                  className="flex-shrink-0"
                >
                  <img
                    src={img}
                    alt=""
                    className={`w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-snug">{product.title}</h1>

          <div className="flex items-baseline gap-2 my-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-primary">₹{product.price}</span>
            {hasDiscount && (
              <>
                <span className="text-gray-400 text-base sm:text-lg line-through">₹{product.originalPrice}</span>
                <span className="text-accent-dark bg-accent/10 text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2 text-xs sm:text-sm mb-4 flex-wrap">
            <span className="bg-primary-light text-primary-dark px-2 py-1 rounded-full">{product.category}</span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{product.condition}</span>
            <span className={`px-2 py-1 rounded-full font-medium ${
              product.status === "Sold" ? "bg-red-100 text-red-600" :
              product.status === "Reserved" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {product.status}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>📍 {product.location}</span>
            <span>👁 {product.views} views</span>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
            <p className="font-semibold text-gray-800 dark:text-gray-100">{product.seller?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{product.seller?.college}</p>
            {product.seller?.rating > 0 && (
              <p className="text-sm text-yellow-600">⭐ {product.seller.rating.toFixed(1)} ({product.seller.numReviews} reviews)</p>
            )}
          </div>

          <div className="space-y-3">
            {isOwnListing ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                This is your own listing.
              </p>
            ) : product.status === "Available" ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={paying}
                className="w-full bg-accent text-white px-4 py-3.5 rounded-lg font-bold hover:bg-accent-dark disabled:opacity-50 shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {paying ? (
                  "Opening secure checkout..."
                ) : (
                  <>🛒 Buy Now — ₹{product.price}</>
                )}
              </motion.button>
            ) : (
              <button disabled className="w-full bg-gray-200 dark:bg-gray-800 text-gray-500 px-4 py-3.5 rounded-lg font-bold cursor-not-allowed text-sm sm:text-base">
                {product.status === "Sold" ? "Sold Out" : "Currently Reserved"}
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleWishlist}
              className="w-full border border-primary text-primary px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-light dark:hover:bg-primary/10 text-sm sm:text-base"
            >
              ♥ Add to Wishlist
            </motion.button>

            <button onClick={reportListing} className="text-gray-400 hover:text-red-500 text-sm underline-offset-2 hover:underline">
              Report this listing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
