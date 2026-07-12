import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import MovieCard from "../components/MovieCard";
import { useAuth } from "../context/AuthContext";

function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/api/watchlist/").then((response) => setMovies(response.data)).catch((requestError) => setError(requestError.response?.data?.detail || "Unable to load your watchlist.")).finally(() => setIsLoading(false));
  }, [user, navigate]);

  const removeMovie = async (movieId) => {
    try { await api.delete(`/api/watchlist/${movieId}`); setMovies((items) => items.filter((movie) => movie.movie_id !== movieId)); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to remove this movie."); }
  };

  if (isLoading) return <div className="page-shell text-sm text-zinc-400">Loading your watchlist…</div>;
  return <div className="page-shell"><p className="section-kicker">Saved for later</p><h1 className="page-title">Your watchlist</h1>{error && <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}{movies.length === 0 ? <p className="mt-8 text-zinc-400">No saved movies yet. <Link to="/search" className="text-amber hover:text-amber-soft">Find something to watch.</Link></p> : <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{movies.map((movie) => <div key={movie.movie_id} className="group relative"><MovieCard movie={movie} /><button onClick={() => removeMovie(movie.movie_id)} className="absolute right-2 top-2 rounded-lg bg-ink/90 p-2 text-zinc-300 opacity-0 transition hover:text-red-300 group-hover:opacity-100" aria-label={`Remove ${movie.title} from watchlist`}><Trash2 size={16} /></button></div>)}</div>}</div>;
}

export default Watchlist;
