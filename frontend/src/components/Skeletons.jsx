// Reusable skeleton loading placeholders — keeps loading UI consistent across pages.

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="h-36 sm:h-44 skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 rounded skeleton" />
      <div className="h-4 w-1/2 rounded skeleton" />
      <div className="h-3 w-2/3 rounded skeleton" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ListRowSkeleton = () => (
  <div className="flex items-center gap-3 p-4">
    <div className="w-16 h-16 rounded skeleton flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-2/3 rounded skeleton" />
      <div className="h-3 w-1/3 rounded skeleton" />
    </div>
  </div>
);
