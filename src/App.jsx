
import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

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
import ClientWork from "./pages/ClientWork";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";

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
      window.scrollTo({ top: 0, behavior: "auto" });
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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/client-work" element={<ClientWork />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </PageTransition>

      <Footer />
      <FeatherTransition />
    </>
  );
}
