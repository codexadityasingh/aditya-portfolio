
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

// PUBLIC ADMIN DEMO
import AdminDemo from "./admin/AdminDemo";

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
        {/* =====================================
            PUBLIC ADMIN DEMO
            Separate from the real admin system
        ====================================== */}
        <Route
          path="/admin-demo/*"
          element={<AdminDemo />}
        />

        {/* =====================================
            REAL ADMIN LOGIN
        ====================================== */}
        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        {/* =====================================
            REAL ADMIN WORKSPACE
        ====================================== */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="projects"
            element={<AdminProjects />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="client-work"
            element={<AdminClientWork />}
          />

          <Route
            path="about"
            element={<AdminAbout />}
          />

          <Route
            path="services"
            element={<AdminServices />}
          />

          <Route
            path="contact"
            element={<AdminContact />}
          />
        </Route>

        {/* =====================================
            PUBLIC WEBSITE
        ====================================== */}
        <Route
          element={
            <PublicLayout onTalk={handleTalkClick} />
          }
        >
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:slug"
            element={<PersonalProjectDetail />}
          />

          {/* CLIENT WORK */}
          <Route
            path="/client-work"
            element={<ClientWork />}
          />

          <Route
            path="/client-work/bone-jam"
            element={<BoneJam />}
          />

          <Route
            path="/client-work/:slug"
            element={<ClientWorkDetail />}
          />

          {/* OTHER PAGES */}
          <Route
            path="/explore"
            element={<Explore />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

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
