
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Phone,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
  saveSiteContent,
} from "../lib/siteContent";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

const clone = (value) => JSON.parse(JSON.stringify(value));

const DEFAULT_PHONE = {
  enabled: false,
  label: "PHONE",
  number: "",
  description: "Feel free to call me.",
};

export default function AdminContact() {
  const navigate = useNavigate();

  const [content, setContent] = useState(() => ({
    ...clone(DEFAULT_SITE_CONTENT.contact),
    phone: clone(DEFAULT_PHONE),
  }));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      const { data, error: authError } =
        await supabase.auth.getSession();

      if (
        authError ||
        !data.session ||
        data.session.user.id !== ADMIN_UID
      ) {
        navigate("/admin", { replace: true });
        return;
      }

      try {
        const saved = await getSiteContent("contact");

        if (mounted && saved) {
          setContent({
            ...clone(DEFAULT_SITE_CONTENT.contact),
            ...saved,

            hero: {
              ...DEFAULT_SITE_CONTENT.contact.hero,
              ...saved.hero,
            },

            channels:
              saved.channels ??
              clone(DEFAULT_SITE_CONTENT.contact.channels),

            phone: {
              ...DEFAULT_PHONE,
              ...saved.phone,
            },

            signoff: {
              ...DEFAULT_SITE_CONTENT.contact.signoff,
              ...saved.signoff,
            },

            ending: {
              ...DEFAULT_SITE_CONTENT.contact.ending,
              ...saved.ending,
            },
          });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const update = (section, key, value) => {
    setContent((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [key]: value,
      },
    }));
  };

  const updateChannel = (index, key, value) => {
    setContent((previous) => ({
      ...previous,
      channels: previous.channels.map((channel, i) =>
        i === index ? { ...channel, [key]: value } : channel
      ),
    }));
  };

  const addChannel = () => {
    setContent((previous) => ({
      ...previous,
      channels: [
        ...previous.channels,
        {
          number: String(previous.channels.length + 1).padStart(2, "0"),
          name: "NEW CHANNEL",
          description: "Contact description",
          value: "",
          url: "",
          enabled: true,
        },
      ],
    }));
  };

  const deleteChannel = (index) => {
    setContent((previous) => ({
      ...previous,
      channels: previous.channels.filter((_, i) => i !== index),
    }));
  };

  const moveChannel = (index, direction) => {
    setContent((previous) => {
      const channels = [...previous.channels];
      const target = index + direction;

      if (target < 0 || target >= channels.length) {
        return previous;
      }

      [channels[index], channels[target]] = [
        channels[target],
        channels[index],
      ];

      return { ...previous, channels };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await saveSiteContent("contact", content);
      setMessage("CONTACT PAGE SAVED SUCCESSFULLY.");
    } catch (err) {
      setError(err.message || "Unable to save contact content.");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, value, onChange, placeholder = "", type = "text") => (
    <label className="contact-admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );

  const area = (label, value, onChange) => (
    <label className="contact-admin-field contact-admin-full">
      <span>{label}</span>
      <textarea
        rows={4}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );

  if (loading) {
    return (
      <div className="contact-admin-loading">
        <Loader2 size={24} />
        <span>LOADING CONTACT CONTENT</span>
      </div>
    );
  }

  return (
    <div className="contact-admin">
      <style>{`
        .contact-admin {
          width: 100%;
          color: #eee;
        }

        .contact-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 35px;
        }

        .contact-admin-eyebrow {
          color: #c8b48e;
          font-size: 10px;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .contact-admin-header h1 {
          font-size: clamp(27px, 4vw, 40px);
          font-weight: 500;
          letter-spacing: -1.5px;
          margin: 0;
        }

        .contact-admin-header p {
          color: #888;
          font-size: 13px;
          line-height: 1.7;
          margin-top: 10px;
        }

        .contact-admin-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 45px;
          padding: 0 20px;
          border: 1px solid #d4c19c;
          background: #d4c19c;
          color: #111;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .contact-admin-save:disabled {
          opacity: .5;
          cursor: wait;
        }

        .contact-admin-section {
          margin-bottom: 25px;
          padding: 25px;
          background: #101010;
          border: 1px solid rgba(255,255,255,.09);
        }

        .contact-admin-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 25px;
          padding-bottom: 17px;
          border-bottom: 1px solid rgba(255,255,255,.09);
        }

        .contact-admin-section-heading h2 {
          margin: 0;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.5px;
        }

        .contact-admin-section-heading span {
          color: #888;
          font-size: 10px;
        }

        .contact-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .contact-admin-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .contact-admin-field span {
          color: #999;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .contact-admin-field input,
        .contact-admin-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          background: #141414;
          border: 1px solid #303030;
          border-radius: 0;
          outline: none;
          color: #eee;
          font: inherit;
          font-size: 13px;
        }

        .contact-admin-field textarea {
          resize: vertical;
          line-height: 1.7;
        }

        .contact-admin-field input:focus,
        .contact-admin-field textarea:focus {
          border-color: #bba77f;
        }

        .contact-admin-full {
          grid-column: 1 / -1;
        }

        .contact-admin-channel {
          padding: 22px;
          margin-bottom: 15px;
          border: 1px solid rgba(255,255,255,.1);
          background: #0d0d0d;
        }

        .contact-admin-channel-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .contact-admin-channel-top strong {
          color: #c8b48e;
          font-size: 10px;
          letter-spacing: 1.5px;
        }

        .contact-admin-actions {
          display: flex;
          gap: 6px;
        }

        .contact-admin-icon-button {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          background: transparent;
          color: #aaa;
          border: 1px solid #303030;
          cursor: pointer;
        }

        .contact-admin-icon-button:hover {
          color: white;
          border-color: #777;
        }

        .contact-admin-icon-button:disabled {
          opacity: .3;
          cursor: not-allowed;
        }

        .contact-admin-delete:hover {
          color: #e99a9a;
          border-color: #a55;
        }

        .contact-admin-add {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          background: transparent;
          color: #ddd;
          border: 1px solid #444;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .contact-admin-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          color: #c8b48e;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .contact-admin-toggle input {
          accent-color: #c8b48e;
        }

        .contact-admin-phone-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
          padding: 17px;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.07);
          color: #999;
          font-size: 12px;
        }

        .contact-admin-phone-preview svg {
          color: #c8b48e;
        }

        .contact-admin-message {
          margin-bottom: 20px;
          padding: 13px 15px;
          font-size: 11px;
          letter-spacing: .5px;
        }

        .contact-admin-success {
          color: #a8c6a1;
          border: 1px solid rgba(130,180,120,.3);
          background: rgba(100,150,90,.08);
        }

        .contact-admin-error {
          color: #e5a0a0;
          border: 1px solid rgba(200,80,80,.3);
          background: rgba(150,40,40,.08);
        }

        .contact-admin-loading {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #c8b48e;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .contact-admin-loading svg {
          animation: contactAdminSpin 1s linear infinite;
        }

        @keyframes contactAdminSpin {
          to { transform: rotate(360deg); }
        }

        @media(max-width: 650px) {
          .contact-admin-header {
            flex-direction: column;
          }

          .contact-admin-grid {
            grid-template-columns: 1fr;
          }

          .contact-admin-section {
            padding: 18px;
          }

          .contact-admin-full {
            grid-column: auto;
          }
        }
      `}</style>

      <header className="contact-admin-header">
        <div>
          <div className="contact-admin-eyebrow">
            WEBSITE CONTENT / CONTACT
          </div>
          <h1>Contact Editor</h1>
          <p>
            Manage your contact page, communication channels and closing message.
          </p>
        </div>

        <button
          className="contact-admin-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={15} /> : <Save size={15} />}
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </header>

      {message && (
        <div className="contact-admin-message contact-admin-success">
          {message}
        </div>
      )}

      {error && (
        <div className="contact-admin-message contact-admin-error">
          {error}
        </div>
      )}

      {/* 01 HERO */}
      <section className="contact-admin-section">
        <div className="contact-admin-section-heading">
          <h2>01 / HERO SECTION</h2>
          <span>CONTACT INTRODUCTION</span>
        </div>

        <div className="contact-admin-grid">
          {field("EYEBROW", content.hero?.eyebrow,
            (v) => update("hero", "eyebrow", v))}

          {field("TITLE", content.hero?.title,
            (v) => update("hero", "title", v))}

          {field("EMPHASIS", content.hero?.emphasis,
            (v) => update("hero", "emphasis", v))}

          {area("DESCRIPTION", content.hero?.description,
            (v) => update("hero", "description", v))}
        </div>
      </section>

      {/* 02 PHONE NUMBER */}
      <section className="contact-admin-section">
        <div className="contact-admin-section-heading">
          <div>
            <h2>02 / PHONE NUMBER</h2>
            <span>PERSONAL OR BUSINESS CONTACT</span>
          </div>
          <Phone size={19} color="#c8b48e" />
        </div>

        <div className="contact-admin-grid">
          {field(
            "DISPLAY LABEL",
            content.phone?.label,
            (v) => update("phone", "label", v),
            "PHONE / WHATSAPP / CALL ME"
          )}

          {field(
            "PHONE NUMBER",
            content.phone?.number,
            (v) => update("phone", "number", v),
            "+91 98765 43210",
            "tel"
          )}

          {area(
            "DESCRIPTION",
            content.phone?.description,
            (v) => update("phone", "description", v)
          )}
        </div>

        <label className="contact-admin-toggle">
          <input
            type="checkbox"
            checked={content.phone?.enabled === true}
            onChange={(e) =>
              update("phone", "enabled", e.target.checked)
            }
          />
          DISPLAY PHONE NUMBER ON PUBLIC WEBSITE
        </label>

        <div className="contact-admin-phone-preview">
          <Phone size={17} />
          <div>
            <strong style={{ color: "#ddd" }}>
              {content.phone?.label || "PHONE"}
            </strong>
            <div style={{ marginTop: 5 }}>
              {content.phone?.number || "Your phone number will appear here"}
            </div>
          </div>
        </div>
      </section>

      {/* 03 CONTACT CHANNELS */}
      <section className="contact-admin-section">
        <div className="contact-admin-section-heading">
          <div>
            <h2>03 / CONTACT CHANNELS</h2>
            <span>{content.channels.length} CHANNELS</span>
          </div>

          <button
            className="contact-admin-add"
            onClick={addChannel}
          >
            <Plus size={14} /> ADD CHANNEL
          </button>
        </div>

        {content.channels.map((channel, index) => (
          <div className="contact-admin-channel" key={index}>
            <div className="contact-admin-channel-top">
              <strong>
                CHANNEL {String(index + 1).padStart(2, "0")}
              </strong>

              <div className="contact-admin-actions">
                <button
                  className="contact-admin-icon-button"
                  onClick={() => moveChannel(index, -1)}
                  disabled={index === 0}
                  aria-label="Move channel up"
                >
                  <ArrowUp size={15} />
                </button>

                <button
                  className="contact-admin-icon-button"
                  onClick={() => moveChannel(index, 1)}
                  disabled={index === content.channels.length - 1}
                  aria-label="Move channel down"
                >
                  <ArrowDown size={15} />
                </button>

                <button
                  className="contact-admin-icon-button contact-admin-delete"
                  onClick={() => deleteChannel(index)}
                  aria-label="Delete channel"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="contact-admin-grid">
              {field("CHANNEL NAME", channel.name,
                (v) => updateChannel(index, "name", v))}

              {field("DISPLAY VALUE", channel.value,
                (v) => updateChannel(index, "value", v))}

              {field("DESCRIPTION", channel.description,
                (v) => updateChannel(index, "description", v))}

              {field("DESTINATION URL", channel.url,
                (v) => updateChannel(index, "url", v),
                "https://... or mailto:...")}
            </div>

            <label className="contact-admin-toggle">
              <input
                type="checkbox"
                checked={channel.enabled !== false}
                onChange={(e) =>
                  updateChannel(index, "enabled", e.target.checked)
                }
              />
              SHOW THIS CHANNEL ON THE WEBSITE
            </label>
          </div>
        ))}
      </section>

      {/* 04 SIGNOFF */}
      <section className="contact-admin-section">
        <div className="contact-admin-section-heading">
          <h2>04 / SIGN-OFF</h2>
          <span>PERSONAL MESSAGE</span>
        </div>

        <div className="contact-admin-grid">
          {field("SIGN-OFF TITLE", content.signoff?.title,
            (v) => update("signoff", "title", v))}

          {field("SIGN-OFF EMPHASIS", content.signoff?.emphasis,
            (v) => update("signoff", "emphasis", v))}

          {area("SIGN-OFF DESCRIPTION", content.signoff?.description,
            (v) => update("signoff", "description", v))}
        </div>
      </section>

      {/* 05 ENDING */}
      <section className="contact-admin-section">
        <div className="contact-admin-section-heading">
          <h2>05 / FINAL SECTION</h2>
          <span>PAGE CLOSING CTA</span>
        </div>

        <div className="contact-admin-grid">
          {field("EYEBROW", content.ending?.eyebrow,
            (v) => update("ending", "eyebrow", v))}

          {field("BUTTON TEXT", content.ending?.button,
            (v) => update("ending", "button", v))}

          {field("BUTTON LINK", content.ending?.buttonLink,
            (v) => update("ending", "buttonLink", v))}

          {area("ENDING TITLE", content.ending?.title,
            (v) => update("ending", "title", v))}

          {field("ENDING EMPHASIS", content.ending?.emphasis,
            (v) => update("ending", "emphasis", v))}
        </div>
      </section>

      <button
        className="contact-admin-save"
        onClick={handleSave}
        disabled={saving}
      >
        <Save size={15} />
        {saving ? "SAVING..." : "SAVE CONTACT PAGE"}
      </button>
    </div>
  );
}
