import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { useToast } from "./context/ToastContext";
import { registerToastHandler } from "./api/axios";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ProductDetail from "./pages/ProductDetail";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import OrderReceipt from "./pages/OrderReceipt";

const PageFade = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    registerToastHandler(showToast);
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageFade><Home /></PageFade>} />
          <Route path="/login" element={<PageFade><Login /></PageFade>} />
          <Route path="/register" element={<PageFade><Register /></PageFade>} />
          <Route path="/forgot-password" element={<PageFade><ForgotPassword /></PageFade>} />
          <Route path="/reset-password/:token" element={<PageFade><ResetPassword /></PageFade>} />
          <Route path="/verify-email/:token" element={<PageFade><VerifyEmail /></PageFade>} />
          <Route path="/products/:id" element={<PageFade><ProductDetail /></PageFade>} />

          <Route path="/dashboard" element={<PrivateRoute><PageFade><Dashboard /></PageFade></PrivateRoute>} />
          <Route path="/create-listing" element={<PrivateRoute><PageFade><CreateListing /></PageFade></PrivateRoute>} />
          <Route path="/my-listings" element={<PrivateRoute><PageFade><MyListings /></PageFade></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><PageFade><Wishlist /></PageFade></PrivateRoute>} />
          <Route path="/order-confirmation/:orderId" element={<PrivateRoute><PageFade><OrderReceipt /></PageFade></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><PageFade><Profile /></PageFade></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><PageFade><Admin /></PageFade></PrivateRoute>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
