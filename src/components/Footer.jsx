
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const backToTop = () => {
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="global-footer">
      <Link to="/" className="footer-brand" aria-label="ADI home">
        ADI<span>.</span>
      </Link>

      <span className="footer-message">
        DESIGNED & BUILT WITH CURIOSITY.
      </span>

      <nav className="footer-links" aria-label="Footer navigation">
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GITHUB ↗
        </a>

        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
          LINKEDIN ↗
        </a>

        <Link to="/contact">GET IN TOUCH ↗</Link>

        <button type="button" onClick={backToTop}>
          BACK TO TOP ↑
        </button>
      </nav>

      <span className="footer-copyright">
        © {new Date().getFullYear()} ADI
      </span>
    </footer>
  );
}
