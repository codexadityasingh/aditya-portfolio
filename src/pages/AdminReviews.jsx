
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

const getProjectName = (slug) =>
  (slug || "unknown-project")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const createSlug = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminReviews() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [projectMessage, setProjectMessage] = useState("");

  const [projectName, setProjectName] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [projectActionSlug, setProjectActionSlug] = useState(null);

  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = session?.user?.id === ADMIN_UID;

  // LOAD REVIEWS
  const loadReviews = useCallback(async () => {
    if (!session || session.user.id !== ADMIN_UID) return;

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("client_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  }, [session]);

  // LOAD PROJECTS
  const loadProjects = useCallback(async () => {
    if (!session || session.user.id !== ADMIN_UID) return;

    setProjectsLoading(true);

    const { data, error: fetchError } = await supabase
      .from("client_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProjects(data || []);
    }

    setProjectsLoading(false);
  }, [session]);

  // AUTHENTICATION
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id === ADMIN_UID) {
      loadReviews();
      loadProjects();
    } else {
      setReviews([]);
      setProjects([]);
    }
  }, [session, loadReviews, loadProjects]);

  // PROJECT SLUG PREVIEW
  const slugPreview = useMemo(
    () => createSlug(projectName),
    [projectName]
  );

  // ADD PROJECT
  const addProject = async (event) => {
    event.preventDefault();

    setError("");
    setProjectMessage("");

    const cleanName = projectName.trim();
    const slug = createSlug(cleanName);

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("Project name must be between 2 and 80 characters.");
      return;
    }

    if (!slug) {
      setError("Please enter a valid project name.");
      return;
    }

    setAddingProject(true);

    const { error: insertError } = await supabase
      .from("client_projects")
      .insert({
        name: cleanName,
        slug,
        active: true,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("A project with this name or slug already exists.");
      } else {
        setError(insertError.message);
      }
    } else {
      setProjectName("");
      setProjectMessage(`${cleanName} has been added successfully.`);
      await loadProjects();
    }

    setAddingProject(false);
  };

  // ACTIVATE / DEACTIVATE PROJECT
  const toggleProject = async (project) => {
    setError("");
    setProjectMessage("");
    setProjectActionSlug(project.slug);

    const { error: updateError } = await supabase
      .from("client_projects")
      .update({ active: !project.active })
      .eq("slug", project.slug);

    if (updateError) {
      setError(updateError.message);
    } else {
      setProjectMessage(
        `${project.name} is now ${project.active ? "inactive" : "active"}.`
      );
      await loadProjects();
    }

    setProjectActionSlug(null);
  };

  // DELETE PROJECT
  const deleteProject = async (project) => {
    const hasReviews = reviews.some(
      (review) => review.project_slug === project.slug
    );

    if (hasReviews) {
      setError(
        "This project has reviews. Deactivate it instead to preserve its review history."
      );
      return;
    }

    if (!window.confirm(`Permanently delete ${project.name}?`)) return;

    setError("");
    setProjectMessage("");
    setProjectActionSlug(project.slug);

    const { error: deleteError } = await supabase
      .from("client_projects")
      .delete()
      .eq("slug", project.slug);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setProjectMessage(`${project.name} has been deleted.`);
      await loadProjects();
    }

    setProjectActionSlug(null);
  };

  // FILTER REVIEWS
  const filteredReviews = useMemo(() => {
    return reviews.filter((item) => {
      const matchesProject =
        projectFilter === "all" ||
        item.project_slug === projectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesProject && matchesStatus;
    });
  }, [reviews, projectFilter, statusFilter]);

  const statsReviews =
    projectFilter === "all"
      ? reviews
      : reviews.filter((item) => item.project_slug === projectFilter);

  const pending = statsReviews.filter(
    (item) => item.status === "pending"
  ).length;

  const approved = statsReviews.filter(
    (item) => item.status === "approved"
  ).length;

  const rejected = statsReviews.filter(
    (item) => item.status === "rejected"
  ).length;

  // LOGIN
  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (data.user?.id !== ADMIN_UID) {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
    }

    setLoading(false);
  };

  // APPROVE / REJECT
  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError("");

    const { error: updateError } = await supabase
      .from("client_reviews")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadReviews();
    }

    setBusyId(null);
  };

  // DELETE REVIEW
  const deleteReview = async (id) => {
    if (!window.confirm("Permanently delete this review?")) return;

    setBusyId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("client_reviews")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      await loadReviews();
    }

    setBusyId(null);
  };

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setReviews([]);
    setProjects([]);
  };

  // SESSION CHECK
  if (loading && !session) {
    return (
      <main className="admin-reviews-page">
        <section className="admin-login">
          <span className="review-eyebrow">ADI / PRIVATE ACCESS</span>
          <h1>ADMIN<span>.</span></h1>
          <p>Checking your session...</p>
        </section>
      </main>
    );
  }

  // LOGIN PAGE
  if (!session || !isAdmin) {
    return (
      <main className="admin-reviews-page">
        <section className="admin-login">
          <span className="review-eyebrow">ADI / PRIVATE ACCESS</span>
          <h1>ADMIN<span>.</span></h1>
          <p>Sign in to manage client feedback.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">EMAIL</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              required
            />

            <label htmlFor="admin-password">PASSWORD</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />

            {error && <p className="review-form-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "PLEASE WAIT..." : "SIGN IN"} ↗
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-reviews-page">
      <section className="admin-reviews-container">

        {/* DASHBOARD HEADER */}
        <header className="admin-reviews-header">
          <div>
            <span className="review-eyebrow">
              ADI / PRIVATE DASHBOARD
            </span>
            <h1>CLIENT <span>REVIEWS.</span></h1>
            <p>Manage your projects and client feedback.</p>
          </div>

          <button onClick={handleLogout} className="admin-logout">
            LOG OUT ↗
          </button>
        </header>

        {/* PROJECT MANAGEMENT */}
        <section className="admin-project-management">

          <div className="admin-project-heading">
            <div>
              <span className="admin-section-index">01 / WORKSPACE</span>
              <h2>PROJECT MANAGEMENT<span>.</span></h2>
              <p>Manage the projects displayed in your client review form.</p>
            </div>

            <div className="admin-project-total">
              <strong>{projects.length.toString().padStart(2, "0")}</strong>
              <span>TOTAL PROJECTS</span>
            </div>
          </div>

          {/* CREATE PROJECT */}
          <form
            className="admin-add-project-form"
            onSubmit={addProject}
          >
            <div className="admin-add-project-top">
              <span>CREATE NEW PROJECT</span>
              <span className="admin-add-project-number">NEW ENTRY / 001</span>
            </div>

            <div className="admin-add-project-fields">
              <div className="admin-project-input-wrap">
                <label htmlFor="new-project-name">PROJECT NAME</label>

                <input
                  id="new-project-name"
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="e.g. Creative Studio Website"
                  maxLength={80}
                  required
                />

                <small>
                  <span>GENERATED SLUG</span>
                  <strong>/{slugPreview || "your-project-name"}</strong>
                </small>
              </div>

              <button type="submit" disabled={addingProject}>
                <span>{addingProject ? "ADDING..." : "ADD PROJECT"}</span>
                <span>↗</span>
              </button>
            </div>
          </form>

          {projectMessage && (
            <p className="admin-project-success" role="status">
              <span>✓</span> {projectMessage}
            </p>
          )}

          {/* PROJECT LIST */}
          <div className="admin-project-list-heading">
            <div>
              <span className="admin-section-index">02 / DIRECTORY</span>
              <h3>YOUR PROJECTS</h3>
            </div>

            <span>{projects.length} ENTRIES</span>
          </div>

          {projectsLoading ? (
            <p className="admin-empty">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="admin-empty">No projects registered yet.</p>
          ) : (
            <div className="admin-project-list">
              {projects.map((project, index) => (
                <article
                  className="admin-project-card"
                  key={project.slug}
                >
                  <div className="admin-project-card-main">
                    <span className="admin-project-card-index">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>

                    <div className="admin-project-card-info">
                      <h3>{project.name}</h3>
                      <span>/{project.slug}</span>
                    </div>
                  </div>

                  <div className="admin-project-controls">
                    <span
                      className={`admin-project-status ${
                        project.active ? "active" : "inactive"
                      }`}
                    >
                      <i />
                      {project.active ? "ACTIVE" : "INACTIVE"}
                    </span>

                    <button
                      type="button"
                      className="admin-project-toggle"
                      disabled={projectActionSlug === project.slug}
                      onClick={() => toggleProject(project)}
                    >
                      {projectActionSlug === project.slug
                        ? "PLEASE WAIT..."
                        : project.active
                        ? "DEACTIVATE"
                        : "ACTIVATE"}
                    </button>

                    <button
                      type="button"
                      className="admin-project-delete"
                      disabled={projectActionSlug === project.slug}
                      onClick={() => deleteProject(project)}
                    >
                      DELETE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ERRORS */}
        {error && (
          <p className="review-form-error" role="alert">
            {error}
          </p>
        )}

        {/* REVIEW STATISTICS */}
        <div className="admin-review-stats">
          <div>
            <strong>{pending}</strong>
            <span>PENDING</span>
          </div>

          <div>
            <strong>{approved}</strong>
            <span>APPROVED</span>
          </div>

          <div>
            <strong>{rejected}</strong>
            <span>REJECTED</span>
          </div>
        </div>

        {/* REVIEW LIST */}
        <div className="admin-review-list-header">
          <h2>ALL SUBMISSIONS</h2>

          <button
            onClick={() => {
              loadReviews();
              loadProjects();
            }}
            disabled={loading || projectsLoading}
          >
            {loading || projectsLoading ? "LOADING..." : "REFRESH ↻"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="admin-review-filters">
          <div>
            <label htmlFor="admin-project-filter">PROJECT</label>

            <select
              id="admin-project-filter"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
            >
              <option value="all">ALL PROJECTS</option>

              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.name.toUpperCase()}
                </option>
              ))}

              {reviews
                .filter(
                  (review) =>
                    !projects.some(
                      (project) => project.slug === review.project_slug
                    )
                )
                .map((review) => review.project_slug)
                .filter((slug, index, array) => array.indexOf(slug) === index)
                .map((slug) => (
                  <option key={slug} value={slug}>
                    {getProjectName(slug).toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-status-filter">REVIEW STATUS</label>

            <select
              id="admin-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">ALL STATUSES</option>
              <option value="pending">PENDING</option>
              <option value="approved">APPROVED</option>
              <option value="rejected">REJECTED</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="admin-empty">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <p className="admin-empty">
            No reviews match the selected filters.
          </p>
        ) : (
          <div className="admin-review-list">
            {filteredReviews.map((item) => (
              <article className="admin-review-card" key={item.id}>
                <div className="admin-review-card-top">
                  <div>
                    <h3>{item.reviewer_name}</h3>
                    <span>{item.reviewer_role || "Client"}</span>
                  </div>

                  <span className={`admin-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <div className="admin-review-project">
                  <span>PROJECT</span>
                  <strong>
                    {projects.find(
                      (project) => project.slug === item.project_slug
                    )?.name || getProjectName(item.project_slug)}
                  </strong>
                </div>

                <div className="admin-review-stars">
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </div>

                <p>{item.review_text}</p>

                <small>
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </small>

                <div className="admin-review-actions">
                  {item.status !== "approved" && (
                    <button
                      disabled={busyId === item.id}
                      onClick={() => updateStatus(item.id, "approved")}
                    >
                      {busyId === item.id ? "PLEASE WAIT..." : "APPROVE"}
                    </button>
                  )}

                  {item.status !== "rejected" && (
                    <button
                      disabled={busyId === item.id}
                      onClick={() => updateStatus(item.id, "rejected")}
                    >
                      REJECT
                    </button>
                  )}

                  <button
                    disabled={busyId === item.id}
                    onClick={() => deleteReview(item.id)}
                  >
                    DELETE
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
