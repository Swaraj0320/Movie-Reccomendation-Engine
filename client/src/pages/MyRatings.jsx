import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function MyRatings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadRatings = async () => {
      try {
        const ratingsResponse = await api.get("/api/ratings/user/all");
        const movies = await Promise.all(
          ratingsResponse.data.map(async (rating) => {
            const movieResponse = await api.get(`/api/movies/${rating.movie_id}`);
            return { ...movieResponse.data, rating: rating.rating };
          }),
        );
        setRatings(movies);
      } catch (requestError) {
        setError(requestError.response?.data?.detail || "Unable to load your ratings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRatings();
  }, [user, navigate]);

  const removeRating = async (movieId) => {
    try { await api.delete(`/api/ratings/${movieId}`); setRatings((items) => items.filter((movie) => movie.id !== movieId)); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to remove this rating."); }
  };

  if (isLoading) return <div className="page-shell text-sm text-zinc-400">Loading your ratings…</div>;

  return (
    <div className="page-shell">
      <p className="section-kicker">Your scores</p>
      <h1 className="page-title">My ratings</h1>
      {error && <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
      {!error && ratings.length === 0 && <p className="mt-8 text-zinc-400">You haven&apos;t rated any movies yet.</p>}
      {ratings.length > 0 && <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{ratings.map((movie) => (
        <div key={movie.id} className="group relative">
        <Link to={`/movies/${movie.id}`} className="group block overflow-hidden rounded-xl bg-panel">
          <div className="aspect-[2/3] overflow-hidden bg-zinc-900">{movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-end p-4 font-display text-xl font-bold text-zinc-500">{movie.title}</div>}</div>
          <div className="p-3"><h2 className="truncate font-display text-sm font-semibold text-zinc-100">{movie.title}</h2><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-1 text-xs font-bold text-amber"><Star size={13} fill="currentColor" /> {movie.rating}/10</span></div>
        </Link>
        <button onClick={() => removeRating(movie.id)} className="absolute right-2 top-2 rounded-lg bg-ink/90 p-2 text-zinc-300 opacity-0 transition hover:text-red-300 group-hover:opacity-100" aria-label={`Remove ${movie.title} rating`}><Trash2 size={16} /></button>
        </div>
      ))}</div>}
    </div>
  );
}

export default MyRatings;
