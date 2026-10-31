
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navigation = [
  { name: "ABOUT", path: "/about" },
  { name: "PROJECTS", path: "/projects" },
  { name: "CLIENT WORK", path: "/client-work" },
  { name: "EXPLORE", path: "/explore" },
  { name: "CONTACT", path: "/contact" },
];

export default function Navbar({ onTalk }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTalk = () => {
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

  return (
    <header className="site-nav">
      <NavLink to="/" className="brand-mark" aria-label="ADI Portfolio home">
        ADI<span>.</span>
        <small>PORTFOLIO / 2026</small>
      </NavLink>

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
    </header>
  );
}
