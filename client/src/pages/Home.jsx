import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../api/axios";

function posterUrl(posterPath, size = "w500") {
  return posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : null;
}

function EditorialMovieCard({ movie, compact = false }) {
  const year = movie.release_date?.slice(0, 4) || "—";
  const reviewSnippet = movie.overview?.trim() || `TMDB rating ${movie.vote_average?.toFixed?.(1) ?? "—"} out of 10`;
  return <Link to={`/movies/${movie.id}`} className={`group block shrink-0 overflow-hidden border border-white/[0.09] bg-[#111218] transition duration-[225ms] ease-out hover:scale-[1.045] hover:border-white/20 hover:shadow-[0_14px_28px_rgba(0,0,0,0.32)] ${compact ? "w-[148px] sm:w-[164px]" : "w-full"}`}><div className="relative aspect-[2/3] overflow-hidden bg-[#15161b]">{posterUrl(movie.poster_path) ? <img src={posterUrl(movie.poster_path)} alt={movie.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-end p-4 font-display text-lg font-medium text-zinc-500">{movie.title}</div>}<div className="absolute inset-x-0 bottom-0 translate-y-full bg-zinc-100 px-3 py-2.5 transition-transform duration-[225ms] ease-out group-hover:translate-y-0"><p className="line-clamp-2 text-[11px] leading-4 text-zinc-700">{reviewSnippet}</p><span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-zinc-900"><Star size={11} fill="currentColor" className="text-amber" /> {movie.vote_average?.toFixed?.(1) ?? "—"}/10</span></div></div><div className="border-t border-white/[0.07] px-3 py-2.5"><h3 className="truncate font-display text-[13px] font-medium text-zinc-200">{movie.title}</h3><div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500"><span>{year}</span><span className="flex items-center gap-1 text-amber"><Star size={11} fill="currentColor" /> {movie.vote_average?.toFixed?.(1) ?? "—"}</span></div></div></Link>;
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    api.get("/api/movies/trending")
      .then((response) => setMovies(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || "Unable to load trending movies right now."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (movies.length) setFeaturedMovie(movies[Math.floor(Math.random() * movies.length)]);
  }, [movies]);

  // The backend deliberately interleaves Hindi/India and global results, so split
  // the displayed sections by their alternating source and keep IDs exclusive.
  const globalSelection = movies.filter((_, index) => index % 2 === 1).slice(0, 10);
  const selection = globalSelection.length ? globalSelection : movies.slice(0, 10);
  const selectionIds = new Set(selection.map((movie) => movie.id));
  const indiaTrending = movies.filter((_, index) => index % 2 === 0 && !selectionIds.has(movies[index].id));

  return <div className="mx-auto w-full max-w-[1600px] px-5 pb-5 pt-8 sm:px-8 sm:pt-10 lg:px-12"><section className="relative overflow-hidden border-y border-white/[0.09] py-8 sm:py-10"><div className="absolute inset-y-0 right-0 hidden w-1/2 sm:block">{featuredMovie?.poster_path && <img src={posterUrl(featuredMovie.poster_path, "w780")} alt="" className="h-full w-full object-cover opacity-80" />}<div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/65 to-[#0a0a0f]/10" /></div><div className="relative max-w-xl"><p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber">Featured this week</p><h1 className="font-display text-[34px] font-medium leading-[1.08] tracking-[-0.04em] text-zinc-100 sm:text-[40px]">{featuredMovie ? featuredMovie.title : "Find the next film worth staying up for."}</h1><p className="mt-4 max-w-lg text-[15px] leading-6 text-zinc-400">{featuredMovie?.overview || "Explore a considered mix of Hindi favourites and global films selected from this week’s conversation."}</p><div className="mt-6 flex items-center gap-4"><Link to={featuredMovie ? `/movies/${featuredMovie.id}` : "/recommendations"} className="inline-flex items-center gap-2 bg-amber px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-amber-soft">View film <ArrowRight size={14} /></Link><Link to="/recommendations" className="text-[12px] font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-100">Refine your picks</Link></div></div></section><section className="pt-10"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Selected this week</p><h2 className="mt-2 font-display text-[22px] font-medium tracking-[-0.025em] text-zinc-100">A global cut</h2></div><span className="hidden text-[11px] uppercase tracking-[0.14em] text-zinc-600 sm:block">Scroll to explore</span></div>{error && <p className="border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}{isLoading && <p className="text-[15px] text-zinc-500">Loading this week&apos;s selection…</p>}{!isLoading && !error && movies.length === 0 && <p className="text-[15px] text-zinc-500">No trending films are available right now.</p>}{selection.length > 0 && <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">{selection.map((movie) => <EditorialMovieCard key={movie.id} movie={movie} compact />)}</div>}</section>{indiaTrending.length > 0 && <section className="border-t border-white/[0.09] pt-10"><div className="mb-6"><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Trending now</p><h2 className="mt-2 font-display text-[22px] font-medium tracking-[-0.025em] text-zinc-100">India and beyond</h2><p className="mt-2 text-[15px] text-zinc-500">Hindi favourites selected separately from the global edit above.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{indiaTrending.map((movie) => <EditorialMovieCard key={movie.id} movie={movie} />)}</div></section>}</div>;
}

export default Home;
