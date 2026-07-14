function SkeletonCard({ compact = false }) {
  return (
    <div
      aria-hidden="true"
      className={`shrink-0 overflow-hidden border border-white/[0.09] bg-[#111218] ${compact ? "w-[148px] sm:w-[164px]" : "w-full"}`}
    >
      <div className="skeleton-shimmer aspect-[2/3] w-full animate-pulse" />
      <div className="border-t border-white/[0.07] px-3 py-2.5">
        <div className="skeleton-shimmer h-3 w-4/5 animate-pulse" />
        <div className="skeleton-shimmer mt-2 h-2.5 w-2/5 animate-pulse" />
      </div>
    </div>
  );
}

export default SkeletonCard;
