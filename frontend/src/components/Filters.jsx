const categories = [
  "Books", "Notes", "Engineering Instruments", "Medical Equipment",
  "Drawing Instruments", "Lab Equipment", "Laptops", "Calculators",
  "Hostel Essentials", "Others",
];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

const Filters = ({ filters, setFilters }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({})}
            className="text-xs text-primary hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <label htmlFor="filter-category" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</label>
        <select
          id="filter-category"
          className="input-field mt-1.5"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="filter-condition" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Condition</label>
        <select
          id="filter-condition"
          className="input-field mt-1.5"
          value={filters.condition || ""}
          onChange={(e) => update("condition", e.target.value)}
        >
          <option value="">Any Condition</option>
          {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price Range (₹)</label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            className="input-field w-1/2"
            value={filters.minPrice || ""}
            onChange={(e) => update("minPrice", e.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            className="input-field w-1/2"
            value={filters.maxPrice || ""}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-location" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</label>
        <input
          id="filter-location"
          type="text"
          placeholder="City / area"
          className="input-field mt-1.5"
          value={filters.location || ""}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="filter-sort" className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sort By</label>
        <select
          id="filter-sort"
          className="input-field mt-1.5"
          value={filters.sort || "latest"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;
