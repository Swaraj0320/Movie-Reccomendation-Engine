import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

function Signup() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSignupForm = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check for empty fields
    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError("All fields are required.");
      return false;
    }

    // Names may contain alphabetic characters and single spaces only.
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmedName)) {
      setError("Name can only contain alphabets.");
      return false;
    }

    // Valid email format
    const [localPart = ""] = trimmedEmail.split("@");
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(trimmedEmail) || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..") || !/[a-zA-Z]/.test(localPart)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password cannot equal or contain email or name (case-insensitive)
    const lowerPassword = trimmedPassword.toLowerCase();
    const lowerEmail = trimmedEmail.toLowerCase();
    const lowerName = trimmedName.toLowerCase();

    if (lowerPassword === lowerEmail) {
      setError("Password cannot be the same as your email.");
      return false;
    }
    if (lowerPassword.includes(lowerEmail)) {
      setError("Password cannot contain your email address.");
      return false;
    }
    if (lowerPassword.includes(lowerName)) {
      setError("Password cannot contain your name.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!validateSignupForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim().toLowerCase(), password.trim());
      navigate("/onboarding");
    } catch (requestError) {
      const errorDetail = requestError.response?.data?.detail;
      // Map backend errors to friendly messages
      if (errorDetail?.includes("already registered") || errorDetail?.includes("Email already")) {
        setError("This email address is already registered. Please sign in instead.");
      } else {
        setError(errorDetail || "Unable to create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const session = await loginWithGoogle(credential);
      navigate(session.is_admin ? "/admin" : "/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to continue with Google. Please try again.");
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
          <div className="relative"><input className="w-full rounded-xl border border-line bg-ink px-4 py-3 pr-12 text-sm outline-none placeholder:text-zinc-600 focus:border-amber" placeholder="Password: 8+ chars, upper, lower & number" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 px-4 text-zinc-500 transition hover:text-amber">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          {error && <p className="rounded-xl border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"}</button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
        <GoogleSignInButton disabled={isSubmitting} onCredential={handleGoogleCredential} onError={setError} />
        <p className="mt-6 text-sm text-zinc-400">Already have an account? <Link className="font-semibold text-amber hover:text-amber-soft" to="/login">Sign in</Link></p>
      </section>
      <p className="mt-4 text-center text-xs font-normal text-zinc-400">Developed and Maintained by Siddhi & Swaraj</p>
      </div>
    </div>
  );
}

export default Signup;
