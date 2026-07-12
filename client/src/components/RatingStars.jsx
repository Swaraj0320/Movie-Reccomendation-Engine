import { Star } from "lucide-react";

function RatingStars({ value = 0, onChange }) {
  return <div className="flex gap-1">{Array.from({ length: 10 }, (_, index) => <button key={index} type="button" onClick={() => onChange?.(index + 1)} aria-label={`Rate ${index + 1} out of 10`} className={index < value ? "text-amber" : "text-zinc-700"}><Star size={18} fill="currentColor" /></button>)}</div>;
}

export default RatingStars;
