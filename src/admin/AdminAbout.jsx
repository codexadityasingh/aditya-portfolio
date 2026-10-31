
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
  saveSiteContent,
} from "../lib/siteContent";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  UserRound,
  FileText,
  ListChecks,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

export default function AdminAbout() {
  const [content, setContent] = useState(
    DEFAULT_SITE_CONTENT.about
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContent() {
      setLoading(true);
      setError("");

      try {
        const { data, error: authError } =
          await supabase.auth.getSession();

        if (
          authError ||
          !data.session ||
          data.session.user.id !== ADMIN_UID
        ) {
          throw new Error("Admin access could not be verified.");
        }

        const savedContent = await getSiteContent("about");

        if (active) {
          setContent({
            ...DEFAULT_SITE_CONTENT.about,
            ...savedContent,
            hero: {
              ...DEFAULT_SITE_CONTENT.about.hero,
              ...savedContent.hero,
            },
            introduction: {
              ...DEFAULT_SITE_CONTENT.about.introduction,
              ...savedContent.introduction,
            },
            ending: {
              ...DEFAULT_SITE_CONTENT.about.ending,
              ...savedContent.ending,
            },
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load About content.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, []);

  const updateField = (section, field, value) => {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
    setSuccess("");
  };

  const updateParagraph = (index, value) => {
    setContent((current) => {
      const paragraphs = [...current.introduction.paragraphs];
      paragraphs[index] = value;

      return {
        ...current,
        introduction: {
          ...current.introduction,
          paragraphs,
        },
      };
    });
    setSuccess("");
  };

  const addParagraph = () => {
    updateField("introduction", "paragraphs", [
      ...content.introduction.paragraphs,
      "",
    ]);
  };

  const removeParagraph = (index) => {
    updateField(
      "introduction",
      "paragraphs",
      content.introduction.paragraphs.filter(
        (_, i) => i !== index
      )
    );
  };

  const updatePrinciple = (index, field, value) => {
    setContent((current) => {
      const principles = [...current.principles];

      principles[index] = {
        ...principles[index],
        [field]: value,
      };

      return { ...current, principles };
    });
    setSuccess("");
  };

  const addPrinciple = () => {
    setContent((current) => ({
      ...current,
      principles: [
        ...current.principles,
        {
          number: String(current.principles.length + 1).padStart(2, "0"),
          title: "NEW PRINCIPLE.",
          description: "Describe your principle here.",
        },
      ],
    }));
    setSuccess("");
  };

  const removePrinciple = (index) => {
    setContent((current) => ({
      ...current,
      principles: current.principles
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })),
    }));
    setSuccess("");
  };

  const movePrinciple = (index, direction) => {
    setContent((current) => {
      const principles = [...current.principles];
      const target = index + direction;

      if (target < 0 || target >= principles.length) {
        return current;
      }

      [principles[index], principles[target]] = [
        principles[target],
        principles[index],
      ];

      return {
        ...current,
        principles: principles.map((item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })),
      };
    });
    setSuccess("");
  };

  const updateInterest = (index, value) => {
    setContent((current) => {
      const interests = [...current.interests];
      interests[index] = value;

      return { ...current, interests };
    });
    setSuccess("");
  };

  const addInterest = () => {
    setContent((current) => ({
      ...current,
      interests: [...current.interests, "NEW INTEREST"],
    }));
    setSuccess("");
  };

  const removeInterest = (index) => {
    setContent((current) => ({
      ...current,
      interests: current.interests.filter(
        (_, i) => i !== index
      ),
    }));
    setSuccess("");
  };

  const moveInterest = (index, direction) => {
    setContent((current) => {
      const interests = [...current.interests];
      const target = index + direction;

      if (target < 0 || target >= interests.length) {
        return current;
      }

      [interests[index], interests[target]] = [
        interests[target],
        interests[index],
      ];

      return { ...current, interests };
    });
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: authError } =
        await supabase.auth.getSession();

      if (
        authError ||
        !data.session ||
        data.session.user.id !== ADMIN_UID
      ) {
        throw new Error("Admin access could not be verified.");
      }

      await saveSiteContent("about", content);

      setSuccess("About page changes saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save About content.");
    } finally {
      setSaving(false);
    }
  };

  const resetContent = () => {
    const confirmed = window.confirm(
      "Reset the About editor to its original default content? Save afterwards to overwrite the saved version."
    );

    if (!confirmed) return;

    setContent(
      JSON.parse(
        JSON.stringify(DEFAULT_SITE_CONTENT.about)
      )
    );

    setSuccess("Defaults restored locally. Save to publish them.");
    setError("");
  };

  if (loading) {
    return (
      <div className="about-admin-loading">
        <Loader2 size={25} />
        <span>LOADING ABOUT CONTENT</span>
        <style>{`
          .about-admin-loading {
            min-height: 50vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            color: #aaa;
            font-size: 10px;
            letter-spacing: 2px;
          }
          .about-admin-loading svg {
            animation: aboutAdminSpin 1s linear infinite;
          }
          @keyframes aboutAdminSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#eee",
    outline: "none",
    font: "inherit",
    fontSize: "12px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    color: "#999",
    fontSize: 9,
    letterSpacing: 1.5,
  };

  const cardStyle = {
    padding: 20,
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.09)",
    marginBottom: 12,
  };

  const field = (label, value, onChange, multiline = false) => (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={labelStyle}>{label}</span>

      {multiline ? (
        <textarea
          style={{
            ...inputStyle,
            minHeight: 105,
            resize: "vertical",
            lineHeight: 1.7,
          }}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          style={inputStyle}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );

  const sectionHeading = (Icon, number, title, description) => (
    <div className="about-admin-section-heading">
      <div className="about-admin-heading-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{number} / CONTENT SECTION</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );

  return (
    <section className="about-admin">
      <style>{`
        .about-admin {
          width: 100%;
          color: #f1f0ec;
        }

        .about-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 35px;
        }

        .about-admin-eyebrow {
          color: #b7a17d;
          font-size: 9px;
          letter-spacing: 2px;
          margin-bottom: 14px;
        }

        .about-admin-header h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 400;
          letter-spacing: -2px;
        }

        .about-admin-header h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .about-admin-header p {
          color: #888;
          font-size: 12px;
          line-height: 1.7;
          margin-top: 12px;
        }

        .about-admin-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .about-admin-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid rgba(255,255,255,0.15);
          background: #171717;
          color: #ddd;
          font: inherit;
          font-size: 9px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .about-admin-button:hover {
          border-color: rgba(255,255,255,0.4);
          background: #222;
        }

        .about-admin-button.primary {
          color: #111;
          background: #d6c39b;
          border-color: #d6c39b;
        }

        .about-admin-button.primary:hover {
          background: #e5d4af;
        }

        .about-admin-button:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .about-admin-section {
          margin-bottom: 34px;
          padding: 25px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.015);
        }

        .about-admin-section-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .about-admin-heading-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          color: #c9b38d;
          background: rgba(190,160,110,0.08);
        }

        .about-admin-section-heading span {
          color: #a99570;
          font-size: 8px;
          letter-spacing: 1.5px;
        }

        .about-admin-section-heading h2 {
          margin: 6px 0;
          font-size: 17px;
          font-weight: 500;
        }

        .about-admin-section-heading p {
          margin: 0;
          color: #777;
          font-size: 11px;
          line-height: 1.6;
        }

        .about-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 16px;
        }

        .about-admin-item {
          padding: 17px;
          margin-bottom: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #101010;
        }

        .about-admin-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
        }

        .about-admin-item-top strong {
          color: #c9b38d;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .about-admin-icon-button {
          width: 30px;
          height: 30px;
          display: inline-grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #999;
          cursor: pointer;
        }

        .about-admin-icon-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.35);
        }

        .about-admin-icon-button:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .about-admin-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .about-admin-interest {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #101010;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .about-admin-interest input {
          flex: 1;
          min-width: 0;
          padding: 9px;
          background: transparent;
          border: 0;
          color: #eee;
          outline: none;
          font: inherit;
          font-size: 11px;
        }

        .about-admin-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          margin-bottom: 20px;
          font-size: 11px;
          line-height: 1.5;
        }

        .about-admin-alert.error {
          color: #e6a0a0;
          background: rgba(150,40,40,0.1);
          border: 1px solid rgba(200,80,80,0.2);
        }

        .about-admin-alert.success {
          color: #a6c9a5;
          background: rgba(70,130,70,0.1);
          border: 1px solid rgba(100,170,100,0.2);
        }

        .about-admin-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 20px 0;
        }

        .about-admin-bottom p {
          color: #777;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 700px) {
          .about-admin-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .about-admin-grid {
            grid-template-columns: 1fr;
          }

          .about-admin-section {
            padding: 17px;
          }

          .about-admin-bottom {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="about-admin-header">
        <div>
          <div className="about-admin-eyebrow">
            WEBSITE CONTENT / ABOUT
          </div>

          <h1>
            ABOUT <em>EDITOR.</em>
          </h1>

          <p>
            Manage your introduction, principles, interests and
            the content visitors see on your About page.
          </p>
        </div>

        <div className="about-admin-actions">
          <button
            className="about-admin-button"
            onClick={resetContent}
            type="button"
          >
            <RotateCcw size={14} />
            RESET
          </button>

          <button
            className="about-admin-button primary"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? (
              <Loader2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </header>

      {error && (
        <div className="about-admin-alert error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="about-admin-alert success" role="status">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {/* HERO */}
      <section className="about-admin-section">
        {sectionHeading(
          UserRound,
          "01",
          "Page introduction",
          "Edit the main heading and introductory content."
        )}

        {field("EYEBROW", content.hero.eyebrow,
          (v) => updateField("hero", "eyebrow", v))}

        <div className="about-admin-grid">
          {field("MAIN HEADING", content.hero.title,
            (v) => updateField("hero", "title", v))}

          {field("ITALIC / EMPHASISED HEADING", content.hero.emphasis,
            (v) => updateField("hero", "emphasis", v))}
        </div>

        {field("INTRODUCTION", content.hero.description,
          (v) => updateField("hero", "description", v), true)}

        <div className="about-admin-grid">
          {field("NAME / SIGNATURE", content.hero.name,
            (v) => updateField("hero", "name", v))}

          {field("SUBTITLE", content.hero.subtitle,
            (v) => updateField("hero", "subtitle", v))}
        </div>
      </section>

      {/* BIO */}
      <section className="about-admin-section">
        {sectionHeading(
          FileText,
          "02",
          "Personal introduction",
          "Manage your biography and the paragraphs visitors read."
        )}

        {field("INTRODUCTION LABEL", content.introduction.eyebrow,
          (v) => updateField("introduction", "eyebrow", v))}

        {field("SECTION HEADING", content.introduction.heading,
          (v) => updateField("introduction", "heading", v))}

        {content.introduction.paragraphs.map((paragraph, index) => (
          <div className="about-admin-item" key={index}>
            <div className="about-admin-item-top">
              <strong>PARAGRAPH {String(index + 1).padStart(2, "0")}</strong>

              <button
                type="button"
                className="about-admin-icon-button"
                onClick={() => removeParagraph(index)}
                aria-label="Remove paragraph"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {field(
              "PARAGRAPH CONTENT",
              paragraph,
              (v) => updateParagraph(index, v),
              true
            )}
          </div>
        ))}

        <button
          type="button"
          className="about-admin-button"
          onClick={addParagraph}
        >
          <Plus size={14} />
          ADD PARAGRAPH
        </button>
      </section>

      {/* PRINCIPLES */}
      <section className="about-admin-section">
        {sectionHeading(
          ListChecks,
          "03",
          "Your principles",
          "Edit existing principles or add and remove new ones."
        )}

        {content.principles.map((principle, index) => (
          <div className="about-admin-item" key={index}>
            <div className="about-admin-item-top">
              <strong>PRINCIPLE {String(index + 1).padStart(2, "0")}</strong>

              <div style={{ display: "flex", gap: 5 }}>
                <button
                  type="button"
                  className="about-admin-icon-button"
                  disabled={index === 0}
                  onClick={() => movePrinciple(index, -1)}
                  aria-label="Move principle up"
                >
                  <ChevronUp size={15} />
                </button>

                <button
                  type="button"
                  className="about-admin-icon-button"
                  disabled={index === content.principles.length - 1}
                  onClick={() => movePrinciple(index, 1)}
                  aria-label="Move principle down"
                >
                  <ChevronDown size={15} />
                </button>

                <button
                  type="button"
                  className="about-admin-icon-button"
                  onClick={() => removePrinciple(index)}
                  aria-label="Remove principle"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {field("TITLE", principle.title,
              (v) => updatePrinciple(index, "title", v))}

            {field("DESCRIPTION", principle.description,
              (v) => updatePrinciple(index, "description", v), true)}
          </div>
        ))}

        <button
          type="button"
          className="about-admin-button"
          onClick={addPrinciple}
        >
          <Plus size={14} />
          ADD PRINCIPLE
        </button>
      </section>

      {/* INTERESTS */}
      <section className="about-admin-section">
        {sectionHeading(
          Sparkles,
          "04",
          "Interests and skills",
          "These appear in the interests grid on your About page."
        )}

        <div className="about-admin-list">
          {content.interests.map((interest, index) => (
            <div className="about-admin-interest" key={index}>
              <span style={{
                color: "#a99570",
                fontSize: 10,
                width: 25,
              }}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <input
                value={interest}
                onChange={(event) =>
                  updateInterest(index, event.target.value)
                }
                aria-label={`Interest ${index + 1}`}
              />

              <button
                type="button"
                className="about-admin-icon-button"
                disabled={index === 0}
                onClick={() => moveInterest(index, -1)}
                aria-label="Move interest up"
              >
                <ChevronUp size={14} />
              </button>

              <button
                type="button"
                className="about-admin-icon-button"
                disabled={index === content.interests.length - 1}
                onClick={() => moveInterest(index, 1)}
                aria-label="Move interest down"
              >
                <ChevronDown size={14} />
              </button>

              <button
                type="button"
                className="about-admin-icon-button"
                onClick={() => removeInterest(index)}
                aria-label="Remove interest"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="about-admin-button"
          style={{ marginTop: 15 }}
          onClick={addInterest}
        >
          <Plus size={14} />
          ADD INTEREST
        </button>
      </section>

      {/* ENDING */}
      <section className="about-admin-section">
        {sectionHeading(
          Sparkles,
          "05",
          "Closing section",
          "Edit the final message and the button visitors see."
        )}

        {field("EYEBROW", content.ending.eyebrow,
          (v) => updateField("ending", "eyebrow", v))}

        <div className="about-admin-grid">
          {field("MAIN HEADING", content.ending.title,
            (v) => updateField("ending", "title", v))}

          {field("EMPHASISED HEADING", content.ending.emphasis,
            (v) => updateField("ending", "emphasis", v))}
        </div>

        <div className="about-admin-grid">
          {field("BUTTON LABEL", content.ending.button,
            (v) => updateField("ending", "button", v))}

          {field("BUTTON DESTINATION", content.ending.buttonLink,
            (v) => updateField("ending", "buttonLink", v))}
        </div>
      </section>

      {/* SAVE FOOTER */}
      <div className="about-admin-bottom">
        <p>
          Changes are stored in Supabase. Your public About page
          will display them after we connect its content loader.
        </p>

        <button
          className="about-admin-button primary"
          onClick={handleSave}
          disabled={saving}
          type="button"
        >
          {saving ? <Loader2 size={14} /> : <Save size={14} />}
          {saving ? "SAVING..." : "SAVE ABOUT PAGE"}
        </button>
      </div>
    </section>
  );
}
