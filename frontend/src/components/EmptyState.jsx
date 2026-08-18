import { motion } from "framer-motion";

/**
 * Generic empty-state block — used for "no products found", "empty wishlist/cart",
 * "no conversations yet", etc. Keeps empty states visually consistent app-wide.
 */
const EmptyState = ({ icon = "📦", title, description, actionLabel, onAction, actionTo }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center text-center py-14 px-4"
  >
    <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    )}
    {actionLabel && actionTo && (
      <a href={actionTo} className="btn-primary inline-block">
        {actionLabel}
      </a>
    )}
  </motion.div>
);

export default EmptyState;
