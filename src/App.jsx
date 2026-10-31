
import { useCallback, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import PageTransition from "./components/PageTransition";
import FeatherTransition from "./components/FeatherTransition";

import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";

// Client Work pages
import ClientWork from "./pages/ClientWork";
import BoneJam from "./pages/Bonejam";

import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import ReviewSubmit from "./pages/ReviewSubmit";
import AdminReviews from "./pages/AdminReviews";

import "./App.css";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const finishLoading = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (location.hash) {
      const sectionId = decodeURIComponent(location.hash.slice(1));

      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, loading]);

  const handleTalkClick = () => {
    if (location.pathname === "/") {
      document.getElementById("contact-cta")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      navigate("/#contact-cta");
    }
  };

  return (
    <>
      {loading && <Loader onComplete={finishLoading} />}

      <Navbar onTalk={handleTalkClick} />

      <PageTransition>
        <Routes>
          {/* Main pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />

          {/* Client Work */}
          <Route path="/client-work" element={<ClientWork />} />
          <Route
            path="/client-work/bone-jam"
            element={<BoneJam />}
          />

          {/* Other pages */}
          <Route path="/explore" element={<Explore />} />
          <Route path="/contact" element={<Contact />} />

          {/* Review submission */}
          <Route path="/review" element={<ReviewSubmit />} />
          <Route
            path="/review/:projectSlug"
            element={<ReviewSubmit />}
          />

          {/* Admin dashboard */}
          <Route path="/admin/reviews" element={<AdminReviews />} />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </PageTransition>

      <Footer />
      <FeatherTransition />
    </>
  );
}
