
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
  BriefcaseBusiness,
  Package,
  Tags,
  Workflow,
  FileText,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

const clone = (value) => JSON.parse(JSON.stringify(value));

function moveItem(items, index, direction) {
  const next = [...items];
  const target = index + direction;

  if (target < 0 || target >= next.length) return items;

  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function AdminServices() {
  const [content, setContent] = useState(
    () => clone(DEFAULT_SITE_CONTENT.explore)
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

        const saved = await getSiteContent("explore");

        if (active) {
          setContent({
            ...clone(DEFAULT_SITE_CONTENT.explore),
            ...saved,
            hero: {
              ...DEFAULT_SITE_CONTENT.explore.hero,
              ...saved.hero,
            },
            custom: {
              ...DEFAULT_SITE_CONTENT.explore.custom,
              ...saved.custom,
            },
            notes: {
              ...DEFAULT_SITE_CONTENT.explore.notes,
              ...saved.notes,
            },
            ending: {
              ...DEFAULT_SITE_CONTENT.explore.ending,
              ...saved.ending,
            },
            services: saved.services ?? clone(DEFAULT_SITE_CONTENT.explore.services),
            addOns: saved.addOns ?? clone(DEFAULT_SITE_CONTENT.explore.addOns),
            process: saved.process ?? clone(DEFAULT_SITE_CONTENT.explore.process),
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load services.");
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

  const updateSection = (section, field, value) => {
    setContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
    setSuccess("");
  };

  const updateArrayItem = (key, index, field, value) => {
    setContent((current) => {
      const items = [...current[key]];
      items[index] = {
        ...items[index],
        [field]: value,
      };

      return { ...current, [key]: items };
    });
    setSuccess("");
  };

  const updateService = (serviceIndex, field, value) => {
    setContent((current) => {
      const services = [...current.services];

      services[serviceIndex] = {
        ...services[serviceIndex],
        [field]: value,
      };

      return { ...current, services };
    });
    setSuccess("");
  };

  const addService = () => {
    setContent((current) => ({
      ...current,
      services: [
        ...current.services,
        {
          id: `service-${Date.now()}`,
          number: String(current.services.length + 1).padStart(2, "0"),
          category: "NEW CATEGORY",
          title: "NEW SERVICE",
          description: "Describe the service you offer.",
          icon: "✳",
          packages: [],
        },
      ],
    }));
    setSuccess("");
  };

  const removeService = (index) => {
    if (!window.confirm("Delete this entire service and all its packages?")) {
      return;
    }

    setContent((current) => ({
      ...current,
      services: current.services
        .filter((_, i) => i !== index)
        .map((service, i) => ({
          ...service,
          number: String(i + 1).padStart(2, "0"),
        })),
    }));
    setSuccess("");
  };

  const reorderServices = (index, direction) => {
    setContent((current) => ({
      ...current,
      services: moveItem(current.services, index, direction).map(
        (service, i) => ({
          ...service,
          number: String(i + 1).padStart(2, "0"),
        })
      ),
    }));
    setSuccess("");
  };

  const addPackage = (serviceIndex) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };

      service.packages = [
        ...service.packages,
        {
          name: "NEW PACKAGE",
          price: "₹0",
          unit: "",
          description: "Describe what this package offers.",
          features: ["New feature"],
          popular: false,
        },
      ];

      services[serviceIndex] = service;
      return { ...current, services };
    });
    setSuccess("");
  };

  const updatePackage = (serviceIndex, packageIndex, field, value) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];

      packages[packageIndex] = {
        ...packages[packageIndex],
        [field]: value,
      };

      service.packages = packages;
      services[serviceIndex] = service;

      return { ...current, services };
    });
    setSuccess("");
  };

  const removePackage = (serviceIndex, packageIndex) => {
    if (!window.confirm("Delete this package?")) return;

    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };

      service.packages = service.packages.filter(
        (_, i) => i !== packageIndex
      );

      services[serviceIndex] = service;
      return { ...current, services };
    });
    setSuccess("");
  };

  const reorderPackages = (serviceIndex, packageIndex, direction) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };

      service.packages = moveItem(
        service.packages,
        packageIndex,
        direction
      );

      services[serviceIndex] = service;
      return { ...current, services };
    });
    setSuccess("");
  };

  const updateFeature = (serviceIndex, packageIndex, featureIndex, value) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];
      const pack = { ...packages[packageIndex] };
      const features = [...pack.features];

      features[featureIndex] = value;
      pack.features = features;
      packages[packageIndex] = pack;
      service.packages = packages;
      services[serviceIndex] = service;

      return { ...current, services };
    });
    setSuccess("");
  };

  const addFeature = (serviceIndex, packageIndex) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];
      const pack = { ...packages[packageIndex] };

      pack.features = [...pack.features, "New feature"];
      packages[packageIndex] = pack;
      service.packages = packages;
      services[serviceIndex] = service;

      return { ...current, services };
    });
    setSuccess("");
  };

  const removeFeature = (serviceIndex, packageIndex, featureIndex) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];
      const pack = { ...packages[packageIndex] };

      pack.features = pack.features.filter(
        (_, i) => i !== featureIndex
      );

      packages[packageIndex] = pack;
      service.packages = packages;
      services[serviceIndex] = service;

      return { ...current, services };
    });
    setSuccess("");
  };

  const addAddon = () => {
    setContent((current) => ({
      ...current,
      addOns: [
        ...current.addOns,
        { name: "NEW ADD-ON", price: "CUSTOM QUOTE" },
      ],
    }));
    setSuccess("");
  };

  const updateAddon = (index, field, value) => {
    setContent((current) => {
      const addOns = [...current.addOns];
      addOns[index] = { ...addOns[index], [field]: value };
      return { ...current, addOns };
    });
    setSuccess("");
  };

  const removeAddon = (index) => {
    setContent((current) => ({
      ...current,
      addOns: current.addOns.filter((_, i) => i !== index),
    }));
    setSuccess("");
  };

  const reorderAddon = (index, direction) => {
    setContent((current) => ({
      ...current,
      addOns: moveItem(current.addOns, index, direction),
    }));
    setSuccess("");
  };

  const addProcess = () => {
    setContent((current) => ({
      ...current,
      process: [
        ...current.process,
        {
          number: String(current.process.length + 1).padStart(2, "0"),
          title: "NEW STEP",
          description: "Describe this step.",
        },
      ],
    }));
    setSuccess("");
  };

  const updateProcess = (index, field, value) => {
    setContent((current) => {
      const process = [...current.process];
      process[index] = { ...process[index], [field]: value };
      return { ...current, process };
    });
    setSuccess("");
  };

  const removeProcess = (index) => {
    setContent((current) => ({
      ...current,
      process: current.process
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })),
    }));
    setSuccess("");
  };

  const reorderProcess = (index, direction) => {
    setContent((current) => ({
      ...current,
      process: moveItem(current.process, index, direction).map(
        (item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })
      ),
    }));
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

      await saveSiteContent("explore", content);
      setSuccess("Services and pricing saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save services.");
    } finally {
      setSaving(false);
    }
  };

  const resetContent = () => {
    if (!window.confirm(
      "Reset all services and pricing to their original defaults? Save afterwards to overwrite the database."
    )) return;

    setContent(clone(DEFAULT_SITE_CONTENT.explore));
    setError("");
    setSuccess("Defaults restored locally. Save to publish them.");
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 13px",
    background: "#111",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#eee",
    outline: "none",
    font: "inherit",
    fontSize: 12,
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    color: "#999",
    fontSize: 9,
    letterSpacing: 1.4,
  };

  const field = (label, value, onChange, multiline = false) => (
    <label className="services-admin-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: 85,
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </label>
  );

  const sectionHeading = (Icon, number, title, description) => (
    <div className="services-admin-section-heading">
      <div className="services-admin-icon">
        <Icon size={18} />
      </div>
      <div>
        <span>{number} / CONTENT SECTION</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );

  const itemActions = (index, length, onMove, onDelete) => (
    <div className="services-admin-actions">
      <button
        type="button"
        className="services-admin-icon-button"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label="Move up"
      >
        <ChevronUp size={15} />
      </button>
      <button
        type="button"
        className="services-admin-icon-button"
        disabled={index === length - 1}
        onClick={() => onMove(1)}
        aria-label="Move down"
      >
        <ChevronDown size={15} />
      </button>
      <button
        type="button"
        className="services-admin-icon-button danger"
        onClick={onDelete}
        aria-label="Delete item"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="services-admin-loading">
        <Loader2 size={25} />
        <span>LOADING SERVICES & PRICING</span>
        <style>{`
          .services-admin-loading {
            min-height: 50vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 15px;
            color: #aaa;
            font-size: 10px;
            letter-spacing: 2px;
          }
          .services-admin-loading svg {
            animation: servicesAdminSpin 1s linear infinite;
          }
          @keyframes servicesAdminSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="services-admin">
      <style>{`
        .services-admin {
          width: 100%;
          color: #f1f0ec;
        }

        .services-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 35px;
        }

        .services-admin-eyebrow {
          margin-bottom: 14px;
          color: #b7a17d;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .services-admin-header h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 400;
          letter-spacing: -2px;
        }

        .services-admin-header h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .services-admin-header p {
          margin-top: 12px;
          color: #888;
          font-size: 12px;
          line-height: 1.7;
        }

        .services-admin-toolbar {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .services-admin-button {
          min-height: 41px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #171717;
          border: 1px solid rgba(255,255,255,0.14);
          color: #ddd;
          font: inherit;
          font-size: 9px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .services-admin-button:hover {
          background: #242424;
          border-color: rgba(255,255,255,0.35);
        }

        .services-admin-button.primary {
          background: #d6c39b;
          border-color: #d6c39b;
          color: #111;
        }

        .services-admin-button.primary:hover {
          background: #e6d4ae;
        }

        .services-admin-button:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .services-admin-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          margin-bottom: 20px;
          font-size: 11px;
          line-height: 1.5;
        }

        .services-admin-alert.error {
          color: #e6a0a0;
          background: rgba(150,40,40,0.1);
          border: 1px solid rgba(200,80,80,0.2);
        }

        .services-admin-alert.success {
          color: #a6c9a5;
          background: rgba(70,130,70,0.1);
          border: 1px solid rgba(100,170,100,0.2);
        }

        .services-admin-section {
          margin-bottom: 30px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.015);
        }

        .services-admin-section-heading {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding-bottom: 20px;
          margin-bottom: 23px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .services-admin-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #c9b38d;
          background: rgba(190,160,110,0.08);
        }

        .services-admin-section-heading span {
          color: #a99570;
          font-size: 8px;
          letter-spacing: 1.5px;
        }

        .services-admin-section-heading h2 {
          margin: 6px 0;
          font-size: 17px;
          font-weight: 500;
        }

        .services-admin-section-heading p {
          margin: 0;
          color: #777;
          font-size: 11px;
          line-height: 1.6;
        }

        .services-admin-field {
          display: block;
          min-width: 0;
          margin-bottom: 16px;
        }

        .services-admin-field > span {
          display: block;
          margin-bottom: 8px;
          color: #999;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .services-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 16px;
        }

        .services-admin-card {
          padding: 20px;
          margin-bottom: 15px;
          background: #101010;
          border: 1px solid rgba(255,255,255,0.09);
        }

        .services-admin-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .services-admin-card-heading strong {
          color: #c9b38d;
          font-size: 10px;
          letter-spacing: 1.3px;
        }

        .services-admin-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .services-admin-icon-button {
          width: 29px;
          height: 29px;
          display: inline-grid;
          place-items: center;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #aaa;
          cursor: pointer;
        }

        .services-admin-icon-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.35);
        }

        .services-admin-icon-button:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .services-admin-icon-button.danger:hover {
          color: #e6a0a0;
          border-color: rgba(200,80,80,0.5);
        }

        .services-admin-subsection {
          margin-top: 22px;
          padding-top: 19px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .services-admin-subsection-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .services-admin-subsection-heading strong {
          color: #999;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .services-admin-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .services-admin-feature input {
          flex: 1;
          min-width: 0;
        }

        .services-admin-check {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #c9b38d;
          font-size: 10px;
          letter-spacing: 0.8px;
          margin: 10px 0 17px;
        }

        .services-admin-check input {
          accent-color: #c9b38d;
        }

        .services-admin-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 0;
        }

        .services-admin-bottom p {
          color: #777;
          font-size: 10px;
          line-height: 1.6;
        }

        @media (max-width: 700px) {
          .services-admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .services-admin-grid {
            grid-template-columns: 1fr;
          }

          .services-admin-section {
            padding: 16px;
          }

          .services-admin-card {
            padding: 15px;
          }

          .services-admin-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="services-admin-header">
        <div>
          <div className="services-admin-eyebrow">
            WEBSITE CONTENT / EXPLORE
          </div>
          <h1>
            SERVICES <em>& PRICING.</em>
          </h1>
          <p>
            Manage your offerings, packages, prices and client
            process from one place.
          </p>
        </div>

        <div className="services-admin-toolbar">
          <button
            type="button"
            className="services-admin-button"
            onClick={resetContent}
          >
            <RotateCcw size={14} />
            RESET
          </button>
          <button
            type="button"
            className="services-admin-button primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} /> : <Save size={14} />}
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </header>

      {error && (
        <div className="services-admin-alert error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {success && (
        <div className="services-admin-alert success" role="status">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {/* PAGE HERO */}
      <section className="services-admin-section">
        {sectionHeading(
          FileText,
          "01",
          "Page introduction",
          "Manage the main Explore page heading and introduction."
        )}

        {field("EYEBROW", content.hero.eyebrow,
          (v) => updateSection("hero", "eyebrow", v))}

        <div className="services-admin-grid">
          {field("MAIN HEADING", content.hero.title,
            (v) => updateSection("hero", "title", v))}
          {field("EMPHASISED HEADING", content.hero.emphasis,
            (v) => updateSection("hero", "emphasis", v))}
        </div>

        {field("DESCRIPTION", content.hero.description,
          (v) => updateSection("hero", "description", v), true)}

        <div className="services-admin-grid">
          {field("AVAILABILITY LABEL", content.hero.availability,
            (v) => updateSection("hero", "availability", v))}
          {field("SUBTITLE", content.hero.subtitle,
            (v) => updateSection("hero", "subtitle", v))}
        </div>
      </section>

      {/* SERVICES AND PACKAGES */}
      <section className="services-admin-section">
        {sectionHeading(
          BriefcaseBusiness,
          "02",
          "Services and packages",
          "Edit each service, its packages, prices and included features."
        )}

        {content.services.map((service, serviceIndex) => (
          <article className="services-admin-card" key={service.id}>
            <div className="services-admin-card-heading">
              <strong>
                SERVICE {String(serviceIndex + 1).padStart(2, "0")}
              </strong>

              {itemActions(
                serviceIndex,
                content.services.length,
                (direction) => reorderServices(serviceIndex, direction),
                () => removeService(serviceIndex)
              )}
            </div>

            <div className="services-admin-grid">
              {field("SERVICE ID / URL PARAMETER", service.id,
                (v) => updateService(serviceIndex, "id", v))}

              {field("SERVICE NUMBER", service.number,
                (v) => updateService(serviceIndex, "number", v))}

              {field("SERVICE TITLE", service.title,
                (v) => updateService(serviceIndex, "title", v))}

              {field("CATEGORY", service.category,
                (v) => updateService(serviceIndex, "category", v))}

              {field("ICON", service.icon,
                (v) => updateService(serviceIndex, "icon", v))}
            </div>

            {field("SERVICE DESCRIPTION", service.description,
              (v) => updateService(serviceIndex, "description", v), true)}

            <div className="services-admin-subsection">
              <div className="services-admin-subsection-heading">
                <strong>
                  <Package
                    size={13}
                    style={{ verticalAlign: "middle", marginRight: 7 }}
                  />
                  PACKAGES ({service.packages.length})
                </strong>

                <button
                  type="button"
                  className="services-admin-button"
                  onClick={() => addPackage(serviceIndex)}
                >
                  <Plus size={13} />
                  ADD PACKAGE
                </button>
              </div>

              {service.packages.map((pack, packageIndex) => (
                <div className="services-admin-card" key={packageIndex}>
                  <div className="services-admin-card-heading">
                    <strong>
                      PACKAGE {String(packageIndex + 1).padStart(2, "0")}
                    </strong>

                    {itemActions(
                      packageIndex,
                      service.packages.length,
                      (direction) =>
                        reorderPackages(serviceIndex, packageIndex, direction),
                      () => removePackage(serviceIndex, packageIndex)
                    )}
                  </div>

                  <div className="services-admin-grid">
                    {field("PACKAGE NAME", pack.name,
                      (v) => updatePackage(serviceIndex, packageIndex, "name", v))}

                    {field("PRICE", pack.price,
                      (v) => updatePackage(serviceIndex, packageIndex, "price", v))}

                    {field("PRICE UNIT (OPTIONAL)", pack.unit,
                      (v) => updatePackage(serviceIndex, packageIndex, "unit", v))}

                    {field("SHORT DESCRIPTION", pack.description,
                      (v) => updatePackage(serviceIndex, packageIndex, "description", v))}
                  </div>

                  <label className="services-admin-check">
                    <input
                      type="checkbox"
                      checked={Boolean(pack.popular)}
                      onChange={(e) =>
                        updatePackage(
                          serviceIndex,
                          packageIndex,
                          "popular",
                          e.target.checked
                        )
                      }
                    />
                    <Star size={13} />
                    MARK AS MOST POPULAR
                  </label>

                  <div className="services-admin-subsection">
                    <div className="services-admin-subsection-heading">
                      <strong>
                        INCLUDED FEATURES ({pack.features.length})
                      </strong>

                      <button
                        type="button"
                        className="services-admin-button"
                        onClick={() => addFeature(serviceIndex, packageIndex)}
                      >
                        <Plus size={13} />
                        ADD FEATURE
                      </button>
                    </div>

                    {pack.features.map((feature, featureIndex) => (
                      <div className="services-admin-feature" key={featureIndex}>
                        <input
                          style={inputStyle}
                          value={feature}
                          onChange={(e) =>
                            updateFeature(
                              serviceIndex,
                              packageIndex,
                              featureIndex,
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          className="services-admin-icon-button danger"
                          onClick={() =>
                            removeFeature(
                              serviceIndex,
                              packageIndex,
                              featureIndex
                            )
                          }
                          aria-label="Remove feature"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}

        <button
          type="button"
          className="services-admin-button"
          onClick={addService}
        >
          <Plus size={14} />
          ADD NEW SERVICE
        </button>
      </section>

      {/* CUSTOM PROJECT */}
      <section className="services-admin-section">
        {sectionHeading(
          FileText,
          "03",
          "Custom project section",
          "Edit the section inviting visitors to discuss custom work."
        )}

        {field("EYEBROW", content.custom.eyebrow,
          (v) => updateSection("custom", "eyebrow", v))}

        <div className="services-admin-grid">
          {field("MAIN HEADING", content.custom.title,
            (v) => updateSection("custom", "title", v))}
          {field("EMPHASISED HEADING", content.custom.emphasis,
            (v) => updateSection("custom", "emphasis", v))}
        </div>

        {content.custom.paragraphs.map((paragraph, index) => (
          <div className="services-admin-card" key={index}>
            <div className="services-admin-card-heading">
              <strong>PARAGRAPH {index + 1}</strong>
              <button
                type="button"
                className="services-admin-icon-button danger"
                onClick={() =>
                  updateSection(
                    "custom",
                    "paragraphs",
                    content.custom.paragraphs.filter((_, i) => i !== index)
                  )
                }
                aria-label="Remove paragraph"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {field("CONTENT", paragraph, (v) => {
              const paragraphs = [...content.custom.paragraphs];
              paragraphs[index] = v;
              updateSection("custom", "paragraphs", paragraphs);
            }, true)}
          </div>
        ))}

        <button
          type="button"
          className="services-admin-button"
          onClick={() =>
            updateSection("custom", "paragraphs", [
              ...content.custom.paragraphs,
              "New paragraph.",
            ])
          }
        >
          <Plus size={13} />
          ADD PARAGRAPH
        </button>

        <div style={{ marginTop: 20 }}>
          {field("BUTTON LABEL", content.custom.button,
            (v) => updateSection("custom", "button", v))}
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="services-admin-section">
        {sectionHeading(
          Tags,
          "04",
          "Optional add-ons",
          "Manage additional services and their starting prices."
        )}

        {content.addOns.map((addon, index) => (
          <div className="services-admin-card" key={index}>
            <div className="services-admin-card-heading">
              <strong>ADD-ON {String(index + 1).padStart(2, "0")}</strong>

              {itemActions(
                index,
                content.addOns.length,
                (direction) => reorderAddon(index, direction),
                () => removeAddon(index)
              )}
            </div>

            <div className="services-admin-grid">
              {field("NAME", addon.name,
                (v) => updateAddon(index, "name", v))}
              {field("PRICE", addon.price,
                (v) => updateAddon(index, "price", v))}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="services-admin-button"
          onClick={addAddon}
        >
          <Plus size={14} />
          ADD ADD-ON
        </button>
      </section>

      {/* PROCESS */}
      <section className="services-admin-section">
        {sectionHeading(
          Workflow,
          "05",
          "Project process",
          "Edit, add, delete and reorder your workflow steps."
        )}

        {content.process.map((step, index) => (
          <div className="services-admin-card" key={index}>
            <div className="services-admin-card-heading">
              <strong>STEP {String(index + 1).padStart(2, "0")}</strong>

              {itemActions(
                index,
                content.process.length,
                (direction) => reorderProcess(index, direction),
                () => removeProcess(index)
              )}
            </div>

            <div className="services-admin-grid">
              {field("STEP NUMBER", step.number,
                (v) => updateProcess(index, "number", v))}
              {field("STEP TITLE", step.title,
                (v) => updateProcess(index, "title", v))}
            </div>

            {field("DESCRIPTION", step.description,
              (v) => updateProcess(index, "description", v), true)}
          </div>
        ))}

        <button
          type="button"
          className="services-admin-button"
          onClick={addProcess}
        >
          <Plus size={14} />
          ADD PROCESS STEP
        </button>
      </section>

      {/* PRICING NOTES */}
      <section className="services-admin-section">
        {sectionHeading(
          FileText,
          "06",
          "Pricing notes",
          "Edit the pricing disclaimer and project expectations."
        )}

        {field("EYEBROW", content.notes.eyebrow,
          (v) => updateSection("notes", "eyebrow", v))}

        <div className="services-admin-grid">
          {field("MAIN HEADING", content.notes.title,
            (v) => updateSection("notes", "title", v))}
          {field("EMPHASISED HEADING", content.notes.emphasis,
            (v) => updateSection("notes", "emphasis", v))}
        </div>

        {content.notes.paragraphs.map((paragraph, index) => (
          <div className="services-admin-card" key={index}>
            <div className="services-admin-card-heading">
              <strong>NOTE {index + 1}</strong>
              <button
                type="button"
                className="services-admin-icon-button danger"
                onClick={() =>
                  updateSection(
                    "notes",
                    "paragraphs",
                    content.notes.paragraphs.filter((_, i) => i !== index)
                  )
                }
                aria-label="Remove note"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {field("CONTENT", paragraph, (v) => {
              const paragraphs = [...content.notes.paragraphs];
              paragraphs[index] = v;
              updateSection("notes", "paragraphs", paragraphs);
            }, true)}
          </div>
        ))}

        <button
          type="button"
          className="services-admin-button"
          onClick={() =>
            updateSection("notes", "paragraphs", [
              ...content.notes.paragraphs,
              "New pricing note.",
            ])
          }
        >
          <Plus size={13} />
          ADD NOTE
        </button>
      </section>

      {/* FINAL CTA */}
      <section className="services-admin-section">
        {sectionHeading(
          FileText,
          "07",
          "Final call to action",
          "Edit the last message and button on the Explore page."
        )}

        {field("EYEBROW", content.ending.eyebrow,
          (v) => updateSection("ending", "eyebrow", v))}

        <div className="services-admin-grid">
          {field("MAIN HEADING", content.ending.title,
            (v) => updateSection("ending", "title", v))}
          {field("EMPHASISED HEADING", content.ending.emphasis,
            (v) => updateSection("ending", "emphasis", v))}
        </div>

        {field("BUTTON LABEL", content.ending.button,
          (v) => updateSection("ending", "button", v))}
      </section>

      <div className="services-admin-bottom">
        <p>
          Changes are saved to Supabase. The public Explore page
          will display them after we connect its content loader.
        </p>

        <button
          type="button"
          className="services-admin-button primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 size={14} /> : <Save size={14} />}
          {saving ? "SAVING..." : "SAVE SERVICES & PRICING"}
        </button>
      </div>
    </section>
  );
}
