import { Clapperboard, Share2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();
  const [toastMessage, setToastMessage] = useState("");

  const handleShareClick = async () => {
    try {
      const url = window.location.origin;
      await navigator.clipboard.writeText(url);
      setToastMessage("URL copied!");
      // Auto-dismiss toast after 2.5 seconds
      setTimeout(() => setToastMessage(""), 2500);
    } catch (error) {
      setToastMessage("Couldn't copy — please copy the URL manually");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <footer className="site-footer mt-16 border-t border-white/[0.08] bg-[#0b0b10]">
      <div className="mx-auto grid max-w-[1600px] gap-9 px-5 py-9 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-12">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-medium text-zinc-100">
            <Clapperboard size={17} className="text-amber" /> Novexa - Smart Movie Recommendation Engine
          </Link>
          <p className="mt-3 max-w-sm text-[13px] leading-5 text-zinc-300">
            Discover films that match your taste, from the stories trending close to home to favourites from around the world.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleShareClick}
              aria-label="Share site URL"
              className="text-zinc-300 transition hover:text-amber"
              type="button"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-100">Explore</h2>
          <div className="mt-3 grid gap-2 text-[13px] text-zinc-300">
            <Link to="/about" className="transition hover:text-amber">
              About Us
            </Link>
            {/* Contact Us — temporarily hidden, uncomment to re-enable */}
            {/* <Link to="/contact" className="transition hover:text-amber">Contact Us</Link> */}
          </div>
        </div>
        <div>
          <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-100">Legal</h2>
          <div className="mt-3 grid gap-2 text-[13px] text-zinc-300">
            <Link to="/terms" className="transition hover:text-amber">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className="transition hover:text-amber">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <p className="mx-auto max-w-[1600px] px-5 py-4 text-[11px] tracking-wide text-zinc-300 sm:px-8 lg:px-12">
          © {year} Novexa - Smart Movie Recommendation Engine. Educational project.
        </p>
      </div>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-200">
          <div className="px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
