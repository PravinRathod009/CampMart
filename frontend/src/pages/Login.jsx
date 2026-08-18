import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      showToast("Welcome back! 🎉", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md card p-6 sm:p-8"
      >
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-primary">
            Campus<span className="text-gray-800 dark:text-gray-100">Mart</span>
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mt-3">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to continue buying and selling on campus</p>
        </div>

        {error && (
          <p role="alert" className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`input-field mt-1.5 ${errors.email ? "border-red-400" : ""}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />
            {errors.email && <p id="login-email-error" className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="mt-1.5">
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                error={errors.password}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors.password && <p id="login-password-error" className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
