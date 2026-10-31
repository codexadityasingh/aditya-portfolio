import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "../lib/supabase";
import LiquidLink from "../components/LiquidLink";
import usePageMotion from "../hooks/usePageMotion";

export default function PersonalProjectDetail() {
  const { slug } = useParams();
  const pageRef = useRef(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-run shared motion when the project changes or finishes loading.
  const motionKey = `${slug}-${loading ? "loading" : "loaded"}`;

  usePageMotion(pageRef, motionKey);

  // FETCH PROJECT
  useEffect(() => {
    let active = true;

    const loadProject = async () => {
      setLoading(true);
      setError("");
      setProject(null);

      const { data, error: fetchError } = await supabase
        .from("personal_projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
      } else if (!data) {
        setError("This project could not be found.");
      } else {
        setProject(data);
      }

      setLoading(false);
    };

    loadProject();

    return () => {
      active = false;
    };
  }, [slug]);

  // REFRESH SCROLL POSITIONS AFTER CONTENT LOADS
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [project, loading]);

  if (loading) {
    return (
      <main
        className="inner-page personal-detail-page"
        ref={pageRef}
      >
        <div className="personal-detail-message motion-reveal">
          LOADING PROJECT...
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main
        className="inner-page personal-detail-page"
        ref={pageRef}
      >
        <div className="personal-detail-message motion-reveal">
          <p>{error || "Project not found."}</p>
          <Link to="/projects">← BACK TO PROJECTS</Link>
        </div>
      </main>
    );
  }

  const gallery = Array.isArray(project.gallery_images)
    ? project.gallery_images
    : [];

  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : [];

  return (
    <main
      className="inner-page personal-detail-page"
      ref={pageRef}
    >
      {/* HERO */}
      <section className="personal-detail-hero">
        <div className="section-top motion-reveal">
          <Link to="/projects">← ALL PERSONAL PROJECTS</Link>
          <span>ADI / INDEPENDENT WORK</span>
        </div>

        <p className="eyebrow motion-reveal">
          PERSONAL PROJECT / {project.category}
        </p>

        <h1 className="personal-detail-title motion-reveal">
          {project.title}<em>.</em>
        </h1>

        <p className="personal-detail-description motion-reveal">
          {project.description}
        </p>

        <div className="personal-detail-meta motion-reveal">
          <div>
            <span>PROJECT TYPE</span>
            <p>{project.category}</p>
          </div>

          <div>
            <span>MY ROLE</span>
            <p>{project.role || "Independent Project"}</p>
          </div>

          <div>
            <span>STATUS</span>
            <p>{project.status}</p>
          </div>

          <div>
            <span>YEAR</span>
            <p>
              {new Date(project.created_at).getFullYear()}
            </p>
          </div>
        </div>
      </section>

      {/* COVER */}
      {project.cover_image_url && (
        <section className="personal-detail-cover-section motion-reveal">
          <div className="motion-tilt">
            <img
              src={project.cover_image_url}
              alt={`${project.title} project cover`}
            />
          </div>
        </section>
      )}

      {/* OVERVIEW */}
      <section className="personal-detail-overview">
        <div className="motion-reveal">
          <p className="eyebrow">01 / THE PROJECT</p>

          <h2>
            THE IDEA
            <br />
            <em>BEHIND IT.</em>
          </h2>
        </div>

        <div className="personal-detail-copy motion-reveal">
          <p>{project.overview || project.description}</p>

          <div className="personal-detail-tags">
            {technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>

          <div className="personal-detail-actions">
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
        </div>
      </section>

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="personal-detail-gallery">
          <div className="section-top motion-reveal">
            <span>02 / VISUAL EXPLORATION</span>
            <span>
              {String(gallery.length).padStart(2, "0")} IMAGES
            </span>
          </div>

          <h2 className="motion-reveal">
            INSIDE THE
            <br />
            <em>BUILD.</em>
          </h2>

          <div className="personal-detail-gallery-grid">
            {gallery.map((image, index) => (
              <figure
                className="motion-reveal motion-tilt"
                key={`${image}-${index}`}
              >
                <img
                  src={image}
                  alt={`${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                />

                <figcaption>
                  {String(index + 1).padStart(2, "0")} / {project.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CLOSING */}
      <section className="personal-detail-ending">
        <div className="motion-reveal">
          <p className="eyebrow">MORE IN THE WORKS.</p>

          <h2>
            ON TO THE
            <br />
            <em>NEXT IDEA.</em>
          </h2>

          <LiquidLink to="/projects" variant="solid">
            EXPLORE MORE PROJECTS ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}