import { Bookmark, Check, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RatingStars from "../components/RatingStars";
import TrailerModal from "../components/TrailerModal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function MovieDetails() {
  const { movieId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [videoKey, setVideoKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMovie = async () => {
      setIsLoading(true); setError("");
      try {
        const detailsRequest = api.get(`/api/movies/${movieId}`);
        const protectedRequests = user ? Promise.all([api.get(`/api/ratings/${movieId}`), api.get("/api/watchlist/")]) : null;
        const details = await detailsRequest;
        setMovie(details.data);
        if (protectedRequests) {
          const [ratingResponse, watchlistResponse] = await protectedRequests;
          setRating(ratingResponse.data.user_rating || 0);
          setIsWatchlisted(watchlistResponse.data.some((item) => item.movie_id === Number(movieId)));
        } else { setRating(0); setIsWatchlisted(false); }
      } catch (requestError) { setError(requestError.response?.data?.detail || "Unable to load this movie right now."); }
      finally { setIsLoading(false); }
    };
    loadMovie();
  }, [movieId, user]);

  const requireLogin = () => { if (!user) { navigate("/login"); return true; } return false; };
  const saveRating = async (nextRating) => {
    if (requireLogin()) return;
    try { setIsSaving(true); await api.post("/api/ratings/", { movie_id: Number(movieId), rating: nextRating }); setRating(nextRating); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to save your rating."); }
    finally { setIsSaving(false); }
  };
  const toggleWatchlist = async () => {
    if (requireLogin()) return;
    try { setIsSaving(true); if (isWatchlisted) await api.delete(`/api/watchlist/${movieId}`); else await api.post("/api/watchlist/", { movie_id: Number(movieId) }); setIsWatchlisted((value) => !value); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to update your watchlist."); }
    finally { setIsSaving(false); }
  };
  const watchTrailer = async () => {
    try { const response = await api.get(`/api/movies/${movieId}/trailer`); if (response.data.key) setVideoKey(response.data.key); else setError("No trailer is available for this movie."); }
    catch { setError("Unable to load the trailer right now."); }
  };

  if (isLoading) return <div className="page-shell text-sm text-zinc-400">Loading film details…</div>;
  if (!movie) return <div className="page-shell text-sm text-red-300">{error || "Movie not found."}</div>;
  return <div className="page-shell"><p className="mb-3 text-[13px] font-bold uppercase tracking-[0.2em] text-amber">Film details</p>{error && <p className="mb-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}<div className="grid gap-9 md:grid-cols-[280px_1fr]"><div className="aspect-[2/3] overflow-hidden rounded-xl border border-line bg-panel">{movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-end p-5 font-display text-2xl font-bold text-zinc-500">{movie.title}</div>}</div><section><h1 className="font-display text-[34px] font-bold tracking-tight text-zinc-50 sm:text-[40px]">{movie.title}</h1><p className="mt-3 text-sm text-zinc-400">{movie.release_date?.slice(0, 4) || "Release date unavailable"} <span className="mx-2 text-zinc-700">•</span> TMDB {movie.vote_average?.toFixed?.(1) ?? "—"}/10</p><div className="mt-4 flex flex-wrap gap-2">{movie.genres.map((genre) => <span key={genre.id} className="rounded-full border border-line px-3 py-1 text-xs text-zinc-400">{genre.name}</span>)}</div><p className="mt-5 max-w-2xl leading-7 text-zinc-400">{movie.overview || "No overview is available for this movie."}</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={watchTrailer} className="primary-button"><Play size={17} fill="currentColor" /> Watch trailer</button><button onClick={toggleWatchlist} disabled={isSaving} className="ghost-button">{isWatchlisted ? <Check size={17} className="text-amber" /> : <Bookmark size={17} />} {isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}</button></div><div className="mt-10 border-t border-line pt-6"><p className="mb-2 text-sm font-semibold text-zinc-300">Your rating {rating ? `— ${rating}/10` : ""}</p><RatingStars value={rating} onChange={saveRating} /><p className="mt-2 text-xs text-zinc-500">Select a score from 1 to 10.</p></div></section></div><TrailerModal videoKey={videoKey} movie={movie} onClose={() => setVideoKey(null)} /></div>;
}

export default MovieDetails;
