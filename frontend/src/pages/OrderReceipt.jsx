import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import ErrorState from "../components/ErrorState";

const OrderReceipt = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get(`/payments/order/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 animate-pulse space-y-4">
          <div className="h-6 w-1/2 skeleton rounded mx-auto" />
          <div className="h-4 w-1/3 skeleton rounded mx-auto" />
          <div className="h-32 w-full skeleton rounded mt-6" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return <ErrorState title="Couldn't load your receipt" onRetry={fetchOrder} />;
  }

  const isPaid = order.status === "Paid";

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          {isPaid ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4 text-3xl"
              >
                ✅
              </motion.div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Payment Successful</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your order has been confirmed. A copy of this receipt is saved to your account.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4 text-3xl">❌</div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Payment {order.status}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This payment did not complete successfully. If money was deducted, it will be refunded automatically.
              </p>
            </>
          )}
        </div>

        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-5">
          <div className="flex items-center gap-3 mb-5">
            <img
              src={order.product?.images?.[0] || "https://via.placeholder.com/80"}
              alt={order.product?.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <Link to={`/products/${order.product?._id}`} className="font-semibold text-gray-800 dark:text-gray-100 hover:text-primary line-clamp-1">
                {order.product?.title}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sold by {order.seller?.name}</p>
            </div>
          </div>

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Order ID</dt>
              <dd className="font-mono text-gray-700 dark:text-gray-200 text-xs sm:text-sm break-all text-right">{order._id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Razorpay Payment ID</dt>
              <dd className="font-mono text-gray-700 dark:text-gray-200 text-xs sm:text-sm break-all text-right">
                {order.razorpayPaymentId || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Date</dt>
              <dd className="text-gray-700 dark:text-gray-200">{new Date(order.createdAt).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Payment Status</dt>
              <dd className={`font-semibold ${isPaid ? "text-green-600" : "text-red-600"}`}>{order.status}</dd>
            </div>
          </dl>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Item Price</span>
              <span className="text-gray-700 dark:text-gray-200">₹{order.itemPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Platform Fee</span>
              <span className="text-gray-700 dark:text-gray-200">₹{order.platformFee}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
              <span className="text-gray-800 dark:text-gray-100">Total Paid</span>
              <span className="text-primary">₹{order.amount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-7 print:hidden">
          <button onClick={handlePrint} className="btn-secondary flex-1">
            🖨️ Print / Save Receipt
          </button>
          <Link to="/dashboard" className="btn-primary flex-1 text-center">
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderReceipt;
