import { Clapperboard, LogOut, Menu, Moon, Search, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navLinkClass = ({ isActive }) =>
  `relative py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:transition-transform ${isActive ? "text-amber after:scale-x-100 after:bg-amber" : "text-zinc-500 hover:text-zinc-100 after:scale-x-0 after:bg-zinc-400 hover:after:scale-x-100"}`;

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className="site-navbar sticky top-0 z-50 border-b border-white/[0.08] bg-black/70 backdrop-blur-md">
      <nav className="relative mx-auto grid h-14 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-zinc-50">
          <Clapperboard size={18} className="shrink-0 text-amber" strokeWidth={1.7} />
          <span className="truncate font-display text-[14px] font-medium tracking-[-0.02em] sm:text-[15px]"><span className="sm:hidden">Novexa</span><span className="hidden sm:inline">Novexa - Smart Movie Recommendation Engine</span></span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>Discover</NavLink>
          <NavLink to="/search" className={navLinkClass}>Search</NavLink>
          <NavLink to="/recommendations" className={navLinkClass}>For You</NavLink>
          <NavLink to="/history" className={navLinkClass}>History</NavLink>
        </div>
        <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
          <Link to="/search" aria-label="Search movies" className="rounded-md p-2 text-zinc-400 transition-colors hover:text-amber"><Search size={17} /></Link>
          <button type="button" role="switch" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-checked={theme === "light"} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className={`theme-switch relative h-7 w-14 rounded-full border border-line p-0.5 transition-colors duration-300 ${theme === "light" ? "bg-amber/20" : "bg-zinc-900"}`}><Moon size={12} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-zinc-400" /><Sun size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-amber" /><span className={`absolute top-0.5 grid h-5 w-5 place-items-center rounded-full bg-zinc-100 text-zinc-900 shadow-sm transition-transform duration-300 ease-out ${theme === "light" ? "translate-x-7" : "translate-x-0"}`}>{theme === "light" ? <Sun size={12} /> : <Moon size={12} />}</span></button>
          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen((isOpen) => !isOpen)} aria-label="Open profile menu" aria-expanded={profileOpen} className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-amber/40 bg-[#27231b] font-display text-xs font-medium text-amber transition hover:border-amber">
                {user.profile_picture_url ? <img src={user.profile_picture_url} alt="" className="h-full w-full object-cover" /> : user.name?.charAt(0).toUpperCase() || <UserRound size={18} />}
              </button>
              {profileOpen && <div className="absolute right-0 mt-3 w-64 border border-white/10 bg-[#111217]/95 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="border-b border-white/10 px-3 py-3"><p className="truncate text-sm font-medium text-zinc-100">{user.name}</p><p className="mt-1 truncate text-xs text-zinc-500">{user.email}</p></div>
                <Link to="/profile" onClick={() => setProfileOpen(false)} className="mt-1 block px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber">Profile</Link>
                <Link to="/watchlist" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber">Watchlist</Link>
                <Link to="/my-ratings" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber">My ratings</Link>
                {user.is_admin === true && <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber">Dashboard</Link>}
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-amber"><LogOut size={14} /> Logout</button>
              </div>}
            </div>
          ) : (
            <Link to="/login" className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-amber transition hover:text-amber-soft sm:block">Sign in</Link>
          )}
          <button onClick={() => setMobileOpen((isOpen) => !isOpen)} aria-label="Toggle navigation menu" aria-expanded={mobileOpen} className="rounded-md p-2 text-zinc-400 transition hover:text-amber md:hidden">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        {mobileOpen && <div className="absolute inset-x-5 top-[3.5rem] border border-white/10 bg-[#111217]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:inset-x-8 md:hidden"><NavLink to="/" end onClick={closeMobileMenu} className={({ isActive }) => `block px-3 py-3 text-xs uppercase tracking-[0.16em] ${isActive ? "text-amber" : "text-zinc-400"}`}>Discover</NavLink><NavLink to="/search" onClick={closeMobileMenu} className={({ isActive }) => `block px-3 py-3 text-xs uppercase tracking-[0.16em] ${isActive ? "text-amber" : "text-zinc-400"}`}>Search</NavLink><NavLink to="/recommendations" onClick={closeMobileMenu} className={({ isActive }) => `block px-3 py-3 text-xs uppercase tracking-[0.16em] ${isActive ? "text-amber" : "text-zinc-400"}`}>For You</NavLink><NavLink to="/history" onClick={closeMobileMenu} className={({ isActive }) => `block px-3 py-3 text-xs uppercase tracking-[0.16em] ${isActive ? "text-amber" : "text-zinc-400"}`}>History</NavLink></div>}
      </nav>
    </header>
  );
}

export default Navbar;
