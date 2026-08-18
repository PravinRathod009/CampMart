import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
  >
    {children}
  </Link>
);

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const closeMenu = () => setMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchValue ? `/?q=${encodeURIComponent(searchValue)}` : "/");
    setMobileSearchOpen(false);
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="bg-white dark:bg-gray-900 shadow sticky top-0 z-50 border-b border-transparent dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="w-5 h-4 flex flex-col justify-between">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-gray-700 dark:bg-gray-300 rounded"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-full bg-gray-700 dark:bg-gray-300 rounded"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-gray-700 dark:bg-gray-300 rounded"
              />
            </div>
          </button>

          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="text-xl sm:text-2xl font-bold text-primary flex-shrink-0">
            <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
              Campus<span className="text-gray-800 dark:text-gray-100">Mart</span>
            </motion.span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for books, laptops, instruments..."
                aria-label="Search products"
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-full pl-4 pr-10 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-5 flex-shrink-0">
            <NavLink to="/">Browse</NavLink>
            {user && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/create-listing">Sell</NavLink>
                <NavLink to="/wishlist">Wishlist</NavLink>
                <NavLink to="/my-listings">My Listings</NavLink>
                {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
                <Link to="/profile" aria-label="Your profile" className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </Link>
                <ThemeToggle />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark text-sm font-medium"
                >
                  Logout
                </motion.button>
              </>
            )}
            {!user && (
              <>
                <NavLink to="/login">Login</NavLink>
                <ThemeToggle />
                <Link to="/register">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark text-sm font-medium"
                  >
                    Register
                  </motion.span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: search toggle + theme + wishlist + profile icons */}
          <div className="flex md:hidden items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setMobileSearchOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-300">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/wishlist" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-300">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                  </svg>
                </Link>
                <Link to="/profile" className="p-1.5" aria-label="Your profile">
                  <div className="w-7 h-7 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-semibold text-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </Link>
              </>
            ) : (
              <Link to="/login" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Login">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 dark:text-gray-300">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search bar (collapsible) */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSearch}
              className="md:hidden overflow-hidden pb-3"
            >
              <input
                autoFocus
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-full px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              <Link onClick={closeMenu} to="/" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Browse</Link>
              {user ? (
                <>
                  <Link onClick={closeMenu} to="/dashboard" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Dashboard</Link>
                  <Link onClick={closeMenu} to="/create-listing" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Sell an Item</Link>
                  <Link onClick={closeMenu} to="/wishlist" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Wishlist</Link>
                  <Link onClick={closeMenu} to="/my-listings" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">My Listings</Link>
                  <Link onClick={closeMenu} to="/profile" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Profile</Link>
                  {user.role === "admin" && (
                    <Link onClick={closeMenu} to="/admin" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Admin</Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full bg-primary text-white py-2.5 rounded-lg font-semibold"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link onClick={closeMenu} to="/login" className="py-2.5 text-gray-700 dark:text-gray-200 font-medium border-b border-gray-50 dark:border-gray-800">Login</Link>
                  <Link
                    onClick={closeMenu}
                    to="/register"
                    className="mt-2 w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
