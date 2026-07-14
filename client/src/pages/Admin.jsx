import { Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!user.is_admin) { navigate("/", { replace: true }); return; }
    Promise.all([api.get("/api/admin/stats"), api.get("/api/admin/users")])
      .then(([statsResponse, usersResponse]) => { setStats(statsResponse.data); setUsers(usersResponse.data); })
      .catch((requestError) => {
        if (requestError.response?.status === 403) { navigate("/", { replace: true }); return; }
        setError(requestError.response?.data?.detail || "Unable to load the admin overview.");
      });
  }, [user, navigate]);

  const deleteUser = async () => {
    if (!pendingDeletion) return;
    setIsDeleting(true); setError("");
    try {
      await api.delete(`/api/admin/users/${pendingDeletion.id}`);
      setUsers((accounts) => accounts.filter((account) => account.id !== pendingDeletion.id));
      setStats((current) => current ? { ...current, total_users: current.total_users - 1 } : current);
      setPendingDeletion(null);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete this user.");
      setPendingDeletion(null);
    } finally { setIsDeleting(false); }
  };

  if (!user?.is_admin) return null;
  const statCards = stats ? [["Registered users", stats.total_users], ["Ratings submitted", stats.total_ratings], ["Watchlist entries", stats.total_watchlist_entries]] : [];

  return <div className="page-shell"><p className="section-kicker">Private overview</p><h1 className="page-title">Administration</h1>{error && <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}{!error && !stats && <p className="mt-8 text-sm text-zinc-400">Loading overview…</p>}{stats && <><div className="mt-8 grid gap-4 sm:grid-cols-3">{statCards.map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-panel p-5"><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p><p className="mt-3 font-display text-3xl font-medium tracking-tight text-zinc-100">{value}</p></div>)}</div><section className="mt-10 overflow-hidden rounded-xl border border-line bg-panel"><div className="border-b border-line px-5 py-4 sm:px-6"><h2 className="font-display text-lg font-medium text-zinc-100">Registered users</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-line text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500"><tr><th className="px-5 py-3 sm:px-6">Email</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Top genre</th><th className="px-5 py-3 text-right sm:px-6">Actions</th></tr></thead><tbody>{users.map((account) => <tr key={account.id} className="border-b border-line last:border-0"><td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-ink text-zinc-500">{account.profile_picture_url ? <img src={account.profile_picture_url} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} />}</div><span className="text-zinc-200">{account.email}</span></div></td><td className="px-5 py-4 text-zinc-400">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(account.created_at))}</td><td className="px-5 py-4 text-zinc-400">{account.top_genre || "No activity yet"}</td><td className="px-5 py-4 text-right sm:px-6">{account.id !== user.id && <button onClick={() => setPendingDeletion(account)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300 transition hover:text-red-200"><Trash2 size={14} /> Delete</button>}</td></tr>)}</tbody></table></div>{users.length === 0 && <p className="px-5 py-6 text-sm text-zinc-400 sm:px-6">No registered users yet.</p>}</section></>}{pendingDeletion && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5" role="dialog" aria-modal="true" aria-labelledby="delete-user-title"><div className="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-2xl"><h2 id="delete-user-title" className="font-display text-xl font-semibold text-zinc-100">Delete this user?</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Delete {pendingDeletion.email}? This cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setPendingDeletion(null)} disabled={isDeleting} className="ghost-button">Cancel</button><button onClick={deleteUser} disabled={isDeleting} className="primary-button bg-red-500 text-white hover:bg-red-400">{isDeleting ? "Deleting…" : "Delete"}</button></div></div></div>}</div>;
}

export default Admin;
