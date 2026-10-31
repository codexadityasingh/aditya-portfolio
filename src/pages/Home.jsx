
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const featuredProjects = [
  {
    number: "01",
    title: "LEVEL UP",
    category: "FITNESS / APP CONCEPT",
    description:
      "Exploring how fitness, progression and gamification can come together in one experience.",
    visual: "levelup-visual",
    symbol: "↑",
  },
  {
    number: "02",
    title: "WEB EXPERIENCES",
    category: "DEVELOPMENT / EXPERIMENTS",
    description:
      "A growing collection of web development experiments, interfaces and ideas.",
    visual: "web-visual",
    symbol: "◈",
  },
];

const clientWorks = [
  {
    number: "01",
    title: "BONE JAM",
    category: "WEB DEVELOPMENT / CLIENT WORK",
    description:
      "A collaborative website for custom Minecraft creations, bringing a distinctive creative vision to life.",
    visual: "client-website-visual",
    symbol: "↗",
    status: "FEATURED COLLABORATION",
  },
];

const tools = [
  {
    number: "01",
    title: "DEVELOPMENT",
    description: "React · JavaScript · Java · Spring Boot · Python",
  },
  {
    number: "02",
    title: "DATA",
    description: "SQL · MySQL · Excel · Pandas",
  },
  {
    number: "03",
    title: "CREATIVE",
    description: "DaVinci Resolve · Lightroom · Photography",
  },
];

export default function Home() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [
            ".hero-kicker",
            ".hero-line",
            ".hero-description",
            ".hero-actions",
            ".hero-social",
            ".hero-artwork",
            ".floating-label",
            ".reveal",
          ],
          { clearProps: "all" }
        );
        return;
      }

      // HERO INTRO
      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      intro
        .from(".hero-kicker", {
          y: 20,
          opacity: 0,
          duration: 0.6,
        })
        .from(
          ".hero-line",
          {
            yPercent: 110,
            opacity: 0,
            stagger: 0.14,
            duration: 0.9,
          },
          "-=0.25"
        )
        .from(
          ".hero-description, .hero-actions, .hero-social",
          {
            y: 20,
            opacity: 0,
            stagger: 0.12,
            duration: 0.6,
          },
          "-=0.35"
        )
        .from(
          ".hero-artwork",
          {
            scale: 0.8,
            opacity: 0,
            duration: 1.2,
          },
          "-=0.8"
        )
        .from(
          ".floating-label",
          {
            y: 15,
            opacity: 0,
            stagger: 0.15,
            duration: 0.5,
          },
          "-=0.5"
        );

      // ROTATING ORBITS
      gsap.to(".orbit-ring", {
        rotation: 360,
        duration: 35,
        repeat: -1,
        ease: "none",
      });

      // FLOATING CENTRAL SPHERE
      gsap.to(".visual-core", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // FLOATING GLASS OBJECTS
      [
        ".glass-drop-one",
        ".glass-drop-two",
        ".glass-drop-three",
        ".glass-drop-four",
      ].forEach((selector, index) => {
        gsap.to(selector, {
          y: index % 2 === 0 ? -20 : 18,
          x: index % 2 === 0 ? 10 : -10,
          rotation: index % 2 === 0 ? 12 : -12,
          duration: 3 + index * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // SCROLL REVEALS
      gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 45,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // 3D PROJECT CARD INTERACTION
      const cards = gsap.utils.toArray(".float-card");

      cards.forEach((card) => {
        const handleMove = (event) => {
          if (window.matchMedia("(pointer: coarse)").matches) return;

          const rect = card.getBoundingClientRect();

          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 9,
            rotateX: -y * 8,
            y: -10,
            duration: 0.35,
            ease: "power2.out",
            transformPerspective: 900,
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
    }, page);

    return () => {
      page.querySelectorAll(".float-card").forEach((card) => {
        card._cleanup?.();
        delete card._cleanup;
      });

      context.revert();
    };
  }, []);

  return (
    <main ref={pageRef}>
      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-kicker">
            <i />
            OPEN TO OPPORTUNITIES
          </div>

          <h1>
            <span className="hero-line-wrap">
              <span className="hero-line">CRAFTING</span>
            </span>

            <span className="hero-line-wrap">
              <span className="hero-line muted">DIGITAL</span>
            </span>

            <span className="hero-line-wrap">
              <span className="hero-line">
                EXPERIENCES<span className="period">.</span>
              </span>
            </span>
          </h1>

          <p className="hero-description">
            I'm a developer with a passion for creating thoughtful
            digital experiences. I turn ideas into functional,
            engaging and meaningful things on the internet.
          </p>

          <div className="hero-actions">
            <LiquidLink to="/projects" variant="solid">
              EXPLORE MY WORK ↗
            </LiquidLink>

            <LiquidLink to="/about">
              MORE ABOUT ME ↓
            </LiquidLink>
          </div>

          <div className="hero-social">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
            >
              GH &nbsp; GITHUB ↗
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
            >
              IN &nbsp; LINKEDIN ↗
            </a>
          </div>
        </div>

        {/* HERO ARTWORK */}
        <div className="hero-visual">
          <div className="hero-artwork">
            <div className="artwork-inner">
              <div className="visual-grid" />

              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="orbit-ring ring-three" />

              <div className="glass-drop glass-drop-one" />
              <div className="glass-drop glass-drop-two" />
              <div className="glass-drop glass-drop-three" />
              <div className="glass-drop glass-drop-four" />

              <div className="visual-core">
                <div className="core-inner">
                  <span className="core-symbol">
                    A<span>.</span>
                  </span>

                  <span className="core-caption">
                    DESIGN / DEVELOP / CREATE
                  </span>
                </div>
              </div>
            </div>

            <div className="floating-label label-top">
              <span>01 /</span>
              CREATIVE THINKING
            </div>

            <div className="floating-label label-bottom">
              <span>02 /</span>
              BUILDING IDEAS
            </div>

            <div className="visual-index">
              FIG. 001 — LIQUID FORM
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <span>BASED IN INDIA</span>
          <a href="#about">SCROLL TO EXPLORE ↓</a>
          <span>© 2026 ADI</span>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="section about-preview" id="about">
        <div className="section-top reveal">
          <span>01 / A LITTLE ABOUT ME</span>
          <span>DEVELOPER / CREATIVE THINKER</span>
        </div>

        <div className="about-preview-grid">
          <h2 className="display-heading reveal">
            NOT JUST
            <br />
            WRITING <em>CODE.</em>
            <br />
            BUILDING <em>IDEAS.</em>
          </h2>

          <div className="about-preview-copy reveal">
            <p className="eyebrow">HELLO, I'M ADITYA.</p>

            <p>
              I'm a Computer Science student exploring the
              intersection of development, design and visual
              storytelling.
            </p>

            <p>
              I like understanding how things work, learning
              new tools and turning ideas into experiences
              people can actually use.
            </p>

            <LiquidLink to="/about">
              MORE ABOUT ME ↗
            </LiquidLink>
          </div>
        </div>
      </section>

      {/* PERSONAL PROJECTS */}
      <section className="section home-work">
        <div className="section-top reveal">
          <span>02 / PERSONAL PROJECTS</span>
          <span>BUILDS & EXPERIMENTS</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            A FEW THINGS
            <br />
            <em>IN THE WORKS.</em>
          </h2>

          <p>
            Ideas, experiments and projects that are part
            of my development journey.
          </p>
        </div>

        <div className="featured-grid">
          {featuredProjects.map((project) => (
            <article
              className={`float-card ${project.visual}`}
              key={project.number}
            >
              <div className="float-card-art">
                <span className="card-number">
                  {project.number} / FEATURED
                </span>

                <div className="card-art-type">
                  {project.title}
                  <small>{project.category}</small>
                </div>

                <span className="card-art-footer">
                  EXPERIMENT / ADI
                </span>

                <span className="project-art-symbol">
                  {project.symbol}
                </span>
              </div>

              <div className="float-card-info">
                <div>
                  <span className="eyebrow">
                    {project.category}
                  </span>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>
                </div>

                <span className="card-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>

        <div className="center-action reveal">
          <LiquidLink to="/projects">
            VIEW ALL PERSONAL PROJECTS ↗
          </LiquidLink>
        </div>
      </section>

      {/* SELECTED CLIENT WORK */}
      <section className="section client-work-preview">
        <div className="section-top reveal">
          <span>03 / SELECTED CLIENT WORK</span>
          <span>COLLABORATIONS & REAL-WORLD BUILDS</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            BUILT FOR
            <br />
            <em>OTHERS.</em>
          </h2>

          <p>
            A selection of work created through collaboration,
            turning other people's ideas and requirements
            into digital experiences.
          </p>
        </div>

        <div className="featured-grid">
          {clientWorks.map((project) => (
            <a
              href="https://bonejam.com"
              target="_blank"
              rel="noreferrer"
              className={`float-card ${project.visual}`}
              key={project.number}
              aria-label="Visit Bone Jam website — opens in a new tab"
            >
              <div className="float-card-art">
                <span className="card-number">
                  {project.number} / CLIENT WORK
                </span>

                <div className="card-art-type">
                  BONE JAM
                  <small>CUSTOM MINECRAFT CREATIONS</small>
                </div>

                <span className="card-art-footer">
                  COLLABORATION / ADI
                </span>

                <span className="project-art-symbol">
                  {project.symbol}
                </span>
              </div>

              <div className="float-card-info">
                <div>
                  <span className="eyebrow">
                    {project.category}
                  </span>

                  <h3>BONE JAM</h3>

                  <p>{project.description}</p>
                </div>

                <span className="card-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="center-action reveal">
          <LiquidLink to="/client-work">
            VIEW ALL CLIENT WORK ↗
          </LiquidLink>
        </div>
      </section>

      {/* TOOLKIT */}
      <section className="section home-expertise">
        <div className="section-top reveal">
          <span>04 / WHAT I WORK WITH</span>
          <span>ALWAYS LEARNING</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            MY CURRENT
            <br />
            <em>TOOLKIT.</em>
          </h2>

          <p>
            Technologies and creative tools I'm learning
            and exploring.
          </p>
        </div>

        <div className="tool-grid reveal">
          {tools.map((tool) => (
            <div key={tool.number}>
              <span>{tool.number}</span>
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="contact-cta section" id="contact-cta">
        <div className="section-top reveal">
          <span>05 / HAVE SOMETHING IN MIND?</span>
          <span>LET'S CREATE</span>
        </div>

        <div className="cta-main reveal">
          <p className="eyebrow">
            GOOD IDEAS START WITH A CONVERSATION.
          </p>

          <h2>
            LET'S MAKE
            <br />
            <em>IT HAPPEN.</em>
          </h2>

          <LiquidLink to="/contact" variant="solid">
            LET'S TALK ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}
