import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";

const streams = ["Engineering", "Medical", "Pharmacy", "Arts", "Commerce", "Science", "Other"];

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData) => {
    setError("");
    setSubmitting(true);
    try {
      await registerUser(formData);
      showToast("Account created successfully! 🎉", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mt-3">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join students already buying &amp; selling on campus</p>
        </div>

        {error && (
          <p role="alert" className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              id="reg-name"
              autoComplete="name"
              className={`input-field mt-1.5 ${errors.name ? "border-red-400" : ""}`}
              aria-invalid={!!errors.name}
              {...register("name", { required: "Full name is required" })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              className={`input-field mt-1.5 ${errors.email ? "border-red-400" : ""}`}
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="mt-1.5">
              <PasswordInput
                id="reg-password"
                autoComplete="new-password"
                error={errors.password}
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-college" className="text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
            <input id="reg-college" className="input-field mt-1.5" {...register("college")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-stream" className="text-sm font-medium text-gray-700 dark:text-gray-300">Stream</label>
              <select id="reg-stream" className="input-field mt-1.5" {...register("stream")}>
                <option value="">Select</option>
                {streams.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="reg-year" className="text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
              <input id="reg-year" className="input-field mt-1.5" {...register("academicYear")} placeholder="e.g. 2nd Year" />
            </div>
          </div>

          <div>
            <label htmlFor="reg-branch" className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
            <input id="reg-branch" className="input-field mt-1.5" {...register("branch")} placeholder="e.g. Computer Science" />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5"
          >
            {submitting ? "Creating account..." : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
