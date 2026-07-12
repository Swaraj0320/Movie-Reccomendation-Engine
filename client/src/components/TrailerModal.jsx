import { X } from "lucide-react";

function TrailerModal({ videoKey, onClose }) {
  if (!videoKey) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true"><div className="w-full max-w-4xl"><button onClick={onClose} className="mb-3 ml-auto flex items-center gap-2 text-sm text-zinc-300 hover:text-amber"><X size={18} /> Close</button><div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${videoKey}`} title="Movie trailer" allowFullScreen /></div></div></div>;
}

export default TrailerModal;
