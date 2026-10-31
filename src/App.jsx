
import { useCallback, useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Outlet,
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
import PersonalProjectDetail from "./pages/PersonalProjectDetail";

// CLIENT WORK
import ClientWork from "./pages/ClientWork";
import BoneJam from "./pages/Bonejam";
import ClientWorkDetail from "./pages/ClientWorkDetail";

// OTHER PUBLIC PAGES
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import ReviewSubmit from "./pages/ReviewSubmit";

// ADMIN PAGES
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProjects from "./admin/AdminProjects";
import AdminReviews from "./admin/AdminReviews";
import AdminClientWork from "./admin/AdminClientWork";
import AdminAbout from "./admin/AdminAbout";
import AdminServices from "./admin/AdminServices";
import AdminContact from "./admin/AdminContact";

import "./App.css";

gsap.registerPlugin(ScrollTrigger);

// PUBLIC WEBSITE LAYOUT
function PublicLayout({ onTalk }) {
  return (
    <>
      <Navbar onTalk={onTalk} />

      <PageTransition>
        <Outlet />
      </PageTransition>

      <Footer />
      <FeatherTransition />
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const finishLoading = useCallback(() => {
    setLoading(false);
  }, []);

  // PAGE SCROLL HANDLING
  useEffect(() => {
    if (loading || isAdminRoute) return;

    if (location.hash) {
      const sectionId = decodeURIComponent(
        location.hash.slice(1)
      );

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
  }, [
    location.pathname,
    location.hash,
    loading,
    isAdminRoute,
  ]);

  // NAVBAR CONTACT BUTTON
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
      {/* PUBLIC WEBSITE LOADER ONLY */}
      {!isAdminRoute && loading && (
        <Loader onComplete={finishLoading} />
      )}

      <Routes>
        {/* ADMIN LOGIN */}
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        {/* ADMIN WORKSPACE */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          {/* DASHBOARD */}
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* PERSONAL PROJECTS */}
          <Route
            path="projects"
            element={<AdminProjects />}
          />

          {/* CLIENT REVIEWS */}
          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          {/* CLIENT WORK CMS */}
          <Route
            path="client-work"
            element={<AdminClientWork />}
          />

          {/* ABOUT EDITOR */}
          <Route
            path="about"
            element={<AdminAbout />}
          />

          {/* SERVICES AND PRICING EDITOR */}
          <Route
            path="services"
            element={<AdminServices />}
          />

          {/* CONTACT EDITOR */}
          <Route
            path="contact"
            element={<AdminContact />}
          />
        </Route>

        {/* PUBLIC WEBSITE */}
        <Route
          element={<PublicLayout onTalk={handleTalkClick} />}
        >
          {/* HOME */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* ABOUT */}
          <Route
            path="/about"
            element={<About />}
          />

          {/* PERSONAL PROJECTS */}
          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:slug"
            element={<PersonalProjectDetail />}
          />

          {/* CLIENT WORK ARCHIVE */}
          <Route
            path="/client-work"
            element={<ClientWork />}
          />

          {/* EXISTING BONE JAM CASE STUDY */}
          <Route
            path="/client-work/bone-jam"
            element={<BoneJam />}
          />

          {/* DYNAMIC CLIENT CASE STUDIES */}
          <Route
            path="/client-work/:slug"
            element={<ClientWorkDetail />}
          />

          {/* EXPLORE */}
          <Route
            path="/explore"
            element={<Explore />}
          />

          {/* CONTACT */}
          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* CLIENT REVIEW SUBMISSION */}
          <Route
            path="/review"
            element={<ReviewSubmit />}
          />

          <Route
            path="/review/:projectSlug"
            element={<ReviewSubmit />}
          />

          {/* FALLBACK */}
          <Route
            path="*"
            element={<Home />}
          />
        </Route>
      </Routes>
    </>
  );
}
