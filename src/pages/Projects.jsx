
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: "01",
    title: "LEVEL UP",
    category: "FITNESS / APP CONCEPT",
    description:
      "An exploration of fitness, progression and gamification — turning everyday training into a more engaging experience.",
    technologies: ["APP CONCEPT", "UI / UX", "GAMIFICATION"],
    className: "project-levelup",
    symbol: "↗",
    status: "CONCEPT",
  },
  {
    number: "02",
    title: "GYM MANAGER",
    category: "WEB APPLICATION",
    description:
      "A web application concept designed to simplify gym memberships, records and everyday management.",
    technologies: ["WEB DEVELOPMENT", "DATABASE", "UI DESIGN"],
    className: "project-gym",
    symbol: "◈",
    status: "BUILD",
  },
  {
    number: "03",
    title: "CREATIVE LAB",
    category: "VISUAL EXPERIMENTS",
    description:
      "An ongoing collection of visual experiments exploring motion, interaction, typography and digital aesthetics.",
    technologies: ["GSAP", "CSS", "CREATIVE CODING"],
    className: "project-lab",
    symbol: "✳",
    status: "EXPLORING",
  },
];

export default function Projects() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 45,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 87%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const cards = gsap.utils.toArray(".project-card");

      cards.forEach((card) => {
        const handleMove = (event) => {
          if (window.matchMedia("(pointer: coarse)").matches) return;

          const rect = card.getBoundingClientRect();

          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 7,
            y: -10,
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
            duration: 0.65,
            ease: "elastic.out(1, 0.6)",
          });
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        card._cleanup = () => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        };
      });
    });

    return () => {
      document
        .querySelectorAll(".project-card")
        .forEach((card) => card._cleanup?.());

      context.revert();
    };
  }, []);

  return (
    <main className="inner-page projects-page">

      {/* INTRO */}
      <section className="page-hero">
        <p className="eyebrow reveal">02 / SELECTED WORK</p>

        <h1 className="page-title reveal">
          MADE WITH
          <br />
          <em>INTENTION.</em>
        </h1>

        <p className="page-lead reveal">
          A collection of builds, concepts and experiments.
          Each one is part of the process of becoming a
          better developer and creative thinker.
        </p>
      </section>

      {/* PROJECT INDEX */}
      <section className="section projects-page-list">

        <div className="section-top reveal">
          <span>PROJECT INDEX / 001—003</span>
          <span>HOVER TO INTERACT</span>
        </div>

        <div className="project-page-grid">

          {projects.map((project) => (
            <article
              className={`project-card ${project.className}`}
              key={project.number}
            >

              <div className="project-art">
                <span className="project-number">
                  {project.number} / {project.category}
                </span>

                <div className="project-art-grid" />

                <div className="project-art-symbol">
                  {project.symbol}
                </div>

                <div className="project-art-title">
                  {project.title}
                </div>

                <span className="project-art-footer">
                  ADI / DIGITAL WORKS
                </span>

                <span className="project-status">
                  {project.status}
                </span>
              </div>

              <div className="project-information">

                <div className="project-meta">
                  <span className="project-type">
                    {project.category}
                  </span>

                  <span className="project-open">
                    {project.number} ↗
                  </span>
                </div>

                <h2>{project.title}</h2>

                <p className="project-description">
                  {project.description}
                </p>

                <div className="project-technologies">
                  {project.technologies.map((technology) => (
                    <span key={technology}>
                      {technology}
                    </span>
                  ))}
                </div>

              </div>
            </article>
          ))}

        </div>
      </section>

      {/* CLOSING SECTION */}
      <section className="section projects-ending">
        <div className="projects-ending-content reveal">
          <p className="eyebrow">
            MORE THINGS ARE TAKING SHAPE.
          </p>

          <h2 className="display-heading">
            THE NEXT
            <br />
            <em>IDEA IS LOADING.</em>
          </h2>

          <LiquidLink to="/contact" variant="solid">
            HAVE A PROJECT IN MIND? ↗
          </LiquidLink>
        </div>
      </section>

    </main>
  );
}

