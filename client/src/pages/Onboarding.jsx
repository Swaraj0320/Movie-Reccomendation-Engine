import { useState } from "react";
import { useNavigate } from "react-router-dom";

import GenreFilter from "../components/GenreFilter";

const genres = [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" }, { id: 35, name: "Comedy" }, { id: 18, name: "Drama" }, { id: 27, name: "Horror" }];

function Onboarding() {
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState(() => {
    const saved = localStorage.getItem("userGenrePreferences");
    return saved ? JSON.parse(saved) : [];
  });

  const savePreferences = () => {
    // A future profile endpoint will persist these preferences in MongoDB.
    localStorage.setItem("userGenrePreferences", JSON.stringify(selectedGenres));
    navigate("/");
  };

  return (
    <div className="page-shell">
      <div className="max-w-3xl py-8">
        <p className="section-kicker">First frame</p>
        <h1 className="page-title">What kind of cinema stays with you?</h1>
        <p className="mt-4 leading-7 text-zinc-400">Pick a few genres. You can always change these preferences later.</p>
        <div className="mt-8"><GenreFilter genres={genres} selected={selectedGenres} onChange={setSelectedGenres} /></div>
        <button className="primary-button mt-9" type="button" onClick={savePreferences}>Save preferences</button>
      </div>
    </div>
  );
}

export default Onboarding;
