import { Star } from "lucide-react";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="group block overflow-hidden rounded-xl bg-panel">
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        {movie.poster_path ? (
          <img src={movie.poster_path.startsWith("http") ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-end p-4 font-display text-xl font-bold text-zinc-500">{movie.title}</div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 p-3 transition duration-300 group-hover:translate-y-0">
          <p className="truncate font-display text-sm font-semibold text-zinc-50">{movie.title}</p>
          <span className="mt-1 flex items-center gap-1 text-xs text-amber"><Star size={13} fill="currentColor" /> {movie.vote_average?.toFixed?.(1) ?? movie.vote_average ?? "—"}</span>
        </div>
      </div>
      <div className="p-3 group-hover:bg-[#1a1a24]"><h3 className="truncate font-display text-sm font-semibold text-zinc-100">{movie.title}</h3></div>
    </Link>
  );
}

export default MovieCard;
