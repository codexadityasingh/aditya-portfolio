
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "../lib/supabase";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeGalleryItem(item, index) {
  if (typeof item === "string") {
    return {
      number: String(index + 1).padStart(2, "0"),
      title: `PROJECT IMAGE ${index + 1}`,
      description: "",
      image: item,
      alt: `Project image ${index + 1}`,
      wide: index === 0,
    };
  }

  return {
    number: String(index + 1).padStart(2, "0"),
    title: item.title || `PROJECT IMAGE ${index + 1}`,
    description: item.description || "",
    image: item.image || item.url || item.image_url || "",
    alt: item.alt || item.image_alt || item.title || "Project image",
    wide: Boolean(item.wide) || index === 0,
  };
}

function normalizeContribution(item, index) {
  if (typeof item === "string") {
    return {
      number: String(index + 1).padStart(2, "0"),
      title: item,
      description: "",
    };
  }

  return {
    number:
      item.number ||
      String(index + 1).padStart(2, "0"),
    title: item.title || "CONTRIBUTION",
    description: item.description || "",
  };
}

function normalizeProcess(item, index) {
  if (Array.isArray(item)) {
    return {
      number: item[0] || String(index + 1).padStart(2, "0"),
      title: item[1] || "PROCESS",
      description: item[2] || "",
    };
  }

  return {
    number:
      item.number ||
      String(index + 1).padStart(2, "0"),
    title: item.title || "PROCESS",
    description: item.description || "",
  };
}

export default function ClientWorkDetail() {
  const { slug } = useParams();
  const pageRef = useRef(null);

  const [project, setProject] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // LOAD PROJECT
  useEffect(() => {
    let isMounted = true;

    async function loadProject() {
      setLoading(true);
      setNotFound(false);
      setProject(null);

      const { data, error } = await supabase
        .from("client_work_projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error("Could not load client project:", error);
        setNotFound(true);
      } else if (!data) {
        setNotFound(true);
      } else {
        setProject(data);
      }

      setLoading(false);
    }

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // LOAD APPROVED REVIEWS FOR THIS PROJECT
  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      setReviewsLoading(true);

      const { data, error } = await supabase
        .from("client_reviews")
        .select(
          "id, reviewer_name, reviewer_role, rating, review_text, created_at"
        )
        .eq("project_slug", slug)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Could not load client reviews:", error);
        setReviews([]);
      } else {
        setReviews(data || []);
      }

      setReviewsLoading(false);
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // GSAP ANIMATIONS
  useEffect(() => {
    const page = pageRef.current;
    if (!page || loading || !project) return;

    const context = gsap.context(() => {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

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

      gsap
        .utils.toArray(".client-process-card, .client-gallery-card")
        .forEach((card) => {
          const handleMove = (event) => {
            if (window.matchMedia("(pointer: coarse)").matches) return;

            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, {
              rotateY: x * 2.5,
              rotateX: -y * 2.5,
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

      ScrollTrigger.refresh();
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
  }, [loading, project, reviewsLoading]);

  if (loading) {
    return (
      <main className="inner-page client-work-page" ref={pageRef}>
        <section className="page-hero client-work-hero">
          <p className="eyebrow">CLIENT PROJECT / LOADING</p>
          <h1 className="page-title">
            LOADING
            <br />
            <em>PROJECT.</em>
          </h1>
        </section>
      </main>
    );
  }

  if (notFound || !project) {
    return (
      <main className="inner-page client-work-page">
        <section className="page-hero client-work-hero">
          <p className="eyebrow">CLIENT PROJECT / 404</p>
          <h1 className="page-title">
            PROJECT
            <br />
            <em>NOT FOUND.</em>
          </h1>
          <p className="page-lead">
            This project may have been unpublished or the link may be incorrect.
          </p>
          <LiquidLink to="/client-work" variant="glass">
            BACK TO CLIENT WORK ↗
          </LiquidLink>
        </section>
      </main>
    );
  }

  const gallery = asArray(project.gallery_images)
    .map(normalizeGalleryItem)
    .filter((item) => item.image);

  const contributions = asArray(project.contributions)
    .map(normalizeContribution);

  const process = asArray(project.process)
    .map(normalizeProcess);

  const overviewParagraphs = asArray(project.overview_paragraphs);
  const aiParagraphs = asArray(project.ai_paragraphs);

  const projectName =
    project.project_name || project.title;

  const projectType =
    project.project_type_label ||
    project.project_type ||
    project.category;

  const role = project.role || "Development / Implementation";

  const liveLabel =
    project.live_label ||
    project.live_url ||
    "Not publicly available";

  const featureLabel =
    project.feature_label || project.category;

  const featureTitle =
    project.feature_title || project.title;

  const featureDescription =
    project.feature_description || project.description;

  const overviewTitle =
    project.overview_title || "ONE IDEA. SHARED EFFORT.";

  const aiHeading =
    project.ai_heading || "BUILT WITH NEW TOOLS.";

  const aiLabel =
    project.ai_label || "THE DEVELOPMENT APPROACH";

  const aiTag =
    project.ai_tag || "TOOLS / TECHNOLOGY";

  return (
    <main className="inner-page client-work-page" ref={pageRef}>
      {/* HERO */}
      <section className="page-hero client-work-hero">
        <p className="eyebrow client-reveal">
          03 / COLLABORATIONS & CLIENT WORK
        </p>

        <h1 className="page-title client-reveal">
          {project.title}
          <br />
          <em>CASE STUDY.</em>
        </h1>

        <p className="page-lead client-reveal">
          {project.description}
        </p>

        <div className="client-hero-meta client-reveal">
          <span>{project.category}</span>
          <span>{project.status || "COMPLETED PROJECT"}</span>
        </div>
      </section>

      {/* FEATURED PROJECT */}
      <section className="section client-feature">
        <div className="section-top client-reveal">
          <span>01 / FEATURED PROJECT</span>
          <span>{project.title}</span>
        </div>

        <div className="client-feature-art client-reveal">
          <div className="client-feature-glow" />

          {project.cover_image_url && (
            <img
              className="client-dynamic-cover"
              src={project.cover_image_url}
              alt={project.image_alt || project.title}
            />
          )}

          <div className="client-feature-content">
            <span className="client-feature-label">
              {featureLabel}
            </span>

            <h2>
              {featureTitle}<span>.</span>
            </h2>

            <p>{featureDescription}</p>

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="client-live-link"
              >
                VISIT LIVE WEBSITE ↗
              </a>
            )}
          </div>

          <div className="client-feature-index">
            CLIENT PROJECT / {project.slug.toUpperCase()}
          </div>
        </div>

        <div className="client-project-meta client-reveal">
          <div>
            <span>PROJECT</span>
            <p>{projectName}</p>
          </div>

          <div>
            <span>TYPE</span>
            <p>{projectType}</p>
          </div>

          <div>
            <span>MY ROLE</span>
            <p>{role}</p>
          </div>

          <div>
            <span>LIVE</span>
            <p>{liveLabel}</p>
          </div>
        </div>
      </section>

      {/* SCREENSHOT GALLERY */}
      {gallery.length > 0 && (
        <section className="section client-gallery">
          <div className="section-top client-reveal">
            <span>02 / PROJECT GALLERY</span>
            <span>SELECTED SCREENS / {project.title}</span>
          </div>

          <div className="client-gallery-heading client-reveal">
            <h2 className="display-heading">
              A CLOSER
              <br />
              <em>LOOK.</em>
            </h2>

            <p>
              A closer look at the project's visual language,
              key sections and overall experience.
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
                    {item.number} / {String(gallery.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="client-gallery-caption">
                  <div>
                    <span>{item.number} / {project.title}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>

                  <span className="client-gallery-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>

          {project.live_url && (
            <div className="client-gallery-outro client-reveal">
              <span>THE COMPLETE EXPERIENCE</span>

              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="client-text-link"
              >
                EXPLORE THE LIVE WEBSITE ↗
              </a>
            </div>
          )}
        </section>
      )}

      {/* OVERVIEW */}
      {overviewParagraphs.length > 0 && (
        <section className="section client-overview">
          <div className="section-top client-reveal">
            <span>03 / THE COLLABORATION</span>
            <span>IDEA TO IMPLEMENTATION</span>
          </div>

          <div className="client-overview-grid">
            <h2 className="display-heading client-reveal">
              {overviewTitle}
            </h2>

            <div className="client-overview-copy client-reveal">
              <p className="eyebrow">ABOUT THE PROJECT</p>

              {overviewParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="client-text-link"
                >
                  EXPLORE {project.title.toUpperCase()} ↗
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CONTRIBUTION */}
      {contributions.length > 0 && (
        <section className="section client-contribution">
          <div className="section-top client-reveal">
            <span>04 / MY CONTRIBUTION</span>
            <span>WHAT I WORKED ON</span>
          </div>

          <div className="client-contribution-heading client-reveal">
            <h2 className="display-heading">
              THE WORK
              <br />
              <em>BEHIND IT.</em>
            </h2>

            <p>
              The responsibilities and contributions behind
              this collaboration.
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
      )}

      {/* AI TRANSPARENCY */}
      {aiParagraphs.length > 0 && (
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
              <p className="eyebrow">{aiLabel}</p>

              <h2 className="display-heading">
                {aiHeading}
              </h2>

              {aiParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <span className="client-ai-tag">{aiTag}</span>
            </div>
          </div>
        </section>
      )}

      {/* PROCESS */}
      {process.length > 0 && (
        <section className="section client-process">
          <div className="section-top client-reveal">
            <span>06 / THE PROCESS</span>
            <span>FROM IDEA TO DELIVERY</span>
          </div>

          <div className="client-process-heading client-reveal">
            <h2 className="display-heading">
              THE WORK
              <br />
              <em>IN STAGES.</em>
            </h2>
          </div>

          <div className="client-process-grid">
            {process.map((item) => (
              <article
                className="client-process-card"
                key={item.number}
              >
                <span className="client-process-number">
                  {item.number}
                </span>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="client-process-mark">↗</span>
              </article>
            ))}
          </div>
        </section>
      )}

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
            Here's what the people behind the projects have to say.
          </p>
        </div>

        <div className="client-reviews-list client-reveal">
          <div className="client-reviews-header">
            <div>
              <span className="eyebrow">
                {project.title} / CLIENT COLLABORATION
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
                <article className="client-review-card" key={review.id}>
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

        <div className="client-review-invite client-reveal">
          <p>WORKED WITH ME ON {project.title.toUpperCase()}?</p>

          <LiquidLink to={`/review/${project.slug}`} variant="glass">
            SHARE YOUR EXPERIENCE ↗
          </LiquidLink>
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
