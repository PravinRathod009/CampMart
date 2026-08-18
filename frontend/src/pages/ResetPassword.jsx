import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <h1 className="text-lg sm:text-xl font-semibold text-center mb-6">Reset Password</h1>

        {error && <p role="alert" className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</label>
            <div className="mt-1.5">
              <PasswordInput
                id="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>
          <button disabled={submitting} className="btn-primary w-full py-2.5">
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
