function GenreFilter({ genres = [], selected = [], onChange }) {
  const toggleGenre = (id) => onChange?.(selected.includes(id) ? selected.filter((genreId) => genreId !== id) : [...selected, id]);
  return <div className="flex flex-wrap gap-2">{genres.map((genre) => <button key={genre.id} type="button" onClick={() => toggleGenre(genre.id)} className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${selected.includes(genre.id) ? "border-amber bg-amber text-zinc-950" : "border-line text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"}`}>{genre.name}</button>)}</div>;
}

export default GenreFilter;
