import { Clapperboard, LogOut, Menu, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-amber" : "text-zinc-400 hover:text-zinc-100"}`;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2 text-zinc-50">
          <Clapperboard size={22} className="text-amber" strokeWidth={1.8} />
          <span className="font-display text-sm font-bold tracking-tight sm:text-base">NFAK Recommendation Engine</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>Discover</NavLink>
          <NavLink to="/search" className={navLinkClass}>Search</NavLink>
          <NavLink to="/recommendations" className={navLinkClass}>For You</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/search" aria-label="Search movies" className="rounded-lg p-2 text-zinc-300 transition-colors hover:bg-panel hover:text-amber"><Search size={19} /></Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen((isOpen) => !isOpen)} aria-label="Open profile menu" aria-expanded={profileOpen} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-amber font-display text-sm font-bold text-zinc-950 ring-2 ring-transparent transition hover:ring-amber-soft">
                {user.profile_picture_url ? <img src={user.profile_picture_url} alt="" className="h-full w-full object-cover" /> : user.name?.charAt(0).toUpperCase() || <UserRound size={18} />}
              </button>
              {profileOpen && <div className="absolute right-0 mt-3 w-64 rounded-xl border border-line bg-[#171720] p-2 shadow-2xl">
                <div className="border-b border-line px-3 py-2.5"><p className="truncate text-sm font-semibold text-zinc-100">{user.name}</p><p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p></div>
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-panel hover:text-amber">Profile</Link>
                <Link to="/watchlist" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-panel hover:text-amber">Watchlist</Link>
                <Link to="/my-ratings" onClick={() => setProfileOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-panel hover:text-amber">My ratings</Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-300 hover:bg-panel hover:text-amber"><LogOut size={16} /> Logout</button>
              </div>}
            </div>
          ) : (
            <Link to="/login" className="hidden text-sm font-semibold text-amber hover:text-amber-soft sm:block">Sign in</Link>
          )}
          <Menu size={20} className="text-zinc-300 md:hidden" />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
