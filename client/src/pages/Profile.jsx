import { ImagePlus, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

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

  const selectProfilePicture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setError("Please choose an image smaller than 2MB.");
      event.target.value = "";
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profile_picture_url: reader.result }));
    reader.onerror = () => setError("Unable to read that image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); setIsSaving(true); setError(""); setMessage("");
    try { const response = await api.patch("/api/user/profile", form); updateUser(response.data); setMessage("Profile saved."); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Unable to save your profile."); }
    finally { setIsSaving(false); }
  };

  return <div className="page-shell"><div className="max-w-xl"><p className="section-kicker">Account</p><h1 className="page-title">Your profile</h1><form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-line bg-panel p-5 sm:p-7"><div><p className="text-sm font-medium text-zinc-300">Profile picture</p><div className="mt-3 flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-ink text-zinc-500">{form.profile_picture_url ? <img src={form.profile_picture_url} alt="Profile preview" className="h-full w-full object-cover" /> : <UserRound size={26} />}</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-panel"><ImagePlus size={16} /> Choose image<input type="file" accept="image/*" onChange={selectProfilePicture} className="sr-only" /></label></div><p className="mt-2 text-xs text-zinc-500">PNG, JPG, or other image files up to 2MB.</p></div><label className="block text-sm font-medium text-zinc-300">Email<input value={user?.email || ""} disabled className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 text-zinc-500" /></label><label className="block text-sm font-medium text-zinc-300">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" /></label><label className="block text-sm font-medium text-zinc-300">Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none focus:border-amber" placeholder="Optional" /></label>{error && <p className="text-sm text-red-300">{error}</p>}{message && <p className="text-sm text-emerald-300">{message}</p>}<button disabled={isSaving} className="primary-button" type="submit">{isSaving ? "Saving…" : "Save profile"}</button></form><p className="mt-5 text-right text-xs font-normal text-zinc-400">Made by SalazarMotionlab</p></div></div>;
}

export default Profile;
