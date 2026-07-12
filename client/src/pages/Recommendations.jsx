import { useEffect, useState } from "react";

import api from "../api/axios";
import GenreFilter from "../components/GenreFilter";
import MovieCard from "../components/MovieCard";

const languages = [
  { code: "", name: "Any language" },
  { code: "hi", name: "Hindi" },
  { code: "en", name: "English" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ko", name: "Korean" },
  { code: "ja", name: "Japanese" },
  { code: "es", name: "Spanish" },
];

const years = Array.from({ length: 2026 - 1950 + 1 }, (_, index) => 2026 - index);

function Recommendations() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [language, setLanguage] = useState("");
  const [year, setYear] = useState("");
  const [movies, setMovies] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await api.get("/api/movies/genres");
        setGenres(response.data);
      } catch {
        setError("Unable to load genre filters right now.");
      }
    };
    loadGenres();
  }, []);

  const findFilms = async () => {
    const params = {};
    if (selectedGenres.length) params.genres = selectedGenres.join(",");
    if (language) params.language = language;
    if (year) params.year = year;

    setIsLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await api.get("/api/recommend", { params });
      setMovies(response.data);
    } catch (requestError) {
      setMovies([]);
      setError(requestError.response?.data?.detail || "Unable to find recommendations right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <p className="section-kicker">Tune the reel</p>
      <h1 className="page-title">Recommendations, on your terms.</h1>
      <p className="mt-4 max-w-2xl leading-7 text-zinc-400">Choose the kinds of stories and languages you want to see. The results are sorted by popularity, so trending matches appear first.</p>
      <section className="mt-9 rounded-xl border border-line bg-panel p-5 sm:p-7">
        <p className="mb-4 text-sm font-semibold text-zinc-200">Genres</p>
        <GenreFilter genres={genres} selected={selectedGenres} onChange={setSelectedGenres} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <select className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-zinc-300 outline-none focus:border-amber" value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.code || "all"} value={item.code}>{item.name}</option>)}</select>
          <select className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-zinc-300 outline-none focus:border-amber" value={year} onChange={(event) => setYear(event.target.value)}><option value="">Any release year</option>{years.map((releaseYear) => <option key={releaseYear} value={releaseYear}>{releaseYear}</option>)}</select>
          <button className="primary-button" type="button" onClick={findFilms} disabled={isLoading}>{isLoading ? "Finding films…" : "Find films"}</button>
        </div>
      </section>

      {error && <p className="mt-8 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
      {isLoading && <p className="mt-10 text-sm text-zinc-400">Finding films that fit your taste…</p>}
      {hasSearched && !isLoading && !error && movies.length === 0 && <p className="mt-10 text-sm text-zinc-500">No matches found, try different filters.</p>}
      {movies.length > 0 && !isLoading && <section className="mt-10"><p className="mb-5 text-sm text-zinc-500">{movies.length} matching films</p><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div></section>}
    </div>
  );
}

export default Recommendations;
