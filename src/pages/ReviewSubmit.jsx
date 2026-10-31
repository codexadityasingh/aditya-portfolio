
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ReviewSubmit() {
  const { projectSlug: routeSlug } = useParams();

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [projectSlug, setProjectSlug] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // LOAD ALL ACTIVE PROJECTS
  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setProjectsLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("client_projects")
        .select("slug, name, active")
        .eq("active", true)
        .order("name", { ascending: true });

      if (!active) return;

      if (fetchError) {
        console.error("Project loading failed:", fetchError);
        setError("Unable to load projects. Please refresh the page.");
        setProjects([]);
      } else {
        const activeProjects = data || [];
        setProjects(activeProjects);

        if (routeSlug) {
          const matchingProject = activeProjects.find(
            (project) => project.slug === routeSlug
          );

          if (matchingProject) {
            setProjectSlug(matchingProject.slug);
          } else {
            setProjectSlug("");
            setError(
              "This project is unavailable for reviews. It may have been deactivated."
            );
          }
        } else {
          setProjectSlug("");
        }
      }

      setProjectsLoading(false);
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, [routeSlug]);

  // SELECTED PROJECT
  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === projectSlug),
    [projects, projectSlug]
  );

  const isProjectUnavailable =
    Boolean(routeSlug) &&
    !projectsLoading &&
    !selectedProject;

  // SUBMIT REVIEW
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanRole = role.trim();
    const cleanReview = review.trim();

    if (!selectedProject) {
      setError("Please select an active project.");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Please enter a name between 2 and 80 characters.");
      return;
    }

    if (cleanRole.length > 120) {
      setError("Your role or company name is too long.");
      return;
    }

    if (cleanReview.length < 10 || cleanReview.length > 1500) {
      setError("Your review must be between 10 and 1500 characters.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a valid star rating.");
      return;
    }

    setSubmitting(true);

    try {
      // Confirm that the project is still active.
      const { data: currentProject, error: projectError } =
        await supabase
          .from("client_projects")
          .select("slug, name, active")
          .eq("slug", selectedProject.slug)
          .eq("active", true)
          .maybeSingle();

      if (projectError) throw projectError;

      if (!currentProject) {
        throw new Error(
          "This project is no longer accepting reviews."
        );
      }

      const { error: submitError } = await supabase
        .from("client_reviews")
        .insert({
          project_slug: currentProject.slug,
          reviewer_name: cleanName,
          reviewer_role: cleanRole || null,
          rating,
          review_text: cleanReview,
          status: "pending",
        });

      if (submitError) throw submitError;

      setSubmitted(true);
    } catch (err) {
      console.error("Review submission failed:", err);

      setError(
        err.message ||
          "Something went wrong while submitting your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <main className="review-submit-page">
        <section className="review-submit-container review-success">
          <span className="review-eyebrow">
            {selectedProject?.name.toUpperCase()} / CLIENT FEEDBACK
          </span>

          <div className="review-success-icon">✓</div>

          <h1>
            THANK YOU<span>.</span>
          </h1>

          <p>
            Your review for {selectedProject?.name} has been received.
            It'll appear on the portfolio once it has been reviewed
            and approved.
          </p>

          <Link to="/" className="review-back-link">
            BACK TO PORTFOLIO <span>↗</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="review-submit-page">
      <section className="review-submit-container">

        {/* PAGE HEADING */}
        <div className="review-submit-heading">
          <span className="review-eyebrow">
            ADI / CLIENT FEEDBACK
          </span>

          <h1>
            YOUR WORDS.
            <br />
            MY <span>WORK.</span>
          </h1>

          <p>
            I'd love to hear about your experience working together.
            Share your honest feedback below.
          </p>
        </div>

        {/* PROJECT UNAVAILABLE */}
        {isProjectUnavailable ? (
          <div className="review-form-error" role="alert">
            {error || "This project is not accepting reviews right now."}
            <p>
              <Link to="/review">VIEW AVAILABLE PROJECTS ↗</Link>
            </p>
          </div>
        ) : (
          <form
            className="review-submit-form"
            onSubmit={handleSubmit}
          >

            {/* PROJECT SELECTOR */}
            <div className="review-form-field">
              <label htmlFor="review-project">
                SELECT YOUR PROJECT
              </label>

              <select
                id="review-project"
                value={projectSlug}
                onChange={(event) => setProjectSlug(event.target.value)}
                disabled={projectsLoading || projects.length === 0}
                required
              >
                <option value="" disabled>
                  {projectsLoading
                    ? "Loading projects..."
                    : projects.length === 0
                    ? "No projects available"
                    : "Choose the project you worked on"}
                </option>

                {projects.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* NAME */}
            <div className="review-form-field">
              <label htmlFor="review-name">YOUR NAME</label>

              <input
                id="review-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                maxLength={80}
                required
              />
            </div>

            {/* ROLE */}
            <div className="review-form-field">
              <label htmlFor="review-role">
                ROLE / COMPANY (OPTIONAL)
              </label>

              <input
                id="review-role"
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Founder, Company"
                maxLength={120}
              />
            </div>

            {/* RATING */}
            <div className="review-form-field">
              <label>YOUR RATING</label>

              <div
                className="review-rating"
                aria-label={`Rating: ${rating} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "selected" : ""}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    aria-pressed={rating === star}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* REVIEW MESSAGE */}
            <div className="review-form-field">
              <label htmlFor="review-message">
                YOUR EXPERIENCE
              </label>

              <textarea
                id="review-message"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="Tell me about your experience..."
                rows={6}
                maxLength={1500}
                required
              />

              <span className="review-character-count">
                {review.length} / 1500
              </span>
            </div>

            {/* ERROR */}
            {error && (
              <p className="review-form-error" role="alert">
                {error}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="review-submit-button"
              disabled={
                submitting ||
                projectsLoading ||
                projects.length === 0 ||
                !selectedProject
              }
            >
              {submitting ? "SUBMITTING..." : "SUBMIT YOUR REVIEW"}
              <span>↗</span>
            </button>

            <p className="review-form-note">
              Your review will be checked before appearing publicly
              on the portfolio.
            </p>
          </form>
        )}

        <Link to="/" className="review-back-link">
          ← BACK TO PORTFOLIO
        </Link>
      </section>
    </main>
  );
}
