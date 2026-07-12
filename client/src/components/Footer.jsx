import { Clapperboard, Globe2, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return <footer className="mt-12 border-t border-line bg-[#0d0d13]"><div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-12"><div><Link to="/" className="flex items-center gap-2 font-display font-bold text-zinc-100"><Clapperboard size={20} className="text-amber" /> NFAK Recommendation Engine</Link><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">Discover films that match your taste, from the stories trending close to home to favourites from around the world.</p><div className="mt-4 flex gap-3"><a href="#community" aria-label="Community" className="text-zinc-500 hover:text-amber"><Globe2 size={18} /></a><a href="#messages" aria-label="Messages" className="text-zinc-500 hover:text-amber"><MessageCircle size={18} /></a><a href="#share" aria-label="Share" className="text-zinc-500 hover:text-amber"><Share2 size={18} /></a></div></div><div><h2 className="font-display text-sm font-bold text-zinc-200">Explore</h2><div className="mt-3 grid gap-2 text-sm text-zinc-500"><Link to="/about" className="hover:text-amber">About Us</Link><Link to="/contact" className="hover:text-amber">Contact Us</Link></div></div><div><h2 className="font-display text-sm font-bold text-zinc-200">Legal</h2><div className="mt-3 grid gap-2 text-sm text-zinc-500"><Link to="/terms" className="hover:text-amber">Terms &amp; Conditions</Link><Link to="/privacy" className="hover:text-amber">Privacy Policy</Link></div></div></div><div className="border-t border-line"><p className="mx-auto max-w-[1600px] px-5 py-5 text-xs text-zinc-600 sm:px-8 lg:px-12">© {year} NFAK Recommendation Engine. Educational project.</p></div></footer>;
}

export default Footer;
