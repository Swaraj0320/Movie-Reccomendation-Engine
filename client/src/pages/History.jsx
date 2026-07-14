import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    api.get("/api/history/")
      .then((response) => setHistory(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || "Unable to load your watch history."))
      .finally(() => setIsLoading(false));
  }, [user, navigate]);

  const removeEntry = async (movieId) => {
    try {
      await api.delete(`/api/history/${movieId}`);
      setHistory((items) => items.filter((movie) => movie.movie_id !== movieId));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to remove this history entry.");
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete("/api/history/");
      setHistory([]);
      setIsConfirmingClear(false);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to clear your watch history.");
    }
  };

  if (isLoading) return <div className="page-shell text-sm text-zinc-400">Loading your watch history…</div>;

  return (
    <div className="page-shell">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Trailer activity</p>
          <h1 className="page-title">Watch history</h1>
        </div>
        {history.length > 0 && <button onClick={() => setIsConfirmingClear(true)} className="ghost-button border-red-900/60 text-red-300 hover:border-red-500 hover:text-red-200">Clear all history</button>}
      </div>
      {error && <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
      {!error && history.length === 0 && <p className="mt-8 text-zinc-400">No watched movies yet — trailers you watch will show up here.</p>}
      {history.length > 0 && <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{history.map((movie) => (
        <div key={movie.movie_id} className="group relative">
          <Link to={`/movies/${movie.movie_id}`} className="group block overflow-hidden rounded-xl bg-panel">
            <div className="aspect-[2/3] overflow-hidden bg-zinc-900">{movie.poster_path ? <img src={movie.poster_path.startsWith("http") ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.movie_title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-end p-4 font-display text-xl font-bold text-zinc-500">{movie.movie_title}</div>}</div>
            <div className="p-3"><h2 className="truncate font-display text-sm font-semibold text-zinc-100">{movie.movie_title}</h2><p className="mt-2 text-xs text-zinc-500">Watched {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(movie.watched_at))}</p></div>
          </Link>
          <button onClick={() => removeEntry(movie.movie_id)} className="absolute right-2 top-2 rounded-lg bg-ink/90 p-2 text-zinc-300 opacity-0 transition hover:text-red-300 group-hover:opacity-100" aria-label={`Remove ${movie.movie_title} from watch history`}><Trash2 size={16} /></button>
        </div>
      ))}</div>}
      {isConfirmingClear && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true" aria-labelledby="clear-history-title"><div className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl"><h2 id="clear-history-title" className="font-display text-xl font-semibold text-zinc-100">Clear all history?</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Are you sure you want to clear your entire watch history? This cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setIsConfirmingClear(false)} className="ghost-button">Cancel</button><button onClick={clearHistory} className="primary-button bg-red-500 text-white hover:bg-red-400">Yes</button></div></div></div>}
    </div>
  );
}

export default History;
