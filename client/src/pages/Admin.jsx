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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!user.is_admin) {
      navigate("/", { replace: true });
      return;
    }

    Promise.all([api.get("/api/admin/stats"), api.get("/api/admin/users")])
      .then(([statsResponse, usersResponse]) => {
        setStats(statsResponse.data);
        setUsers(usersResponse.data);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 403) {
          navigate("/", { replace: true });
          return;
        }
        setError(requestError.response?.data?.detail || "Unable to load the admin overview.");
      });
  }, [user, navigate]);

  if (!user?.is_admin) return null;

  const statCards = stats ? [
    ["Registered users", stats.total_users],
    ["Ratings submitted", stats.total_ratings],
    ["Watchlist entries", stats.total_watchlist_entries],
  ] : [];

  return (
    <div className="page-shell">
      <p className="section-kicker">Private overview</p>
      <h1 className="page-title">Administration</h1>
      {error && <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
      {!error && !stats && <p className="mt-8 text-sm text-zinc-400">Loading overview…</p>}
      {stats && <><div className="mt-8 grid gap-4 sm:grid-cols-3">{statCards.map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-panel p-5"><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p><p className="mt-3 font-display text-3xl font-medium tracking-tight text-zinc-100">{value}</p></div>)}</div><section className="mt-10 overflow-hidden rounded-xl border border-line bg-panel"><div className="border-b border-line px-5 py-4 sm:px-6"><h2 className="font-display text-lg font-medium text-zinc-100">Registered users</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-line text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500"><tr><th className="px-5 py-3 sm:px-6">Email</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3 sm:px-6">Top genre</th></tr></thead><tbody>{users.map((account) => <tr key={account.id} className="border-b border-line last:border-0"><td className="px-5 py-4 text-zinc-200 sm:px-6">{account.email}</td><td className="px-5 py-4 text-zinc-400">{account.created_at ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(account.created_at)) : "Unavailable"}</td><td className="px-5 py-4 text-zinc-400 sm:px-6">{account.top_genre || "No activity yet"}</td></tr>)}</tbody></table></div>{users.length === 0 && <p className="px-5 py-6 text-sm text-zinc-400 sm:px-6">No registered users yet.</p>}</section></>}
    </div>
  );
}

export default Admin;
