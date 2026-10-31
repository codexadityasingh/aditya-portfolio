
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const BUCKET = "personal-projects";
const MIN_GALLERY_SLOTS = 5;

const createEmptyGallerySlots = () =>
  Array(MIN_GALLERY_SLOTS).fill(null);

const emptyForm = {
  title: "",
  category: "",
  description: "",
  overview: "",
  role: "",
  technologies: "",
  status: "BUILDING",
  live_url: "",
  github_url: "",
  featured: false,
  published: false,
  sort_order: 0,
};

const createSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getStoragePath = (url) => {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState(
    createEmptyGallerySlots
  );

  // LOAD PROJECTS
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("personal_projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // FORM HELPERS
  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setCoverFile(null);
    setGalleryFiles(createEmptyGallerySlots());
    setEditingId(null);

    const coverInput = document.getElementById("personal-cover");
    const galleryInputs = document.querySelectorAll(
      ".personal-gallery-input"
    );

    if (coverInput) coverInput.value = "";

    galleryInputs.forEach((input) => {
      input.value = "";
    });
  };

  // IMAGE UPLOAD
  const uploadImage = async (file, slug, folder) => {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `${slug}/${folder}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  };

  // CREATE / UPDATE PROJECT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const title = form.title.trim();
    const slug = createSlug(title);

    if (title.length < 2) {
      setError("Project title must contain at least 2 characters.");
      return;
    }

    if (!slug) {
      setError("Please enter a valid project title.");
      return;
    }

    if (!form.category.trim() || !form.description.trim()) {
      setError("Please fill in the project category and description.");
      return;
    }

    if (!editingId && !coverFile) {
      setError("Please upload a cover image for this project.");
      return;
    }

    if (
      (coverFile && !coverFile.type.startsWith("image/")) ||
      galleryFiles.some(
        (file) => file && !file.type.startsWith("image/")
      )
    ) {
      setError("Please select image files only.");
      return;
    }

    setSaving(true);

    try {
      const existingProject = projects.find(
        (project) => project.id === editingId
      );

      if (
        existingProject &&
        existingProject.slug !== slug &&
        projects.some((project) => project.slug === slug)
      ) {
        throw new Error("Another project already uses this URL slug.");
      }

      if (
        !existingProject &&
        projects.some((project) => project.slug === slug)
      ) {
        throw new Error("A project with this title already exists.");
      }

      let coverImageUrl =
        existingProject?.cover_image_url || null;

      let galleryImages = Array.isArray(
        existingProject?.gallery_images
      )
        ? existingProject.gallery_images
        : [];

      if (coverFile) {
        coverImageUrl = await uploadImage(
          coverFile,
          slug,
          "cover"
        );
      }

      const selectedGalleryFiles = galleryFiles.filter(Boolean);

      if (selectedGalleryFiles.length > 0) {
        const uploadedGallery = await Promise.all(
          selectedGalleryFiles.map((file) =>
            uploadImage(file, slug, "gallery")
          )
        );

        galleryImages = [
          ...galleryImages,
          ...uploadedGallery,
        ];
      }

      const projectData = {
        title,
        slug,
        category: form.category.trim(),
        description: form.description.trim(),
        overview: form.overview.trim(),
        role: form.role.trim(),
        technologies: form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: form.status,
        cover_image_url: coverImageUrl,
        gallery_images: galleryImages,
        live_url: form.live_url.trim() || null,
        github_url: form.github_url.trim() || null,
        featured: form.featured,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("personal_projects")
          .update(projectData)
          .eq("id", editingId);
      } else {
        result = await supabase
          .from("personal_projects")
          .insert(projectData);
      }

      if (result.error) throw result.error;

      setMessage(
        editingId
          ? `${title} has been updated successfully.`
          : `${title} has been created successfully.`
      );

      resetForm();
      await loadProjects();
    } catch (submitError) {
      setError(submitError.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // EDIT PROJECT
  const editProject = (project) => {
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      category: project.category || "",
      description: project.description || "",
      overview: project.overview || "",
      role: project.role || "",
      technologies: (project.technologies || []).join(", "),
      status: project.status || "BUILDING",
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      featured: Boolean(project.featured),
      published: Boolean(project.published),
      sort_order: project.sort_order || 0,
    });

    setCoverFile(null);
    setGalleryFiles(createEmptyGallerySlots());

    document.getElementById("personal-project-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // DELETE PROJECT
  const deleteProject = async (project) => {
    if (!window.confirm(`Permanently delete "${project.title}"?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const urls = [
        project.cover_image_url,
        ...(Array.isArray(project.gallery_images)
          ? project.gallery_images
          : []),
      ];

      const paths = urls.map(getStoragePath).filter(Boolean);

      const { error: deleteError } = await supabase
        .from("personal_projects")
        .delete()
        .eq("id", project.id);

      if (deleteError) throw deleteError;

      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove(paths);

        if (storageError) {
          setError(
            `Project deleted, but some stored images could not be removed: ${storageError.message}`
          );
        }
      }

      setMessage(`${project.title} has been deleted.`);

      if (editingId === project.id) resetForm();

      await loadProjects();
    } catch (deleteError) {
      setError(
        deleteError.message || "Unable to delete this project."
      );
    }
  };

  return (
    <main className="admin-reviews-page admin-personal-projects">
      <section className="admin-reviews-container">
        <header className="admin-reviews-header">
          <div>
            <span className="review-eyebrow">
              ADI / PRIVATE DASHBOARD
            </span>

            <h1>
              PERSONAL <span>PROJECTS.</span>
            </h1>

            <p>
              Create and manage the projects displayed on your portfolio.
            </p>
          </div>
        </header>

        {error && (
          <p className="review-form-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="admin-project-success" role="status">
            ✓ {message}
          </p>
        )}

        {/* PROJECT EDITOR */}
        <section
          className="admin-personal-form-section"
          id="personal-project-form"
        >
          <div className="admin-project-heading">
            <div>
              <span className="admin-section-index">
                01 / PROJECT EDITOR
              </span>

              <h2>
                {editingId ? "EDIT PROJECT" : "CREATE PROJECT"}
                <span>.</span>
              </h2>

              <p>
                Add the details, visuals and links for your project.
              </p>
            </div>

            <span className="admin-project-total">
              <strong>
                {projects.length.toString().padStart(2, "0")}
              </strong>
              <span>TOTAL PROJECTS</span>
            </span>
          </div>

          <form
            className="admin-personal-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-personal-form-grid">
              <div className="admin-personal-field">
                <label htmlFor="personal-title">
                  PROJECT TITLE *
                </label>

                <input
                  id="personal-title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g. Level Up"
                  maxLength={100}
                  required
                />
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-category">
                  CATEGORY *
                </label>

                <input
                  id="personal-category"
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  placeholder="e.g. WEB APPLICATION"
                  required
                />
              </div>

              <div className="admin-personal-field admin-personal-wide">
                <label htmlFor="personal-description">
                  SHORT DESCRIPTION *
                </label>

                <textarea
                  id="personal-description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows="3"
                  placeholder="A short introduction shown on your project cards."
                  required
                />
              </div>

              <div className="admin-personal-field admin-personal-wide">
                <label htmlFor="personal-overview">
                  PROJECT OVERVIEW
                </label>

                <textarea
                  id="personal-overview"
                  name="overview"
                  value={form.overview}
                  onChange={updateField}
                  rows="4"
                  placeholder="Explain the idea, purpose and what you built."
                />
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-role">YOUR ROLE</label>

                <input
                  id="personal-role"
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  placeholder="e.g. Full Stack Development"
                />
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-status">
                  PROJECT STATUS
                </label>

                <select
                  id="personal-status"
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option value="CONCEPT">CONCEPT</option>
                  <option value="BUILDING">BUILDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="EXPLORING">EXPLORING</option>
                  <option value="ON HOLD">ON HOLD</option>
                </select>
              </div>

              <div className="admin-personal-field admin-personal-wide">
                <label htmlFor="personal-technologies">
                  TECHNOLOGIES
                </label>

                <input
                  id="personal-technologies"
                  name="technologies"
                  value={form.technologies}
                  onChange={updateField}
                  placeholder="React, Supabase, GSAP, CSS"
                />

                <small>Separate each technology with a comma.</small>
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-live-url">
                  LIVE WEBSITE URL
                </label>

                <input
                  id="personal-live-url"
                  name="live_url"
                  type="url"
                  value={form.live_url}
                  onChange={updateField}
                  placeholder="https://example.com"
                />
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-github-url">
                  GITHUB URL
                </label>

                <input
                  id="personal-github-url"
                  name="github_url"
                  type="url"
                  value={form.github_url}
                  onChange={updateField}
                  placeholder="https://github.com/..."
                />
              </div>

              {/* COVER IMAGE */}
              <div className="admin-personal-field">
                <label htmlFor="personal-cover">
                  COVER IMAGE *
                </label>

                <input
                  id="personal-cover"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setCoverFile(event.target.files?.[0] || null)
                  }
                />

                <small>
                  {editingId
                    ? "Choose a new image only if you want to replace the current cover."
                    : "A cover image is required."}
                </small>
              </div>

              {/* GALLERY IMAGES */}
              <div className="admin-personal-field admin-personal-wide admin-gallery-upload-field">
                <div className="admin-gallery-upload-heading">
                  <div>
                    <label>PROJECT GALLERY IMAGES</label>
                    <small>
                      Add screenshots one by one. Start with five slots
                      and add as many more as this project needs.
                    </small>
                  </div>

                  <span>
                    {galleryFiles.filter(Boolean).length} NEW IMAGE
                    {galleryFiles.filter(Boolean).length === 1 ? "" : "S"}
                  </span>
                </div>

                {editingId && (
                  <div className="admin-existing-gallery">
                    <span className="admin-existing-gallery-label">
                      CURRENT GALLERY ·{" "}
                      {projects.find((item) => item.id === editingId)
                        ?.gallery_images?.length || 0}{" "}
                      IMAGES
                    </span>

                    <div className="admin-existing-gallery-grid">
                      {(
                        projects.find((item) => item.id === editingId)
                          ?.gallery_images || []
                      ).map((url, index) => (
                        <div
                          className="admin-existing-gallery-item"
                          key={`${url}-${index}`}
                        >
                          <img
                            src={url}
                            alt={`Existing project image ${index + 1}`}
                          />

                          <span>
                            IMAGE {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <small>
                      Existing images are kept. New uploads will be
                      added after them.
                    </small>
                  </div>
                )}

                <div className="admin-gallery-slots">
                  {galleryFiles.map((file, index) => (
                    <div className="admin-gallery-slot" key={index}>
                      <label htmlFor={`personal-gallery-${index}`}>
                        <span className="admin-gallery-slot-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="admin-gallery-slot-copy">
                          <strong>
                            {file
                              ? file.name
                              : `ADD GALLERY IMAGE ${String(index + 1).padStart(2, "0")}`}
                          </strong>

                          <small>
                            {file
                              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · READY TO UPLOAD`
                              : "Choose one image for this slot"}
                          </small>
                        </span>

                        <span className="admin-gallery-slot-action">
                          {file ? "CHANGE" : "BROWSE ↗"}
                        </span>
                      </label>

                      <input
                        className="personal-gallery-input"
                        id={`personal-gallery-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const selectedFile =
                            event.target.files?.[0] || null;

                          setGalleryFiles((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? selectedFile : item
                            )
                          );
                        }}
                      />

                      {file && (
                        <button
                          type="button"
                          className="admin-gallery-remove"
                          onClick={() => {
                            setGalleryFiles((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? null : item
                              )
                            );

                            const input = document.getElementById(
                              `personal-gallery-${index}`
                            );

                            if (input) input.value = "";
                          }}
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="admin-gallery-add-slot"
                  onClick={() =>
                    setGalleryFiles((current) => [...current, null])
                  }
                >
                  <span>＋</span> ADD ANOTHER IMAGE SLOT
                </button>
              </div>

              <div className="admin-personal-field">
                <label htmlFor="personal-sort-order">
                  DISPLAY ORDER
                </label>

                <input
                  id="personal-sort-order"
                  name="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={updateField}
                />
              </div>
            </div>

            <div className="admin-personal-options">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={updateField}
                />
                FEATURE THIS PROJECT
              </label>

              <label>
                <input
                  type="checkbox"
                  name="published"
                  checked={form.published}
                  onChange={updateField}
                />
                PUBLISH ON PORTFOLIO
              </label>
            </div>

            <div className="admin-personal-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "SAVING..."
                  : editingId
                    ? "SAVE CHANGES ↗"
                    : "CREATE PROJECT ↗"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  CANCEL EDITING
                </button>
              )}
            </div>
          </form>
        </section>

        {/* PROJECT DIRECTORY */}
        <section className="admin-personal-directory">
          <div className="admin-project-list-heading">
            <div>
              <span className="admin-section-index">
                02 / DIRECTORY
              </span>

              <h3>YOUR PERSONAL PROJECTS</h3>
            </div>

            <button
              type="button"
              onClick={loadProjects}
              disabled={loading}
            >
              {loading ? "LOADING..." : "REFRESH ↻"}
            </button>
          </div>

          {loading ? (
            <p className="admin-empty">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="admin-empty">
              No personal projects added yet.
            </p>
          ) : (
            <div className="admin-personal-project-list">
              {projects.map((project) => (
                <article
                  className="admin-personal-project-card"
                  key={project.id}
                >
                  {project.cover_image_url && (
                    <img
                      src={project.cover_image_url}
                      alt={`${project.title} cover`}
                    />
                  )}

                  <div className="admin-personal-project-info">
                    <span>{project.category}</span>
                    <h3>{project.title}</h3>
                    <p>/{project.slug}</p>

                    <div className="admin-personal-project-badges">
                      <span>
                        {project.published ? "PUBLISHED" : "DRAFT"}
                      </span>

                      {project.featured && <span>FEATURED</span>}

                      <span>{project.status}</span>

                      <span>
                        {project.gallery_images?.length || 0} GALLERY IMAGES
                      </span>
                    </div>
                  </div>

                  <div className="admin-personal-project-actions">
                    <button
                      type="button"
                      onClick={() => editProject(project)}
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      className="admin-project-delete"
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
      </section>
    </main>
  );
}
