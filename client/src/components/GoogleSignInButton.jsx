import { GoogleLogin } from "@react-oauth/google";

function GoogleMark() {
  return <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.2 13.7a6 6 0 0 1 0-3.5V7.6H2.9a10 10 0 0 0 0 8.8l3.3-2.7Z" /><path fill="#EA4335" d="M12 6c1.5 0 2.9.5 3.9 1.5l2.9-2.9A10 10 0 0 0 2.9 7.6l3.3 2.6C7 7.8 9.3 6 12 6Z" /></svg>;
}

function GoogleSignInButton({ disabled = false, onCredential, onError }) {
  return (
    <div className={`group relative h-11 w-[360px] max-w-full ${disabled ? "pointer-events-none opacity-60" : ""}`}>
      <div aria-hidden="true" className="flex h-full w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition duration-200 group-hover:border-zinc-400 group-hover:bg-zinc-50 group-hover:shadow-md dark:border-zinc-600 dark:bg-zinc-50 dark:text-zinc-900 dark:group-hover:border-zinc-400 dark:group-hover:bg-white">
        <GoogleMark />
        Continue with Google
      </div>
      <div className="absolute inset-0 overflow-hidden opacity-0">
        <GoogleLogin
        onSuccess={(response) => response.credential ? onCredential(response.credential) : onError("Unable to complete Google sign-in. Please try again.")}
        onError={() => onError("Google sign-in was cancelled or could not be opened. Please try again.")}
        theme="outline"
        shape="rectangular"
        text="continue_with"
        width="360"
        />
      </div>
    </div>
  );
}

export default GoogleSignInButton;
