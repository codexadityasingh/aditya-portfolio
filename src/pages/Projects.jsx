import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";
import { supabase } from "../lib/supabase";
import usePageMotion from "../hooks/usePageMotion";

ScrollTrigger.config({
  ignoreMobileResize: true,
});

const process = [
  {
    number: "01",
    title: "THE IDEA",
    description:
      "Starting with a problem, an observation or an idea worth exploring.",
  },
  {
    number: "02",
    title: "EXPLORATION",
    description:
      "Researching possibilities, testing approaches and exploring the direction.",
  },
  {
    number: "03",
    title: "DESIGN",
    description:
      "Thinking through structure, layout, interaction and the overall experience.",
  },
  {
    number: "04",
    title: "DEVELOPMENT",
    description:
      "Turning concepts into interfaces, features and working implementations.",
  },
  {
    number: "05",
    title: "REFINEMENT",
    description:
      "Testing, debugging and improving the details along the way.",
  },
  {
    number: "06",
    title: "WHAT'S NEXT",
    description:
      "Learning from each build and using it as a starting point for the next idea.",
  },
];

const getVisualClass = (project, index) => {
  const slug = (project.slug || "").toLowerCase();

  if (slug.includes("level")) return "personal-levelup";
  if (slug.includes("gym")) return "personal-gym";
  if (slug.includes("creative")) return "personal-lab";

  return `personal-custom-${index % 3}`;
};

const getSymbol = (index) => ["↗", "◈", "✳"][index % 3];

export default function Projects() {
  const pageRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-run shared animations when the project list finishes loading.
  const motionKey = loading ? "loading" : `loaded-${projects.length}`;

  usePageMotion(pageRef, motionKey);

  // FETCH PROJECTS FROM SUPABASE
  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("personal_projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setProjects([]);
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  // REFRESH SCROLL POSITIONS AFTER DYNAMIC CONTENT LOADS
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [projects, loading]);

  return (
    <main
      className="inner-page projects-page personal-projects-page"
      ref={pageRef}
    >
      {/* HERO */}
      <section className="page-hero client-work-hero personal-projects-hero">
        <p className="eyebrow motion-reveal">
          02 / PERSONAL PROJECTS & EXPERIMENTS
        </p>

        <h1 className="page-title motion-reveal">
          BUILT
          <br />
          <em>FROM CURIOSITY.</em>
        </h1>

        <p className="page-lead motion-reveal">
          Independent ideas, experiments and things I'm
          building along the way. Each project is an
          opportunity to explore, learn and create something
          meaningful.
        </p>

        <div className="client-hero-meta motion-reveal">
          <span>
            {projects.length.toString().padStart(2, "0")} / SELECTED PROJECTS
          </span>
          <span>INDEPENDENT BUILDS</span>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="section personal-featured-section">
        <div className="section-top motion-reveal">
          <span>01 / SELECTED BUILDS</span>
          <span>IDEAS INTO EXPERIENCES</span>
        </div>

        <div className="personal-section-heading motion-reveal">
          <h2 className="display-heading">
            MADE TO
            <br />
            <em>EXPLORE.</em>
          </h2>

          <p>
            A closer look at some of the ideas and concepts
            I've been developing.
          </p>
        </div>

        {loading ? (
          <p className="personal-project-message">
            LOADING PROJECTS...
          </p>
        ) : error ? (
          <p className="personal-project-message">
            UNABLE TO LOAD PROJECTS: {error}
          </p>
        ) : projects.length === 0 ? (
          <p className="personal-project-message">
            NEW PROJECTS ARE TAKING SHAPE. CHECK BACK SOON.
          </p>
        ) : (
          <div className="personal-featured-list">
            {projects.map((project, index) => {
              const visual = getVisualClass(project, index);
              const technologies = project.technologies || [];

              return (
                <article
                  className="personal-featured-project"
                  key={project.id}
                >
                  <div className="section-top motion-reveal">
                    <span>
                      {String(index + 1).padStart(2, "0")} / {project.category}
                    </span>
                    <span>{project.status}</span>
                  </div>

                  {/* CLICKABLE FEATURED ARTWORK */}
                  <Link
                    to={`/projects/${project.slug}`}
                    className="personal-feature-link motion-reveal"
                    aria-label={`View ${project.title} case study`}
                  >
                    <div className={`personal-feature-art motion-tilt ${visual}`}>
                      {project.cover_image_url && (
                        <img
                          className="personal-project-cover"
                          src={project.cover_image_url}
                          alt={`${project.title} project cover`}
                        />
                      )}

                      <div className="personal-art-image-shade" />
                      <div className="personal-art-grid" />
                      <div className="personal-art-glow" />

                      <span className="personal-art-index">
                        INDEPENDENT PROJECT / {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="personal-art-center">
                        <span className="personal-art-symbol">
                          {getSymbol(index)}
                        </span>

                        <h3>{project.title}<span>.</span></h3>
                        <p>{project.category}</p>
                      </div>

                      <span className="personal-art-footer">
                        ADI / PERSONAL WORK
                      </span>

                      <span className="personal-art-status">
                        {project.status}
                      </span>

                      <span className="personal-art-open">
                        ↗
                      </span>
                    </div>
                  </Link>

                  <div className="personal-project-meta motion-reveal">
                    <div>
                      <span>PROJECT</span>
                      <p>{project.title}</p>
                    </div>

                    <div>
                      <span>TYPE</span>
                      <p>{project.category}</p>
                    </div>

                    <div>
                      <span>ROLE</span>
                      <p>{project.role || "Independent Project"}</p>
                    </div>

                    <div>
                      <span>STATUS</span>
                      <p>{project.status}</p>
                    </div>
                  </div>

                  <div className="personal-project-overview motion-reveal">
                    <div>
                      <p className="eyebrow">ABOUT THE PROJECT</p>
                      <h3>{project.title}</h3>
                    </div>

                    <div className="personal-project-overview-copy">
                      <p>
                        {project.overview || project.description}
                      </p>

                      <div className="personal-project-tags">
                        {technologies.map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>

                      <div className="personal-project-links">
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            VIEW LIVE WEBSITE ↗
                          </a>
                        )}

                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            VIEW SOURCE CODE ↗
                          </a>
                        )}
                      </div>

                      <Link
                        to={`/projects/${project.slug}`}
                        className="personal-detail-open"
                      >
                        EXPLORE FULL CASE STUDY <span>↗</span>
                      </Link>
                    </div>
                  </div>

                  {index !== projects.length - 1 && (
                    <div className="personal-project-divider" />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* PROJECT INDEX */}
      <section className="section personal-index-section">
        <div className="section-top motion-reveal">
          <span>02 / PROJECT INDEX</span>
          <span>
            {projects.length.toString().padStart(2, "0")} / ONE JOURNEY
          </span>
        </div>

        <div className="personal-section-heading motion-reveal">
          <h2 className="display-heading">
            THE WORK
            <br />
            <em>AT A GLANCE.</em>
          </h2>

          <p>
            Different directions, different challenges,
            one continuous process of learning through building.
          </p>
        </div>

        {!loading && projects.length > 0 && (
          <div className="personal-project-index">
            {projects.map((project, index) => {
              const visual = getVisualClass(project, index);

              return (
                <Link
                  to={`/projects/${project.slug}`}
                  className="personal-index-link"
                  key={project.id}
                  aria-label={`Open ${project.title} case study`}
                >
                  <article className="personal-project-card motion-tilt motion-reveal">
                    <div className={`personal-index-art ${visual}`}>
                      {project.cover_image_url && (
                        <img
                          className="personal-index-cover"
                          src={project.cover_image_url}
                          alt={`${project.title} cover`}
                          loading="lazy"
                        />
                      )}

                      <span>
                        {String(index + 1).padStart(2, "0")} / PERSONAL PROJECT
                      </span>

                      <strong>{getSymbol(index)}</strong>

                      <small>{project.status}</small>
                    </div>

                    <div className="personal-index-info">
                      <div>
                        <span>{project.category}</span>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                      </div>

                      <span className="personal-index-arrow">↗</span>
                    </div>

                    <div className="personal-index-tags">
                      {(project.technologies || []).map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* PROCESS */}
      <section className="section personal-process-section">
        <div className="section-top motion-reveal">
          <span>03 / HOW I APPROACH A BUILD</span>
          <span>IDEA TO IMPLEMENTATION</span>
        </div>

        <div className="personal-section-heading motion-reveal">
          <h2 className="display-heading">
            LEARN BY
            <br />
            <em>MAKING.</em>
          </h2>

          <p>
            Every project is different, but the approach
            is always about exploring, building and refining.
          </p>
        </div>

        <div className="personal-process-grid">
          {process.map((step) => (
            <article
              className="personal-process-card motion-reveal motion-tilt"
              key={step.number}
            >
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <i>↗</i>
            </article>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="section client-work-ending personal-projects-ending">
        <div className="section-top motion-reveal">
          <span>04 / WHAT'S NEXT?</span>
          <span>ALWAYS IN PROGRESS</span>
        </div>

        <div className="client-ending-content motion-reveal">
          <p className="eyebrow">
            MORE IDEAS ARE TAKING SHAPE.
          </p>

          <h2 className="display-heading">
            THE NEXT
            <br />
            <em>THING STARTS HERE.</em>
          </h2>

          <LiquidLink to="/contact" variant="solid">
            HAVE SOMETHING IN MIND? ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}