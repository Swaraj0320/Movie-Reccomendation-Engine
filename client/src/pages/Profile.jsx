import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", profile_picture_url: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({ name: user.name || "", phone: user.phone || "", profile_picture_url: user.profile_picture_url || "" });
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault(); setIsSaving(true); setError(""); setMessage("");
    try { const response = await api.patch("/api/user/profile", form); updateUser(response.data); setMessage("Profile saved."); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to save your profile."); }
    finally { setIsSaving(false); }
  };

  return <div className="page-shell"><div className="max-w-xl"><p className="section-kicker">Account</p><h1 className="page-title">Your profile</h1><form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-line bg-panel p-5 sm:p-7"><label className="block text-sm font-medium text-zinc-300">Email<input value={user?.email || ""} disabled className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-zinc-500" /></label><label className="block text-sm font-medium text-zinc-300">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" /></label><label className="block text-sm font-medium text-zinc-300">Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" placeholder="Optional" /></label><label className="block text-sm font-medium text-zinc-300">Profile picture URL<input type="url" value={form.profile_picture_url} onChange={(event) => setForm({ ...form, profile_picture_url: event.target.value })} className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" placeholder="https://example.com/photo.jpg" /></label>{error && <p className="text-sm text-red-300">{error}</p>}{message && <p className="text-sm text-emerald-300">{message}</p>}<button disabled={isSaving} className="primary-button" type="submit">{isSaving ? "Saving…" : "Save profile"}</button></form></div></div>;
}

export default Profile;
