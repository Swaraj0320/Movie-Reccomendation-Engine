import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/onboarding");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center">
      <div className="w-full max-w-md">
      <section className="w-full max-w-md rounded-xl border border-line bg-panel p-7 sm:p-9">
        <p className="section-kicker">Start your archive</p>
        <h1 className="page-title">Create an account</h1>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-amber" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required />
          <input className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-amber" placeholder="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-amber" placeholder="Password: 8+ chars, upper, lower & number" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
          {error && <p className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="mt-6 text-sm text-zinc-400">Already have an account? <Link className="font-semibold text-amber hover:text-amber-soft" to="/login">Sign in</Link></p>
      </section>
      <p className="mt-4 text-center text-xs font-normal text-zinc-400">Made by SalazarMotionlab</p>
      </div>
    </div>
  );
}

export default Signup;
