import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";
import { supabase } from "../lib/supabase";
import usePageMotion from "../hooks/usePageMotion";

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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Shared animation system.
  // Re-run when asynchronous reviews arrive.
  const motionKey = reviewsLoading
    ? "reviews-loading"
    : `reviews-loaded-${reviews.length}`;

  usePageMotion(pageRef, motionKey);

  // LOAD APPROVED CLIENT REVIEWS
  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      const { data, error } = await supabase
        .from("client_reviews")
        .select(
          "id, reviewer_name, reviewer_role, rating, review_text, created_at"
        )
        .eq("project_slug", "bone-jam")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Could not load client reviews:", error.message);
        setReviews([]);
      } else {
        setReviews(data ?? []);
      }

      setReviewsLoading(false);
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh scroll positions when review content changes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [reviews, reviewsLoading]);

  return (
    <main className="inner-page client-work-page" ref={pageRef}>

      {/* HERO */}
      <section className="page-hero client-work-hero">
        <p className="eyebrow motion-reveal">
          03 / COLLABORATIONS & CLIENT WORK
        </p>

        <h1 className="page-title motion-reveal">
          BUILT
          <br />
          <em>TOGETHER.</em>
        </h1>

        <p className="page-lead motion-reveal">
          A collection of collaborations where ideas become
          digital experiences. Different perspectives,
          shared effort and a little help from technology.
        </p>

        <div className="client-hero-meta motion-reveal">
          <span>01 / FEATURED COLLABORATION</span>
          <span>WEB DEVELOPMENT</span>
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="section client-feature">
        <div className="section-top motion-reveal">
          <span>01 / FEATURED PROJECT</span>
          <span>BONE JAM</span>
        </div>

        <div className="client-feature-art motion-reveal motion-tilt">
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

        <div className="client-project-meta motion-reveal">
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
        <div className="section-top motion-reveal">
          <span>02 / PROJECT GALLERY</span>
          <span>SELECTED SCREENS / BONE JAM</span>
        </div>

        <div className="client-gallery-heading motion-reveal">
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
              className={`client-gallery-card motion-reveal motion-tilt ${
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

        <div className="client-gallery-outro motion-reveal">
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
        <div className="section-top motion-reveal">
          <span>03 / THE COLLABORATION</span>
          <span>IDEA TO IMPLEMENTATION</span>
        </div>

        <div className="client-overview-grid">
          <h2 className="display-heading motion-reveal">
            ONE IDEA.
            <br />
            <em>SHARED EFFORT.</em>
          </h2>

          <div className="client-overview-copy motion-reveal">
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
        <div className="section-top motion-reveal">
          <span>04 / MY CONTRIBUTION</span>
          <span>WHAT I WORKED ON</span>
        </div>

        <div className="client-contribution-heading motion-reveal">
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
              className="client-contribution-row motion-reveal motion-tilt"
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
        <div className="section-top motion-reveal">
          <span>05 / THE DEVELOPMENT APPROACH</span>
          <span>TOOLS & TECHNOLOGY</span>
        </div>

        <div className="client-ai-panel motion-reveal">
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
        <div className="section-top motion-reveal">
          <span>06 / THE PROCESS</span>
          <span>FROM IDEA TO WEBSITE</span>
        </div>

        <div className="client-process-heading motion-reveal">
          <h2 className="display-heading">
            THE WORK
            <br />
            <em>IN STAGES.</em>
          </h2>
        </div>

        <div className="client-process-grid">
          {process.map(([number, title, description]) => (
            <article
              className="client-process-card motion-reveal motion-tilt"
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
        <div className="section-top motion-reveal">
          <span>07 / CLIENT FEEDBACK</span>
          <span>VERIFIED COLLABORATION REVIEWS</span>
        </div>

        <div className="client-review-heading motion-reveal">
          <p className="eyebrow">A WORD FROM THE CLIENT</p>

          <h2 className="display-heading">
            THE CLIENT'S
            <br />
            <em>POINT OF VIEW.</em>
          </h2>

          <p>
            Every collaboration has two perspectives.
            Here's what the people behind the projects have to say.
          </p>
        </div>

        <div className="client-reviews-list motion-reveal">
          <div className="client-reviews-header">
            <div>
              <span className="eyebrow">
                BONE JAM / COLLABORATION 001
              </span>
              <h3>CLIENT REVIEWS</h3>
            </div>

            <span className="client-reviews-count">
              {String(reviews.length).padStart(2, "0")} PUBLISHED
            </span>
          </div>

          {reviewsLoading ? (
            <div className="client-reviews-empty">
              <span className="client-review-status">
                LOADING CLIENT FEEDBACK...
              </span>
            </div>
          ) : reviews.length === 0 ? (
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
          ) : (
            <div className="client-review-cards">
              {reviews.map((review) => (
                <article
                  className="client-review-card motion-reveal motion-tilt"
                  key={review.id}
                >
                  <div className="client-review-card-top">
                    <span
                      className="client-review-stars"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      <span>{"☆".repeat(5 - review.rating)}</span>
                    </span>

                    <span className="client-review-date">
                      {new Date(review.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <span className="client-review-quote-mark">“</span>

                  <p className="client-review-text">
                    {review.review_text}
                  </p>

                  <div className="client-review-author">
                    <span
                      className="client-review-avatar"
                      aria-hidden="true"
                    >
                      {review.reviewer_name.trim().charAt(0).toUpperCase()}
                    </span>

                    <div>
                      <h3>{review.reviewer_name}</h3>

                      {review.reviewer_role && (
                        <p>{review.reviewer_role}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* REVIEW INVITATION */}
        <div className="client-review-invite motion-reveal">
          <p>WORKED WITH ME ON BONE JAM?</p>

          <LiquidLink to="/review/bone-jam" variant="glass">
            SHARE YOUR EXPERIENCE ↗
          </LiquidLink>
        </div>
      </section>

      {/* CLOSING */}
      <section className="section client-work-ending">
        <div className="section-top motion-reveal">
          <span>08 / WHAT'S NEXT?</span>
          <span>MORE COLLABORATIONS AHEAD</span>
        </div>

        <div className="client-ending-content motion-reveal">
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