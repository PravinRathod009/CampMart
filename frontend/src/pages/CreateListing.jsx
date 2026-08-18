import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const categories = [
  "Books", "Notes", "Engineering Instruments", "Medical Equipment",
  "Drawing Instruments", "Lab Equipment", "Laptops", "Calculators",
  "Hostel Essentials", "Others",
];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

const CreateListing = () => {
  const { register, handleSubmit, control, setValue } = useForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data } = await api.get("/users/verify-id/status");
        setVerificationStatus(data.idVerificationStatus);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingVerification(false);
      }
    };
    checkVerification();
  }, []);

  const originalPrice = useWatch({ control, name: "originalPrice" });
  const purchaseDate = useWatch({ control, name: "purchaseDate" });
  const condition = useWatch({ control, name: "condition" });

  // Auto-fetch a suggested price whenever original price + condition are available
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!originalPrice || Number(originalPrice) <= 0 || !condition) {
        setSuggestion(null);
        return;
      }
      setSuggestLoading(true);
      try {
        const { data } = await api.post("/products/suggest-price", {
          originalPrice: Number(originalPrice),
          purchaseDate: purchaseDate || undefined,
          condition,
        });
        setSuggestion(data);
      } catch (err) {
        setSuggestion(null);
      } finally {
        setSuggestLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestion, 400);
    return () => clearTimeout(debounce);
  }, [originalPrice, purchaseDate, condition]);

  const applySuggestion = () => {
    if (!suggestion) return;
    setValue("price", suggestion.suggestedPrice);
    showToast(`Applied suggested price: ₹${suggestion.suggestedPrice}`, "success");
  };

  const onSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") fd.append(key, value);
      });
      images.forEach((img) => fd.append("images", img));

      const { data } = await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Listing posted successfully! 🎉", "success");
      navigate(`/products/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {checkingVerification ? (
        <p className="text-center text-gray-500">Checking your seller verification status...</p>
      ) : verificationStatus !== "Approved" ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-8 text-center"
        >
          <p className="text-5xl mb-3">🪪</p>
          <h2 className="text-xl font-bold mb-2">Seller Verification Required</h2>
          <p className="text-gray-500 mb-6">
            {verificationStatus === "Pending"
              ? "Your ID is under review. You'll be able to post listings as soon as it's approved (usually within 24 hours)."
              : verificationStatus === "Rejected"
              ? "Your last ID submission was rejected. Please resubmit a clearer photo from your profile."
              : "To keep CampusMart free of fake or dummy sellers, please verify your identity with a government or college ID before posting a listing."}
          </p>
          <Link
            to="/profile"
            className="inline-block bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary-dark"
          >
            {verificationStatus === "Rejected" ? "Resubmit ID" : "Go to Profile to Verify"}
          </Link>
        </motion.div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Post a New Listing</h2>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Title</label>
            <input className="w-full border rounded p-2 mt-1" {...register("title", { required: true })} />
          </div>

          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea rows={4} className="w-full border rounded p-2 mt-1" {...register("description", { required: true })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <select className="w-full border rounded p-2 mt-1" {...register("category", { required: true })}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Condition</label>
              <select className="w-full border rounded p-2 mt-1" {...register("condition", { required: true })}>
                {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* --- Smart Price Suggestion --- */}
          <div className="bg-primary-light/40 border border-primary-light rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-primary-dark">💡 Get a fair price suggestion</p>
            <p className="text-xs text-gray-500">
              Tell us what you originally paid and when — we'll factor in age and condition to suggest a fair resale price.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Original Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  className="w-full border rounded p-2 mt-1"
                  {...register("originalPrice")}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Purchase Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 mt-1"
                  {...register("purchaseDate")}
                />
              </div>
            </div>

            <AnimatePresence>
              {suggestLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-gray-400"
                >
                  Calculating suggested price...
                </motion.p>
              )}

              {!suggestLoading && suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-primary-light"
                >
                  <div>
                    <p className="text-lg font-bold text-primary">Suggested: ₹{suggestion.suggestedPrice}</p>
                    <p className="text-xs text-gray-500">
                      Based on {suggestion.ageInYears} yr(s) old · {condition} condition
                      {" "}(age factor ×{suggestion.ageFactor}, condition ×{suggestion.conditionMultiplier})
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applySuggestion}
                    className="bg-primary text-white text-sm px-3 py-1.5 rounded font-semibold hover:bg-primary-dark"
                  >
                    Use this price
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Listing Price (₹)</label>
              <input type="number" className="w-full border rounded p-2 mt-1" {...register("price", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <input className="w-full border rounded p-2 mt-1" {...register("location", { required: true })} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Images (up to 6)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full border rounded p-2 mt-1"
              onChange={(e) => setImages(Array.from(e.target.files))}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-2 rounded font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Listing"}
          </motion.button>
        </form>
      </motion.div>
      )}
    </div>
  );
};

export default CreateListing;
