import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const statusConfig = {
  NotSubmitted: {
    color: "bg-gray-100 text-gray-600",
    label: "Not Verified",
    icon: "🪪",
  },
  Pending: {
    color: "bg-yellow-100 text-yellow-700",
    label: "Pending Review",
    icon: "⏳",
  },
  Approved: {
    color: "bg-green-100 text-green-700",
    label: "Verified Seller",
    icon: "✅",
  },
  Rejected: {
    color: "bg-red-100 text-red-700",
    label: "Verification Rejected",
    icon: "❌",
  },
};

const SellerVerification = () => {
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/users/verify-id/status");
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select an ID card image first", "error");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("idCard", file);
      await api.post("/users/verify-id", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("ID submitted! We'll review it shortly.", "success");
      setFile(null);
      await fetchStatus();
    } catch (err) {
      // error already toasted globally
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const config = statusConfig[status?.idVerificationStatus] || statusConfig.NotSubmitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-6 mt-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Seller Verification</h2>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        To keep CampusMart safe from fake and dummy sellers, we require a valid government or
        college ID before you can post listings. Your ID is only used for verification — it's
        never shown publicly.
      </p>

      <AnimatePresence mode="wait">
        {status?.idVerificationStatus === "Approved" && (
          <motion.p
            key="approved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-green-700 bg-green-50 rounded p-3"
          >
            🎉 You're a verified seller! You can post listings anytime.
          </motion.p>
        )}

        {status?.idVerificationStatus === "Pending" && (
          <motion.p
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-yellow-700 bg-yellow-50 rounded p-3"
          >
            Your ID is under review. This usually takes less than 24 hours — you'll be able to
            post listings as soon as it's approved.
          </motion.p>
        )}

        {(status?.idVerificationStatus === "NotSubmitted" || status?.idVerificationStatus === "Rejected") && (
          <motion.form
            key="submit-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="space-y-3"
          >
            {status?.idVerificationStatus === "Rejected" && status?.idVerificationRejectionReason && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-3">
                Your last submission was rejected: {status.idVerificationRejectionReason}. Please
                upload a clearer photo of a valid ID.
              </p>
            )}

            <div>
              <label className="text-sm text-gray-600">
                Upload a clear photo of your Government ID or College ID Card
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded p-2 mt-1"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-xs text-gray-400 mt-1">
                Accepted: Aadhaar, PAN, Driving License, Passport, or College ID. JPG/PNG, max 5MB.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SellerVerification;
