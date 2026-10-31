
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const contributions = [
  {
    number: "01",
    title: "DEVELOPMENT",
    description:
      "Contributed to translating the project vision into a working website through coding and implementation.",
  },
  {
    number: "02",
    title: "CODE REFINEMENT",
    description:
      "Worked through code, debugging and adjustments to help bring different parts of the website together.",
  },
  {
    number: "03",
    title: "AI-ASSISTED WORKFLOW",
    description:
      "Used Antigravity and AI-assisted development to generate, refine and implement parts of the experience.",
  },
];

const process = [
  ["01", "CONCEPT", "The original idea and creative direction."],
  ["02", "LAYOUT", "Structuring the website experience."],
  ["03", "ANIMATION", "Bringing movement and interaction into the experience."],
  ["04", "IMPLEMENTATION", "Turning ideas into working code."],
  ["05", "REFINEMENT", "Testing, debugging and adjustments."],
  ["06", "DELIVERY", "Bringing the website together."],
];

// Add your actual screenshots to public/images/bonejam/
// using these filenames.
const gallery = [
  {
    number: "01",
    title: "THE LANDING EXPERIENCE",
    description: "The main entry point and visual introduction.",
    image: "/images/bonejam/home.png",
    alt: "Bone Jam homepage",
    wide: true,
  },
  {
    number: "02",
    title: "THE CREATIVE WORK",
    description: "The section presenting the creative disciplines.",
    image: "/images/bonejam/work.png",
    alt: "Bone Jam creative work section",
  },
  {
    number: "03",
    title: "THE PROCESS",
    description: "The stages behind the creative production.",
    image: "/images/bonejam/process.png",
    alt: "Bone Jam process section",
  },
  {
    number: "04",
    title: "THE DETAILS",
    description: "More of the website's visual language and details.",
    image: "/images/bonejam/details.png",
    alt: "Bone Jam website details",
  },
];

export default function ClientWork() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) return;

      gsap.utils.toArray(".client-reveal").forEach((element) => {
        gsap.from(element, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray(".client-process-card, .client-gallery-card").forEach((card) => {
        const handleMove = (event) => {
          if (window.matchMedia("(pointer: coarse)").matches) return;

          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 4,
            rotateX: -y * 4,
            y: -5,
            duration: 0.3,
            ease: "power2.out",
            transformPerspective: 900,
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
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
      page
        .querySelectorAll(".client-process-card, .client-gallery-card")
        .forEach((card) => {
          card._cleanup?.();
          delete card._cleanup;
        });

      context.revert();
    };
  }, []);

  return (
    <main className="inner-page client-work-page" ref={pageRef}>
      {/* HERO */}
      <section className="page-hero client-work-hero">
        <p className="eyebrow client-reveal">
          03 / COLLABORATIONS & CLIENT WORK
        </p>

        <h1 className="page-title client-reveal">
          BUILT
          <br />
          <em>TOGETHER.</em>
        </h1>

        <p className="page-lead client-reveal">
          A collection of collaborations where ideas become
          digital experiences. Different perspectives,
          shared effort and a little help from technology.
        </p>

        <div className="client-hero-meta client-reveal">
          <span>01 / FEATURED COLLABORATION</span>
          <span>WEB DEVELOPMENT</span>
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="section client-feature">
        <div className="section-top client-reveal">
          <span>01 / FEATURED PROJECT</span>
          <span>BONE JAM</span>
        </div>

        <div className="client-feature-art client-reveal">
          <div className="client-feature-glow" />

          <div className="client-feature-content">
            <span className="client-feature-label">
              CUSTOM MINECRAFT CREATIONS
            </span>

            <h2>
              BONE JAM<span>.</span>
            </h2>

            <p>
              A collaborative website project for a
              Minecraft-inspired creative platform.
            </p>

            <a
              href="https://bonejam.com"
              target="_blank"
              rel="noreferrer"
              className="client-live-link"
            >
              VISIT LIVE WEBSITE ↗
            </a>
          </div>

          <div className="client-feature-index">
            COLLABORATION / 001
          </div>
        </div>

        <div className="client-project-meta client-reveal">
          <div>
            <span>PROJECT</span>
            <p>Bone Jam — Custom Minecraft Creations</p>
          </div>

          <div>
            <span>TYPE</span>
            <p>Website / Creative Collaboration</p>
          </div>

          <div>
            <span>MY ROLE</span>
            <p>Development / Implementation</p>
          </div>

          <div>
            <span>LIVE</span>
            <p>bonejam.com</p>
          </div>
        </div>
      </section>

      {/* SCREENSHOT GALLERY */}
      <section className="section client-gallery">
        <div className="section-top client-reveal">
          <span>02 / PROJECT GALLERY</span>
          <span>SELECTED SCREENS / BONE JAM</span>
        </div>

        <div className="client-gallery-heading client-reveal">
          <h2 className="display-heading">
            A CLOSER
            <br />
            <em>LOOK.</em>
          </h2>

          <p>
            A closer look at the live website, its sections
            and the experience built through this collaboration.
          </p>
        </div>

        <div className="client-gallery-grid">
          {gallery.map((item) => (
            <article
              className={`client-gallery-card ${
                item.wide ? "client-gallery-card-wide" : ""
              }`}
              key={item.number}
            >
              <div className="client-gallery-image">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                />

                <span className="client-gallery-image-index">
                  {item.number} / 04
                </span>
              </div>

              <div className="client-gallery-caption">
                <div>
                  <span>{item.number} / BONE JAM</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <span className="client-gallery-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>

        <div className="client-gallery-outro client-reveal">
          <span>THE COMPLETE EXPERIENCE</span>

          <a
            href="https://bonejam.com"
            target="_blank"
            rel="noreferrer"
            className="client-text-link"
          >
            EXPLORE THE LIVE WEBSITE ↗
          </a>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="section client-overview">
        <div className="section-top client-reveal">
          <span>03 / THE COLLABORATION</span>
          <span>IDEA TO IMPLEMENTATION</span>
        </div>

        <div className="client-overview-grid">
          <h2 className="display-heading client-reveal">
            ONE IDEA.
            <br />
            <em>SHARED EFFORT.</em>
          </h2>

          <div className="client-overview-copy client-reveal">
            <p className="eyebrow">ABOUT THE PROJECT</p>

            <p>
              Bone Jam is a website for custom Minecraft
              creations, with a visual identity inspired by
              the world of Minecraft.
            </p>

            <p>
              The original concept and creative direction
              belonged to the client. I contributed to
              building the website, working with code,
              implementation and debugging to help turn
              that vision into a working experience.
            </p>

            <a
              href="https://bonejam.com"
              target="_blank"
              rel="noreferrer"
              className="client-text-link"
            >
              EXPLORE BONE JAM ↗
            </a>
          </div>
        </div>
      </section>

      {/* CONTRIBUTION */}
      <section className="section client-contribution">
        <div className="section-top client-reveal">
          <span>04 / MY CONTRIBUTION</span>
          <span>WHAT I WORKED ON</span>
        </div>

        <div className="client-contribution-heading client-reveal">
          <h2 className="display-heading">
            LEARNING BY
            <br />
            <em>BUILDING.</em>
          </h2>

          <p>
            My role was to help implement the client's
            vision, using development tools and AI assistance
            along the way.
          </p>
        </div>

        <div className="client-contribution-list">
          {contributions.map((item) => (
            <article
              className="client-contribution-row client-reveal"
              key={item.number}
            >
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="client-row-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* AI TRANSPARENCY */}
      <section className="section client-ai-section">
        <div className="section-top client-reveal">
          <span>05 / THE DEVELOPMENT APPROACH</span>
          <span>TOOLS & TECHNOLOGY</span>
        </div>

        <div className="client-ai-panel client-reveal">
          <div className="client-ai-orbit">
            <span>AI</span>
          </div>

          <div className="client-ai-copy">
            <p className="eyebrow">
              A HUMAN-LED, AI-ASSISTED WORKFLOW
            </p>

            <h2 className="display-heading">
              BUILT WITH
              <br />
              <em>NEW TOOLS.</em>
            </h2>

            <p>
              Antigravity and AI-assisted tools supported
              parts of the coding and implementation process,
              including code generation and animation work.
              I worked with the generated output, made
              adjustments and helped debug the implementation.
            </p>

            <p>
              The project reflects a collaborative process:
              the client's original idea and direction,
              development work, and AI-assisted tooling.
            </p>

            <span className="client-ai-tag">
              ANTIGRAVITY / AI-ASSISTED DEVELOPMENT
            </span>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section client-process">
        <div className="section-top client-reveal">
          <span>06 / THE PROCESS</span>
          <span>FROM IDEA TO WEBSITE</span>
        </div>

        <div className="client-process-heading client-reveal">
          <h2 className="display-heading">
            THE WORK
            <br />
            <em>IN STAGES.</em>
          </h2>
        </div>

        <div className="client-process-grid">
          {process.map(([number, title, description]) => (
            <article
              className="client-process-card"
              key={number}
            >
              <span className="client-process-number">
                {number}
              </span>

              <h3>{title}</h3>
              <p>{description}</p>
              <span className="client-process-mark">↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* PUBLISHED CLIENT FEEDBACK */}
      <section className="section client-review-section">
        <div className="section-top client-reveal">
          <span>07 / CLIENT FEEDBACK</span>
          <span>VERIFIED COLLABORATION REVIEWS</span>
        </div>

        <div className="client-review-heading client-reveal">
          <p className="eyebrow">A WORD FROM THE CLIENT</p>

          <h2 className="display-heading">
            THE CLIENT'S
            <br />
            <em>POINT OF VIEW.</em>
          </h2>

          <p>
            Every collaboration has two perspectives.
            This is where published feedback from the people
            behind the projects will appear.
          </p>
        </div>

        <div className="client-reviews-list client-reveal">
          <div className="client-reviews-header">
            <div>
              <span className="eyebrow">BONE JAM / COLLABORATION 001</span>
              <h3>CLIENT REVIEWS</h3>
            </div>

            <span className="client-reviews-count">
              00 PUBLISHED
            </span>
          </div>

          <div className="client-reviews-empty">
            <span className="client-review-quote-mark">“</span>

            <h3>NO REVIEWS PUBLISHED YET.</h3>

            <p>
              Once the client shares their feedback and it is
              approved for publication, it will appear here.
            </p>

            <span className="client-review-status">
              <i />
              WAITING FOR CLIENT FEEDBACK
            </span>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="section client-work-ending">
        <div className="section-top client-reveal">
          <span>08 / WHAT'S NEXT?</span>
          <span>MORE COLLABORATIONS AHEAD</span>
        </div>

        <div className="client-ending-content client-reveal">
          <p className="eyebrow">
            HAVE AN IDEA WORTH BUILDING?
          </p>

          <h2 className="display-heading">
            LET'S BUILD
            <br />
            <em>SOMETHING.</em>
          </h2>

          <LiquidLink to="/contact" variant="solid">
            START A CONVERSATION ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}
