import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "../lib/supabase";
import LiquidLink from "../components/LiquidLink";
import usePageMotion from "../hooks/usePageMotion";

const boneJamFallback = {
  id: "bone-jam-fallback",
  slug: "bone-jam",
  number: "001",
  title: "BONE JAM",
  category: "WEB DEVELOPMENT",
  project_type: "CREATIVE COLLABORATION",
  description:
    "A collaborative website project for a Minecraft-inspired creative platform.",
  cover_image_url: "/images/bonejam/home.png",
  image_alt: "Bone Jam website cover",
  status: "LIVE",
  featured: true,
  sort_order: 0,
};

function formatProject(project, index) {
  return {
    ...project,
    number: String(index + 1).padStart(3, "0"),
    name: project.title || project.project_name || "UNTITLED PROJECT",
    category: project.category || "CREATIVE DEVELOPMENT",
    type:
      project.project_type ||
      project.project_type_label ||
      "CLIENT COLLABORATION",
    description:
      project.description || "A creative project brought to life.",
    image: project.cover_image_url || "/images/bonejam/home.png",
    imageAlt:
      project.image_alt || project.title || "Client project cover",
    route: `/client-work/${project.slug}`,
    status: project.status || "LIVE",
  };
}

export default function ClientWork() {
  const pageRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Shared motion system. Re-runs when Supabase projects load.
  const motionKey = loading ? "loading" : `loaded-${projects.length}`;

  usePageMotion(pageRef, motionKey);

  // FETCH PUBLISHED PROJECTS
  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("client_work_projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Could not load client work:", error);
        setLoadError(true);
      }

      const databaseProjects = data || [];

      // Use the database version of Bone Jam if it exists.
      // Otherwise preserve the original Bone Jam gallery entry.
      const databaseBoneJam = databaseProjects.find(
        (project) => project.slug === "bone-jam"
      );

      const boneJam = databaseBoneJam || boneJamFallback;

      const otherProjects = databaseProjects.filter(
        (project) => project.slug !== "bone-jam"
      );

      const combinedProjects = [boneJam, ...otherProjects]
        .sort((a, b) => {
          if (a.slug === "bone-jam") return -1;
          if (b.slug === "bone-jam") return 1;

          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }

          return (a.sort_order || 0) - (b.sort_order || 0);
        })
        .map(formatProject);

      setProjects(combinedProjects);
      setLoading(false);
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh scroll positions after content and images load.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [projects, loading]);

  return (
    <main
      className="inner-page client-work-page archive-page"
      ref={pageRef}
    >
      {/* HERO */}
      <section className="page-hero client-work-hero archive-hero">
        <div className="archive-hero-orbit archive-orbit-one" />
        <div className="archive-hero-orbit archive-orbit-two" />

        <p className="eyebrow motion-reveal">
          03 / SELECTED COLLABORATIONS
        </p>

        <h1 className="page-title motion-reveal">
          WORK
          <br />
          <em>TOGETHER.</em>
        </h1>

        <p className="page-lead motion-reveal">
          A collection of ideas, collaborations and digital
          experiences brought to life through creative development.
        </p>

        <div className="client-hero-meta motion-reveal">
          <span>SELECTED CLIENT PROJECTS</span>
          <span>INDEPENDENT CREATIVE DEVELOPMENT</span>
        </div>
      </section>

      {/* PROJECT ARCHIVE */}
      <section className="section archive-section">
        <div className="section-top motion-reveal">
          <span>01 / THE ARCHIVE</span>
          <span>SELECTED WORKS</span>
        </div>

        <div className="archive-heading motion-reveal">
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
          {loading ? (
            <p className="motion-reveal">
              LOADING SELECTED WORKS...
            </p>
          ) : (
            projects.map((project) => (
              <Link
                to={project.route}
                className="archive-project-card motion-reveal motion-tilt"
                key={project.slug}
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
            ))
          )}
        </div>

        {loadError && (
          <p className="motion-reveal">
            Some projects couldn't be loaded. Showing the existing archive
            where available.
          </p>
        )}

        <div className="archive-counter motion-reveal">
          <span>SELECTED CLIENT PROJECTS</span>

          <span>
            {String(projects.length).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </section>

      {/* CLOSING */}
      <section className="section archive-ending">
        <div className="section-top motion-reveal">
          <span>02 / THE NEXT COLLABORATION</span>
          <span>OPEN TO IDEAS</span>
        </div>

        <div className="archive-ending-content motion-reveal">
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