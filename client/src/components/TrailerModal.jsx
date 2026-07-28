import { X } from "lucide-react";
import { useEffect } from "react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function TrailerModal({ videoKey, movie, onClose }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!videoKey || !movie || !user) return;

    api.post("/api/history/", {
      movie_id: movie.id,
      movie_title: movie.title,
      poster_path: movie.poster_path,
    }).catch(() => {
      // History logging should never prevent a trailer from opening.
    });
  }, [videoKey, movie, user]);

  if (!videoKey) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true"><div className="w-full max-w-4xl"><button onClick={onClose} className="trailer-close-button mb-3 ml-auto flex items-center gap-2 text-sm text-zinc-300 hover:text-amber"><X size={18} /> Close</button><div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${videoKey}`} title="Movie trailer" allowFullScreen /></div></div></div>;
}

export default TrailerModal;
