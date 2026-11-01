
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navigation = [
  { name: "ABOUT", path: "/about", number: "01" },
  { name: "PROJECTS", path: "/projects", number: "02" },
  { name: "CLIENT WORK", path: "/client-work", number: "03" },
  { name: "EXPLORE", path: "/explore", number: "04" },
  { name: "CONTACT", path: "/contact", number: "05" },
];

export default function Navbar({ onTalk }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTalk = () => {
    setMenuOpen(false);

    if (onTalk) {
      onTalk();
      return;
    }

    if (location.pathname === "/") {
      document.getElementById("contact-cta")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      navigate("/#contact-cta");
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className={`site-nav ${menuOpen ? "menu-open" : ""}`}>
      <NavLink
        to="/"
        className="brand-mark"
        aria-label="NEXVSN home"
        onClick={() => setMenuOpen(false)}
      >
        {/* NEXVSN Logo */}
        <img
          src="/images/logo/nexvsn-mark.png"
          alt=""
          className="brand-logo"
        />

        <span className="brand-divider" aria-hidden="true" />

        NEXVSN<span>.</span>

        <small>PORTFOLIO / 2026</small>
      </NavLink>

      {/* Desktop navigation */}
      <nav className="nav-menu" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Desktop contact button */}
      <button
        type="button"
        className="nav-talk liquid-link liquid-link--glass"
        onClick={handleTalk}
        aria-label="Let's talk — go to contact section"
      >
        <span className="liquid-link-content">
          LET'S TALK <b aria-hidden="true">↗</b>
        </span>
      </button>

      {/* Mobile hamburger */}
      <button
        type="button"
        className={`mobile-menu-toggle ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile navigation panel */}
      <div
        id="mobile-navigation"
        className={`mobile-nav-panel ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-nav-inner">
          <div className="mobile-nav-heading">
            <span>MENU / NAVIGATION</span>
            <span>2026 — NEXVSN</span>
          </div>

          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  isActive
                    ? "mobile-nav-item active"
                    : "mobile-nav-item"
                }
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
              >
                <span className="mobile-nav-number">{item.number}</span>
                <span className="mobile-nav-name">{item.name}</span>
                <span className="mobile-nav-arrow" aria-hidden="true">
                  ↗
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="mobile-nav-bottom">
            <span>HAVE A PROJECT IN MIND?</span>

            <button type="button" onClick={handleTalk}>
              LET'S TALK <span aria-hidden="true">↗</span>
            </button>

            <span className="mobile-nav-copyright">
              © 2026 NEXVSN — CREATIVE STUDIO
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
