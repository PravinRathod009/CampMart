import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";
import { ProductGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const categoryChips = [
  { label: "Books", icon: "📚" },
  { label: "Laptops", icon: "💻" },
  { label: "Notes", icon: "📝" },
  { label: "Lab Equipment", icon: "🧪" },
  { label: "Calculators", icon: "🧮" },
  { label: "Hostel Essentials", icon: "🛏️" },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync keyword if the navbar search updates the URL query param
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setKeyword(q);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = { ...filters, keyword, page };
      const { data } = await api.get("/products", { params });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const applyCategoryChip = (label) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, category: prev.category === label ? "" : label }));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 mb-6 text-white text-center">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
          Buy &amp; Sell Within Your Campus
        </h1>
        <p className="text-sm sm:text-base text-primary-light mb-5 max-w-xl mx-auto">
          Textbooks, gadgets, instruments and more — from students you can trust.
        </p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input
            type="search"
            placeholder="Search for products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="Search for products"
            className="flex-1 min-w-0 rounded-full px-4 py-2.5 text-sm sm:text-base text-gray-800 outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="bg-white text-primary font-semibold px-4 sm:px-5 py-2.5 rounded-full text-sm sm:text-base flex-shrink-0 hover:bg-gray-50 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category quick-filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide" role="group" aria-label="Filter by category">
        {categoryChips.map((c) => (
          <button
            key={c.label}
            onClick={() => applyCategoryChip(c.label)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              filters.category === c.label
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary"
            }`}
          >
            <span aria-hidden="true">{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Mobile filter toggle */}
      <div className="flex items-center justify-between mb-3 md:hidden">
        <p className="text-sm text-gray-500 dark:text-gray-400">{loading ? "Searching..." : `${total} item${total === 1 ? "" : "s"} found`}</p>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium border border-gray-300 dark:border-gray-700 dark:text-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Desktop sidebar filters */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-20">
            <Filters filters={filters} setFilters={(f) => { setPage(1); setFilters(f); }} />
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 left-0 h-full w-[85%] max-w-xs bg-gray-50 dark:bg-gray-900 z-50 md:hidden overflow-y-auto p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200">
                    ✕
                  </button>
                </div>
                <Filters filters={filters} setFilters={(f) => { setPage(1); setFilters(f); }} />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn-primary w-full mt-4"
                >
                  Show Results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="md:col-span-3">
          <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mb-3">
            {loading ? "Searching..." : `${total} item${total === 1 ? "" : "s"} found`}
          </p>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState
              title="Couldn't load listings"
              description="Something went wrong while fetching products. Please check your connection and try again."
              onRetry={fetchProducts}
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description="Try adjusting your search or filters — or check back soon as new listings are posted daily."
              actionLabel="Clear Filters"
              onAction={() => { setFilters({}); setKeyword(""); setPage(1); }}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {pages > 1 && (
                <div className="flex justify-center flex-wrap gap-2 mt-6 sm:mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border dark:border-gray-700 dark:text-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    aria-label="Previous page"
                  >
                    Prev
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={page === n ? "page" : undefined}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === n ? "bg-primary text-white" : "bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 border hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border dark:border-gray-700 dark:text-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
