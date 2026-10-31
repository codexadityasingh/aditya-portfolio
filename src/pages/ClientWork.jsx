
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: "001",
    name: "BONE JAM",
    category: "WEB DEVELOPMENT",
    type: "CREATIVE COLLABORATION",
    description:
      "A collaborative website project for a Minecraft-inspired creative platform.",
    image: "/images/bonejam/home.png",
    imageAlt: "Bone Jam website cover",
    route: "/client-work/bone-jam",
    status: "LIVE",
  },
];

export default function ClientWork() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.from(".archive-reveal", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: page,
          start: "top 80%",
        },
      });

      gsap.from(".archive-project-card", {
        y: 45,
        opacity: 0,
        duration: 0.9,
        stagger: 0.16,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".archive-project-grid",
          start: "top 88%",
        },
      });

      page.querySelectorAll(".archive-project-card").forEach((card) => {
        const handleMove = (event) => {
          if (window.matchMedia("(pointer: coarse)").matches) return;

          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 4,
            rotateX: -y * 4,
            y: -7,
            duration: 0.35,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
          });
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        card._cleanup = () => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        };
      });
    }, page);

    return () => {
      page.querySelectorAll(".archive-project-card").forEach((card) => {
        card._cleanup?.();
        delete card._cleanup;
      });

      context.revert();
    };
  }, []);

  return (
    <main className="inner-page client-work-page archive-page" ref={pageRef}>
      {/* HERO */}
      <section className="page-hero client-work-hero archive-hero">
        <div className="archive-hero-orbit archive-orbit-one" />
        <div className="archive-hero-orbit archive-orbit-two" />

        <p className="eyebrow archive-reveal">
          03 / SELECTED COLLABORATIONS
        </p>

        <h1 className="page-title archive-reveal">
          WORK
          <br />
          <em>TOGETHER.</em>
        </h1>

        <p className="page-lead archive-reveal">
          A collection of ideas, collaborations and digital
          experiences brought to life through creative development.
        </p>

        <div className="client-hero-meta archive-reveal">
          <span>SELECTED CLIENT PROJECTS</span>
          <span>INDEPENDENT CREATIVE DEVELOPMENT</span>
        </div>
      </section>

      {/* PROJECT ARCHIVE */}
      <section className="section archive-section">
        <div className="section-top archive-reveal">
          <span>01 / THE ARCHIVE</span>
          <span>SELECTED WORKS</span>
        </div>

        <div className="archive-heading archive-reveal">
          <div>
            <p className="eyebrow">COLLABORATIONS</p>
            <h2 className="display-heading">
              MADE
              <br />
              <em>TOGETHER.</em>
            </h2>
          </div>

          <p>
            Every project has its own story. Explore the work,
            the details and the ideas behind each collaboration.
          </p>
        </div>

        <div className="archive-project-grid">
          {projects.map((project) => (
            <Link
              to={project.route}
              className="archive-project-card"
              key={project.number}
            >
              <div className="archive-card-book">
                <div className="archive-book-page archive-book-page-back" />
                <div className="archive-book-page archive-book-page-middle" />

                <div className="archive-card-visual">
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                  />

                  <div className="archive-card-overlay" />

                  <span className="archive-card-number">
                    PROJECT / {project.number}
                  </span>

                  <span className="archive-card-status">
                    <i />
                    {project.status}
                  </span>

                  <div className="archive-card-brand">
                    <span>FEATURED COLLABORATION</span>
                    <h3>{project.name}</h3>
                  </div>

                  <span className="archive-card-open">↗</span>
                </div>
              </div>

              <div className="archive-card-details">
                <div className="archive-card-title">
                  <span>{project.category}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>

                <div className="archive-card-meta">
                  <span>{project.type}</span>
                  <span>EXPLORE ↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="archive-counter archive-reveal">
          <span>SELECTED CLIENT PROJECTS</span>
          <span>
            {String(projects.length).padStart(2, "0")} / 01
          </span>
        </div>
      </section>

      {/* CLOSING */}
      <section className="section archive-ending">
        <div className="section-top archive-reveal">
          <span>02 / THE NEXT COLLABORATION</span>
          <span>OPEN TO IDEAS</span>
        </div>

        <div className="archive-ending-content archive-reveal">
          <p className="eyebrow">HAVE SOMETHING IN MIND?</p>

          <h2 className="display-heading">
            LET'S MAKE
            <br />
            <em>IT REAL.</em>
          </h2>

          <LiquidLink to="/contact" variant="glass">
            START A CONVERSATION ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}
