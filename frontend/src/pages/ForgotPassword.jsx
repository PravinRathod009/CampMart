import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <h1 className="text-lg sm:text-xl font-semibold text-center mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 text-center mb-6">We'll email you a link to reset it</p>

        {message && <p role="status" className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg mb-4 text-sm">{message}</p>}
        {error && <p role="alert" className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="Your registered email"
              className="input-field mt-1.5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          <Link to="/login" className="text-primary font-medium hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
