import { motion } from "framer-motion";

/**
 * Generic error-state block for failed API calls — with an optional retry action.
 */
const ErrorState = ({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-14 px-4"
    role="alert"
  >
    <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary">
        Try Again
      </button>
    )}
  </motion.div>
);

export default ErrorState;
