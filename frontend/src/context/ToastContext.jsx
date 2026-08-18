import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

let idCounter = 0;

const styles = {
  success: "bg-primary",
  error: "bg-red-500",
  info: "bg-gray-800",
  warning: "bg-yellow-500",
};

const icons = {
  success: "✅",
  error: "⚠️",
  info: "ℹ️",
  warning: "⏳",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success", duration = 3500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={() => removeToast(t.id)}
              className={`pointer-events-auto cursor-pointer rounded-lg shadow-lg px-4 py-3 text-sm font-medium text-white flex items-center gap-2 ${styles[t.type] || styles.success}`}
            >
              <span>{icons[t.type] || icons.success}</span>
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
