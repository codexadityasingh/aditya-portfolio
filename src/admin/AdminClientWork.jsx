
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Star,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";

const BUCKET = "client-work";

const emptyForm = {
  title: "",
  category: "WEB DEVELOPMENT",
  project_type: "CREATIVE COLLABORATION",
  description: "",
  image_alt: "",
  status: "LIVE",
  live_url: "",
  featured: false,
  published: false,
  sort_order: 0,

  feature_label: "",
  feature_title: "",
  feature_description: "",

  project_name: "",
  project_type_label: "",
  role: "",
  live_label: "",

  overview_title: "",
  overview_paragraphs: "",

  contributions: "",
  ai_label: "A HUMAN-LED, AI-ASSISTED WORKFLOW",
  ai_heading: "",
  ai_paragraphs: "",
  ai_tag: "",

  process: "",
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

const linesToArray = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const parseNumberedLines = (value, type) => {
  return linesToArray(value).map((line, index) => {
    const parts = line.split("|").map((part) => part.trim());

    if (type === "contribution") {
      return {
        number: String(index + 1).padStart(2, "0"),
        title: parts[0] || "",
        description: parts.slice(1).join(" | ") || "",
      };
    }

    return [
      String(index + 1).padStart(2, "0"),
      parts[0] || "",
      parts.slice(1).join(" | ") || "",
    ];
  });
};

const formatContributions = (items = []) =>
  items
    .map((item) => `${item.title || ""} | ${item.description || ""}`)
    .join("\n");

const formatProcess = (items = []) =>
  items
    .map((item) =>
      Array.isArray(item)
        ? `${item[1] || ""} | ${item[2] || ""}`
        : `${item.title || ""} | ${item.description || ""}`
    )
    .join("\n");

export default function AdminClientWork() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("client_work_projects")
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

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setCoverFile(null);
    setGalleryFiles([]);
    setExistingGallery([]);

    const coverInput = document.getElementById("client-work-cover");
    if (coverInput) coverInput.value = "";
  };

  const handleGalleryFiles = (event) => {
    const selected = Array.from(event.target.files || []);

    setGalleryFiles((current) => [...current, ...selected]);

    event.target.value = "";
  };

  const removeGalleryFile = (index) => {
    setGalleryFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const title = form.title.trim();
    const slug = createSlug(title);

    if (title.length < 2 || !slug) {
      setError("Please enter a valid project title.");
      return;
    }

    if (!form.category.trim() || !form.description.trim()) {
      setError("Project category and description are required.");
      return;
    }

    const existingProject = projects.find(
      (project) => project.id === editingId
    );

    if (!existingProject && !coverFile) {
      setError("Please upload a cover image.");
      return;
    }

    if (
      (coverFile && !coverFile.type.startsWith("image/")) ||
      galleryFiles.some((file) => !file.type.startsWith("image/"))
    ) {
      setError("Please select image files only.");
      return;
    }

    if (
      projects.some(
        (project) => project.slug === slug && project.id !== editingId
      )
    ) {
      setError("Another project already uses this URL slug.");
      return;
    }

    setSaving(true);

    try {
      let coverImageUrl =
        existingProject?.cover_image_url || null;

      if (coverFile) {
        coverImageUrl = await uploadImage(
          coverFile,
          slug,
          "cover"
        );
      }

      const uploadedGallery = await Promise.all(
        galleryFiles.map((file) =>
          uploadImage(file, slug, "gallery")
        )
      );

      const galleryImages = [
        ...existingGallery,
        ...uploadedGallery.map((url, index) => ({
          number: String(existingGallery.length + index + 1).padStart(2, "0"),
          title: "PROJECT SCREENSHOT",
          description: "A closer look at this project.",
          image: url,
          alt: `${title} screenshot`,
          wide: false,
        })),
      ].map((item, index) => ({
        ...item,
        number: String(index + 1).padStart(2, "0"),
      }));

      const projectData = {
        title,
        slug,
        category: form.category.trim(),
        project_type: form.project_type.trim(),
        description: form.description.trim(),
        cover_image_url: coverImageUrl,
        image_alt: form.image_alt.trim() || `${title} cover`,
        status: form.status,
        live_url: form.live_url.trim() || null,
        featured: form.featured,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,

        feature_label: form.feature_label.trim(),
        feature_title: form.feature_title.trim(),
        feature_description: form.feature_description.trim(),

        project_name: form.project_name.trim() || title,
        project_type_label: form.project_type_label.trim(),
        role: form.role.trim(),
        live_label: form.live_label.trim(),

        overview_title: form.overview_title.trim(),
        overview_paragraphs: linesToArray(form.overview_paragraphs),

        gallery_images: galleryImages,

        contributions: parseNumberedLines(
          form.contributions,
          "contribution"
        ),

        ai_label: form.ai_label.trim(),
        ai_heading: form.ai_heading.trim(),
        ai_paragraphs: linesToArray(form.ai_paragraphs),
        ai_tag: form.ai_tag.trim(),

        process: parseNumberedLines(form.process, "process"),

        updated_at: new Date().toISOString(),
      };

      const result = editingId
        ? await supabase
            .from("client_work_projects")
            .update(projectData)
            .eq("id", editingId)
        : await supabase
            .from("client_work_projects")
            .insert(projectData);

      if (result.error) throw result.error;

      setMessage(
        editingId
          ? `${title} has been updated.`
          : `${title} has been added to Client Work.`
      );

      resetForm();
      await loadProjects();
    } catch (submitError) {
      setError(submitError.message || "Unable to save this project.");
    } finally {
      setSaving(false);
    }
  };

  const editProject = (project) => {
    setEditingId(project.id);

    setForm({
      ...emptyForm,
      ...project,

      title: project.title || "",
      category: project.category || "",
      project_type: project.project_type || "",
      description: project.description || "",
      image_alt: project.image_alt || "",
      status: project.status || "LIVE",
      live_url: project.live_url || "",
      featured: Boolean(project.featured),
      published: Boolean(project.published),
      sort_order: project.sort_order || 0,

      feature_label: project.feature_label || "",
      feature_title: project.feature_title || "",
      feature_description: project.feature_description || "",

      project_name: project.project_name || "",
      project_type_label: project.project_type_label || "",
      role: project.role || "",
      live_label: project.live_label || "",

      overview_title: project.overview_title || "",
      overview_paragraphs: (project.overview_paragraphs || []).join("\n"),

      contributions: formatContributions(project.contributions || []),

      ai_label: project.ai_label || "",
      ai_heading: project.ai_heading || "",
      ai_paragraphs: (project.ai_paragraphs || []).join("\n"),
      ai_tag: project.ai_tag || "",

      process: formatProcess(project.process || []),
    });

    setExistingGallery(project.gallery_images || []);
    setCoverFile(null);
    setGalleryFiles([]);

    document.getElementById("client-work-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const deleteProject = async (project) => {
    if (
      !window.confirm(
        `Permanently delete "${project.title}" and its uploaded images?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(project.id);

    try {
      const urls = [
        project.cover_image_url,
        ...(project.gallery_images || []).map((item) => item.image),
      ];

      const paths = urls.map(getStoragePath).filter(Boolean);

      const { error: deleteError } = await supabase
        .from("client_work_projects")
        .delete()
        .eq("id", project.id);

      if (deleteError) throw deleteError;

      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove(paths);

        if (storageError) {
          setError(
            `Project deleted, but some images could not be removed: ${storageError.message}`
          );
        }
      }

      if (editingId === project.id) resetForm();

      setMessage(`${project.title} has been deleted.`);
      await loadProjects();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this project.");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish = async (project) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("client_work_projects")
      .update({
        published: !project.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(
        `${project.title} is now ${project.published ? "a draft" : "published"}.`
      );
      await loadProjects();
    }
  };

  const toggleFeatured = async (project) => {
    setError("");

    const { error: updateError } = await supabase
      .from("client_work_projects")
      .update({
        featured: !project.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadProjects();
    }
  };

  const field = (label, name, placeholder = "", type = "text") => (
    <div className="cw-field" key={name}>
      <label htmlFor={`cw-${name}`}>{label}</label>
      <input
        id={`cw-${name}`}
        name={name}
        type={type}
        value={form[name] ?? ""}
        onChange={updateField}
        placeholder={placeholder}
      />
    </div>
  );

  const area = (label, name, placeholder, rows = 4) => (
    <div className="cw-field cw-wide" key={name}>
      <label htmlFor={`cw-${name}`}>{label}</label>
      <textarea
        id={`cw-${name}`}
        name={name}
        value={form[name] ?? ""}
        onChange={updateField}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );

  return (
    <main className="cw-admin">
      <style>{`
        .cw-admin {
          color: #f1eee8;
          width: 100%;
        }

        .cw-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 32px;
        }

        .cw-eyebrow {
          color: #c9b38d;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .cw-admin h1 {
          margin: 12px 0;
          font-size: clamp(30px, 5vw, 48px);
          letter-spacing: -2px;
          font-weight: 500;
        }

        .cw-admin h1 span,
        .cw-admin h2 span {
          color: #c9b38d;
          font-family: Georgia, serif;
          font-style: italic;
        }

        .cw-admin-header p {
          color: #89857d;
          font-size: 12px;
          line-height: 1.7;
        }

        .cw-count {
          border: 1px solid rgba(255,255,255,.12);
          padding: 13px 17px;
          color: #8d8981;
          font-size: 9px;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .cw-count strong {
          display: block;
          color: #c9b38d;
          font-size: 25px;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .cw-panel {
          padding: 25px;
          margin-bottom: 28px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.018);
        }

        .cw-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .cw-panel-heading h2 {
          margin: 8px 0 0;
          font-size: 21px;
          font-weight: 500;
          letter-spacing: -.5px;
        }

        .cw-section-index {
          color: #89857d;
          font-size: 9px;
          letter-spacing: 1.6px;
        }

        .cw-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 19px;
        }

        .cw-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .cw-wide {
          grid-column: 1 / -1;
        }

        .cw-field label {
          color: #bcb7ad;
          font-size: 9px;
          letter-spacing: 1.3px;
        }

        .cw-field input,
        .cw-field textarea,
        .cw-field select {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 0;
          outline: none;
          background: #111110;
          color: #f1eee8;
          font: inherit;
          font-size: 12px;
        }

        .cw-field textarea {
          resize: vertical;
          line-height: 1.7;
        }

        .cw-field input:focus,
        .cw-field textarea:focus,
        .cw-field select:focus {
          border-color: rgba(201,179,141,.65);
        }

        .cw-field input::placeholder,
        .cw-field textarea::placeholder {
          color: #65615a;
        }

        .cw-hint {
          color: #77736c;
          font-size: 10px;
          line-height: 1.6;
        }

        .cw-divider {
          grid-column: 1 / -1;
          border: 0;
          border-top: 1px solid rgba(255,255,255,.09);
          margin: 10px 0 2px;
        }

        .cw-subheading {
          grid-column: 1 / -1;
          margin: 4px 0 -5px;
          color: #c9b38d;
          font-size: 10px;
          letter-spacing: 1.7px;
        }

        .cw-upload {
          padding: 16px;
          border: 1px dashed rgba(255,255,255,.2);
          background: rgba(255,255,255,.025);
        }

        .cw-upload input {
          color: #aaa;
          font-size: 11px;
        }

        .cw-cover-preview {
          width: 100%;
          max-height: 220px;
          object-fit: cover;
          margin-top: 12px;
        }

        .cw-gallery-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .cw-gallery-item {
          position: relative;
          border: 1px solid rgba(255,255,255,.12);
          background: #111;
          min-width: 0;
        }

        .cw-gallery-item img {
          display: block;
          width: 100%;
          height: 105px;
          object-fit: cover;
        }

        .cw-gallery-item p {
          padding: 8px;
          margin: 0;
          color: #aaa;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .cw-gallery-remove {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border: 0;
          background: rgba(0,0,0,.8);
          color: white;
          cursor: pointer;
        }

        .cw-add-gallery {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 15px;
          border: 1px solid rgba(255,255,255,.16);
          background: transparent;
          color: #c9b38d;
          font: inherit;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cw-checkboxes {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          gap: 22px;
          padding: 17px 0;
          border-top: 1px solid rgba(255,255,255,.09);
          border-bottom: 1px solid rgba(255,255,255,.09);
        }

        .cw-checkboxes label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #bcb7ad;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cw-checkboxes input {
          accent-color: #c9b38d;
        }

        .cw-actions {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }

        .cw-button {
          min-height: 43px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #c9b38d;
          background: #c9b38d;
          color: #15130f;
          font: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cw-button:disabled {
          opacity: .5;
          cursor: wait;
        }

        .cw-button.secondary {
          border-color: rgba(255,255,255,.2);
          background: transparent;
          color: #ccc;
        }

        .cw-error,
        .cw-success {
          padding: 13px 15px;
          margin-bottom: 17px;
          font-size: 11px;
          line-height: 1.6;
        }

        .cw-error {
          color: #e5a5a0;
          border: 1px solid rgba(220,90,90,.25);
          background: rgba(140,35,35,.12);
        }

        .cw-success {
          color: #b7c9a5;
          border: 1px solid rgba(140,180,120,.2);
          background: rgba(100,140,80,.08);
        }

        .cw-project-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cw-project-card {
          display: grid;
          grid-template-columns: 135px minmax(0, 1fr) auto;
          align-items: center;
          gap: 17px;
          padding: 13px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.018);
        }

        .cw-project-card > img {
          width: 135px;
          height: 95px;
          object-fit: cover;
          background: #181818;
        }

        .cw-project-info {
          min-width: 0;
        }

        .cw-project-info > span {
          color: #c9b38d;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .cw-project-info h3 {
          margin: 7px 0;
          font-size: 17px;
          font-weight: 500;
        }

        .cw-project-info p {
          margin: 0;
          color: #77736c;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .cw-project-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }

        .cw-project-badges span {
          padding: 5px 7px;
          border: 1px solid rgba(255,255,255,.1);
          color: #aaa;
          font-size: 8px;
          letter-spacing: .7px;
        }

        .cw-project-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 7px;
        }

        .cw-icon-button {
          min-width: 36px;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,.13);
          background: transparent;
          color: #aaa;
          font: inherit;
          font-size: 9px;
          cursor: pointer;
        }

        .cw-icon-button:hover {
          color: #c9b38d;
          border-color: #c9b38d;
        }

        .cw-icon-button.danger:hover {
          color: #e5a5a0;
          border-color: #b66c6c;
        }

        .cw-empty {
          padding: 35px 15px;
          border: 1px dashed rgba(255,255,255,.13);
          color: #85817a;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .cw-panel {
            padding: 17px;
          }

          .cw-form-grid {
            grid-template-columns: 1fr;
          }

          .cw-wide,
          .cw-subheading,
          .cw-divider,
          .cw-checkboxes,
          .cw-actions {
            grid-column: 1;
          }

          .cw-project-card {
            grid-template-columns: 90px minmax(0, 1fr);
          }

          .cw-project-card > img {
            width: 90px;
            height: 85px;
          }

          .cw-project-actions {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }

          .cw-admin-header {
            align-items: flex-start;
          }
        }
      `}</style>

      <header className="cw-admin-header">
        <div>
          <span className="cw-eyebrow">ADI / PRIVATE WORKSPACE</span>
          <h1>CLIENT <span>WORK.</span></h1>
          <p>Build, manage and publish your client collaborations.</p>
        </div>

        <div className="cw-count">
          <strong>{String(projects.length).padStart(2, "0")}</strong>
          TOTAL PROJECTS
        </div>
      </header>

      {error && <div className="cw-error" role="alert">{error}</div>}
      {message && <div className="cw-success" role="status">{message}</div>}

      {/* PROJECT EDITOR */}
      <section className="cw-panel" id="client-work-editor">
        <div className="cw-panel-heading">
          <div>
            <span className="cw-section-index">01 / PROJECT EDITOR</span>
            <h2>{editingId ? "EDIT PROJECT" : "CREATE PROJECT"}<span>.</span></h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cw-form-grid">
          <h3 className="cw-subheading">PROJECT INFORMATION</h3>

          {field("PROJECT NAME *", "title", "e.g. Bone Jam")}
          {field("CATEGORY *", "category", "WEB DEVELOPMENT")}
          {field("PROJECT TYPE", "project_type", "CREATIVE COLLABORATION")}
          {field("LIVE WEBSITE URL", "live_url", "https://example.com", "url")}

          {area("SHORT DESCRIPTION *", "description", "A short introduction to the collaboration.", 3)}
          {field("COVER IMAGE ALT TEXT", "image_alt", "Describe the cover image")}

          <div className="cw-field cw-wide">
            <label htmlFor="client-work-cover">COVER IMAGE {editingId ? "(OPTIONAL REPLACEMENT)" : "*"}</label>
            <div className="cw-upload">
              <input
                id="client-work-cover"
                type="file"
                accept="image/*"
                onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
              />
              <p className="cw-hint">
                {coverFile
                  ? `Selected: ${coverFile.name}`
                  : editingId
                    ? "Leave empty to keep the current cover."
                    : "Upload the main image shown on the Client Work archive."}
              </p>
              {coverFile && (
                <img
                  className="cw-cover-preview"
                  src={URL.createObjectURL(coverFile)}
                  alt="Selected cover preview"
                />
              )}
            </div>
          </div>

          <hr className="cw-divider" />
          <h3 className="cw-subheading">FEATURED CASE STUDY</h3>

          {field("FEATURE LABEL", "feature_label", "CUSTOM CREATIVE PROJECTS")}
          {field("FEATURE TITLE", "feature_title", "BONE JAM")}
          {area("FEATURE DESCRIPTION", "feature_description", "Description shown in the case-study hero.", 3)}

          {field("PROJECT NAME LABEL", "project_name", "Client or project name")}
          {field("PROJECT TYPE LABEL", "project_type_label", "Website / Creative Collaboration")}
          {field("MY ROLE", "role", "Development / Implementation")}
          {field("LIVE LABEL", "live_label", "example.com")}

          <hr className="cw-divider" />
          <h3 className="cw-subheading">PROJECT OVERVIEW</h3>

          {field("OVERVIEW HEADING", "overview_title", "ONE IDEA. SHARED EFFORT.")}
          {area(
            "OVERVIEW PARAGRAPHS",
            "overview_paragraphs",
            "Write one paragraph per line. Each line becomes a separate paragraph.",
            5
          )}

          <hr className="cw-divider" />
          <h3 className="cw-subheading">PROJECT GALLERY</h3>

          <div className="cw-field cw-wide">
            <label>EXISTING GALLERY IMAGES</label>

            {existingGallery.length === 0 ? (
              <p className="cw-hint">No gallery images added yet.</p>
            ) : (
              <div className="cw-gallery-list">
                {existingGallery.map((item, index) => (
                  <div className="cw-gallery-item" key={`${item.image}-${index}`}>
                    <img src={item.image} alt={item.alt || "Project screenshot"} />
                    <p>{item.title || `IMAGE ${index + 1}`}</p>
                    <button
                      type="button"
                      className="cw-gallery-remove"
                      aria-label="Remove gallery image"
                      onClick={() =>
                        setExistingGallery((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cw-field cw-wide">
            <label htmlFor="client-gallery-files">ADD NEW GALLERY IMAGES</label>
            <div className="cw-upload">
              <input
                id="client-gallery-files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFiles}
              />
              <p className="cw-hint">
                Select multiple screenshots. Existing images are kept unless you remove them above.
              </p>
            </div>

            {galleryFiles.length > 0 && (
              <div className="cw-gallery-list">
                {galleryFiles.map((file, index) => (
                  <div className="cw-gallery-item" key={`${file.name}-${index}`}>
                    <p>{file.name}</p>
                    <button
                      type="button"
                      className="cw-gallery-remove"
                      onClick={() => removeGalleryFile(index)}
                      aria-label="Remove selected image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="cw-divider" />
          <h3 className="cw-subheading">MY CONTRIBUTIONS</h3>

          {area(
            "CONTRIBUTIONS",
            "contributions",
            "One item per line. Format: TITLE | Description\nDEVELOPMENT | Built and implemented the website.\nCODE REFINEMENT | Debugging and refinement.",
            6
          )}

          <hr className="cw-divider" />
          <h3 className="cw-subheading">AI WORKFLOW / DEVELOPMENT APPROACH</h3>

          {field("SECTION LABEL", "ai_label", "A HUMAN-LED, AI-ASSISTED WORKFLOW")}
          {field("SECTION HEADING", "ai_heading", "BUILT WITH NEW TOOLS.")}
          {area(
            "AI WORKFLOW PARAGRAPHS",
            "ai_paragraphs",
            "One paragraph per line.",
            5
          )}
          {field("TOOLS TAG", "ai_tag", "ANTIGRAVITY / AI-ASSISTED DEVELOPMENT")}

          <hr className="cw-divider" />
          <h3 className="cw-subheading">PROJECT PROCESS</h3>

          {area(
            "PROCESS STAGES",
            "process",
            "One stage per line. Format: TITLE | Description\nCONCEPT | Original idea and creative direction.\nLAYOUT | Structuring the website experience.",
            6
          )}

          <hr className="cw-divider" />
          <h3 className="cw-subheading">PUBLISHING SETTINGS</h3>

          <div className="cw-field">
            <label htmlFor="cw-status">PROJECT STATUS</label>
            <select
              id="cw-status"
              name="status"
              value={form.status}
              onChange={updateField}
            >
              <option value="LIVE">LIVE</option>
              <option value="BUILDING">BUILDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON HOLD">ON HOLD</option>
            </select>
          </div>

          <div className="cw-field">
            <label htmlFor="cw-order">DISPLAY ORDER</label>
            <input
              id="cw-order"
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={updateField}
            />
          </div>

          <div className="cw-checkboxes">
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
              PUBLISH ON WEBSITE
            </label>
          </div>

          <div className="cw-actions">
            <button className="cw-button" type="submit" disabled={saving}>
              {saving ? "SAVING PROJECT..." : editingId ? "SAVE CHANGES ↗" : "CREATE PROJECT ↗"}
            </button>

            {editingId && (
              <button
                className="cw-button secondary"
                type="button"
                onClick={resetForm}
              >
                CANCEL EDITING
              </button>
            )}
          </div>
        </form>
      </section>

      {/* PROJECT DIRECTORY */}
      <section className="cw-panel">
        <div className="cw-panel-heading">
          <div>
            <span className="cw-section-index">02 / DIRECTORY</span>
            <h2>YOUR CLIENT PROJECTS<span>.</span></h2>
          </div>

          <button
            className="cw-icon-button"
            type="button"
            onClick={loadProjects}
            disabled={loading}
          >
            <RefreshCw size={14} />
            REFRESH
          </button>
        </div>

        {loading ? (
          <div className="cw-empty">Loading client projects...</div>
        ) : projects.length === 0 ? (
          <div className="cw-empty">
            No client projects yet. Create your first project above.
          </div>
        ) : (
          <div className="cw-project-list">
            {projects.map((project) => (
              <article className="cw-project-card" key={project.id}>
                <img
                  src={project.cover_image_url || ""}
                  alt={project.image_alt || project.title}
                />

                <div className="cw-project-info">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>/{project.slug}</p>

                  <div className="cw-project-badges">
                    <span>{project.published ? "PUBLISHED" : "DRAFT"}</span>
                    {project.featured && <span>FEATURED</span>}
                    <span>{project.status}</span>
                    <span>{project.gallery_images?.length || 0} IMAGES</span>
                  </div>
                </div>

                <div className="cw-project-actions">
                  <button
                    className="cw-icon-button"
                    type="button"
                    onClick={() => editProject(project)}
                    title="Edit project"
                  >
                    <Pencil size={14} />
                    EDIT
                  </button>

                  <button
                    className="cw-icon-button"
                    type="button"
                    onClick={() => toggleFeatured(project)}
                    title="Toggle featured"
                  >
                    <Star
                      size={14}
                      fill={project.featured ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    className="cw-icon-button"
                    type="button"
                    onClick={() => togglePublish(project)}
                    title="Toggle publishing"
                  >
                    {project.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>

                  <button
                    className="cw-icon-button danger"
                    type="button"
                    disabled={deletingId === project.id}
                    onClick={() => deleteProject(project)}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
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
