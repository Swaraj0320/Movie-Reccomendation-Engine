import { Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Footer from "./components/Footer";
import CursorGlow from "./components/CursorGlow";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import History from "./pages/History";
import Login from "./pages/Login";
import MovieDetails from "./pages/MovieDetails";
import MyRatings from "./pages/MyRatings";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import Recommendations from "./pages/Recommendations";
import Search from "./pages/Search";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import Watchlist from "./pages/Watchlist";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <div className="relative isolate min-h-screen bg-ink text-zinc-100">
      <CursorGlow />
      <div className="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movies/:movieId" element={<MovieDetails />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-ratings" element={<MyRatings />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
