import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import MovieCard from "../components/MovieCard";

function Search() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchAreaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setSuggestions([]);
      return undefined;
    }

    let isCurrent = true;
    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get("/api/movies/search", { params: { query: searchTerm } });
        if (isCurrent) setSuggestions(response.data.slice(0, 6));
      } catch {
        if (isCurrent) setSuggestions([]);
      }
    }, 400);

    return () => { isCurrent = false; clearTimeout(timeoutId); };
  }, [query]);

  useEffect(() => {
    const closeSuggestions = (event) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(event.target)) setSuggestionsOpen(false);
    };
    const handleEscape = (event) => { if (event.key === "Escape") setSuggestionsOpen(false); };
    document.addEventListener("mousedown", closeSuggestions);
    document.addEventListener("keydown", handleEscape);
    return () => { document.removeEventListener("mousedown", closeSuggestions); document.removeEventListener("keydown", handleEscape); };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const searchTerm = query.trim();
    if (!searchTerm) return;

    setIsLoading(true);
    setSuggestionsOpen(false);
    setError("");
    setHasSearched(true);
    try {
      const response = await api.get("/api/movies/search", { params: { query: searchTerm } });
      setMovies(response.data);
    } catch (requestError) {
      setMovies([]);
      setError(requestError.response?.data?.detail || "Unable to search movies right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const chooseSuggestion = (movieId) => {
    setSuggestionsOpen(false);
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="page-shell">
      <p className="section-kicker">Explore the catalogue</p>
      <h1 className="page-title">Search for a film</h1>
      <form className="mt-8 flex max-w-3xl gap-3" onSubmit={handleSearch}>
        <div ref={searchAreaRef} className="relative flex-1">
          <label className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 focus-within:border-amber">
            <SearchIcon size={19} className="text-zinc-500" />
            <input className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-600" placeholder="Search by movie title" value={query} onFocus={() => { if (query.trim()) setSuggestionsOpen(true); }} onChange={(event) => { setQuery(event.target.value); setSuggestionsOpen(Boolean(event.target.value.trim())); }} />
          </label>
          {suggestionsOpen && suggestions.length > 0 && <div className="absolute inset-x-0 z-20 mt-2 overflow-hidden rounded-xl border border-line bg-[#171720] py-1 shadow-2xl">{suggestions.map((movie) => <button key={movie.id} type="button" onClick={() => chooseSuggestion(movie.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-panel"><div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-zinc-900">{movie.poster_path && <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" className="h-full w-full object-cover" />}</div><span className="min-w-0"><span className="block truncate text-sm font-medium text-zinc-100">{movie.title}</span><span className="mt-0.5 block text-xs text-zinc-500">{movie.release_date?.slice(0, 4) || "Year unavailable"}</span></span></button>)}</div>}
        </div>
        <button className="primary-button" type="submit" disabled={isLoading}>{isLoading ? "Searching…" : "Search"}</button>
      </form>

      {error && <p className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
      {isLoading && <p className="mt-10 text-sm text-zinc-400">Searching the catalogue…</p>}
      {hasSearched && !isLoading && !error && movies.length === 0 && <p className="mt-10 text-sm text-zinc-500">No results found.</p>}
      {movies.length > 0 && !isLoading && <section className="mt-10"><p className="mb-5 text-sm text-zinc-500">{movies.length} films found</p><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div></section>}
    </div>
  );
}

export default Search;
