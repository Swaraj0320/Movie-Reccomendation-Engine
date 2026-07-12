import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../api/axios";
import MovieCard from "../components/MovieCard";

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/movies/trending")
      .then((response) => setMovies(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || "Unable to load trending movies right now."))
      .finally(() => setIsLoading(false));
  }, []);

  return <div className="page-shell"><section className="border-b border-line pb-10 sm:pb-14"><p className="section-kicker">The projector is on</p><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h1 className="page-title max-w-2xl text-4xl sm:text-5xl">Find the next film worth staying up for.</h1><p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">Browse what is rising now, then shape recommendations around the genres, languages and years you actually enjoy.</p></div><Link to="/recommendations" className="primary-button">Build your watchlist <ArrowRight size={17} /></Link></div></section><section className="pt-9"><div className="mb-6 flex items-center justify-between"><div><p className="section-kicker">This week</p><h2 className="font-display text-2xl font-bold tracking-tight">Trending in India and beyond</h2></div><span className="text-sm text-zinc-500">Hindi favourites and global hits</span></div>{error && <p className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}{isLoading && <p className="text-sm text-zinc-400">Loading trending films…</p>}{!isLoading && !error && movies.length === 0 && <p className="text-sm text-zinc-500">No trending films are available right now.</p>}{movies.length > 0 && <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>}</section></div>;
}

export default Home;
