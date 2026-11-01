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
  Wrench,
} from "lucide-react";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

const TOOL_STATUSES = [
  "CURRENTLY USING",
  "LEARNING",
  "EXPLORING",
  "COMFORTABLE WITH",
];

const clone = (value) => JSON.parse(JSON.stringify(value));

function moveItem(items, index, direction) {
  const next = [...items];
  const target = index + direction;

  if (target < 0 || target >= next.length) return items;

  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function createTool() {
  return {
    name: "NEW TOOL",
    status: "LEARNING",
    note: "",
  };
}

function createToolCategory(index) {
  return {
    id: `category-${Date.now()}-${index}`,
    number: String(index + 1).padStart(2, "0"),
    title: "NEW CATEGORY",
    description: "Describe this toolkit category.",
    tools: [],
  };
}

function normalizeExploreContent(saved) {
  const defaults = clone(DEFAULT_SITE_CONTENT.explore);

  if (!saved) return defaults;

  return {
    ...defaults,
    ...saved,

    hero: {
      ...defaults.hero,
      ...(saved.hero || {}),
    },

    services: Array.isArray(saved.services)
      ? saved.services
      : defaults.services,

    tools: Array.isArray(saved.tools)
      ? saved.tools.map((category, index) => ({
          ...category,
          id: category.id || `category-${index}`,
          number:
            category.number ||
            String(index + 1).padStart(2, "0"),
          title: category.title || "UNTITLED CATEGORY",
          description: category.description || "",
          tools: Array.isArray(category.tools)
            ? category.tools.map((tool) => ({
                name: tool.name || "",
                status: tool.status || "EXPLORING",
                note: tool.note || "",
              }))
            : [],
        }))
      : defaults.tools,

    custom: {
      ...defaults.custom,
      ...(saved.custom || {}),
      paragraphs: Array.isArray(saved.custom?.paragraphs)
        ? saved.custom.paragraphs
        : defaults.custom.paragraphs,
    },

    addOns: Array.isArray(saved.addOns)
      ? saved.addOns
      : defaults.addOns,

    process: Array.isArray(saved.process)
      ? saved.process
      : defaults.process,

    notes: {
      ...defaults.notes,
      ...(saved.notes || {}),
      paragraphs: Array.isArray(saved.notes?.paragraphs)
        ? saved.notes.paragraphs
        : defaults.notes.paragraphs,
    },

    ending: {
      ...defaults.ending,
      ...(saved.ending || {}),
    },
  };
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
        const normalized = normalizeExploreContent(saved);

        if (active) {
          setContent(normalized);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load Explore content.");
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

  // ------------------------------------------
  // GENERAL CONTENT EDITING
  // ------------------------------------------

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

      return {
        ...current,
        [key]: items,
      };
    });

    setSuccess("");
  };

  // ------------------------------------------
  // SERVICE EDITING
  // ------------------------------------------

  const updateService = (serviceIndex, field, value) => {
    setContent((current) => {
      const services = [...current.services];

      services[serviceIndex] = {
        ...services[serviceIndex],
        [field]: value,
      };

      return {
        ...current,
        services,
      };
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
    if (
      !window.confirm(
        "Delete this entire service and all its packages?"
      )
    ) {
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
      services: moveItem(
        current.services,
        index,
        direction
      ).map((service, i) => ({
        ...service,
        number: String(i + 1).padStart(2, "0"),
      })),
    }));

    setSuccess("");
  };

  // ------------------------------------------
  // PACKAGE EDITING
  // ------------------------------------------

  const addPackage = (serviceIndex) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };

      service.packages = [
        ...(service.packages || []),
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

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  const updatePackage = (
    serviceIndex,
    packageIndex,
    field,
    value
  ) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...(service.packages || [])];

      packages[packageIndex] = {
        ...packages[packageIndex],
        [field]: value,
      };

      service.packages = packages;
      services[serviceIndex] = service;

      return {
        ...current,
        services,
      };
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

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  const reorderPackages = (
    serviceIndex,
    packageIndex,
    direction
  ) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };

      service.packages = moveItem(
        service.packages,
        packageIndex,
        direction
      );

      services[serviceIndex] = service;

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  // ------------------------------------------
  // PACKAGE FEATURE EDITING
  // ------------------------------------------

  const updateFeature = (
    serviceIndex,
    packageIndex,
    featureIndex,
    value
  ) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];
      const pack = { ...packages[packageIndex] };
      const features = [...(pack.features || [])];

      features[featureIndex] = value;
      pack.features = features;

      packages[packageIndex] = pack;
      service.packages = packages;
      services[serviceIndex] = service;

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  const addFeature = (serviceIndex, packageIndex) => {
    setContent((current) => {
      const services = [...current.services];
      const service = { ...services[serviceIndex] };
      const packages = [...service.packages];
      const pack = { ...packages[packageIndex] };

      pack.features = [
        ...(pack.features || []),
        "New feature",
      ];

      packages[packageIndex] = pack;
      service.packages = packages;
      services[serviceIndex] = service;

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  const removeFeature = (
    serviceIndex,
    packageIndex,
    featureIndex
  ) => {
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

      return {
        ...current,
        services,
      };
    });

    setSuccess("");
  };

  // ------------------------------------------
  // ADD-ON EDITING
  // ------------------------------------------

  const addAddon = () => {
    setContent((current) => ({
      ...current,
      addOns: [
        ...current.addOns,
        {
          name: "NEW ADD-ON",
          price: "CUSTOM QUOTE",
        },
      ],
    }));

    setSuccess("");
  };

  const updateAddon = (index, field, value) => {
    setContent((current) => {
      const addOns = [...current.addOns];

      addOns[index] = {
        ...addOns[index],
        [field]: value,
      };

      return {
        ...current,
        addOns,
      };
    });

    setSuccess("");
  };

  const removeAddon = (index) => {
    setContent((current) => ({
      ...current,
      addOns: current.addOns.filter(
        (_, i) => i !== index
      ),
    }));

    setSuccess("");
  };

  const reorderAddon = (index, direction) => {
    setContent((current) => ({
      ...current,
      addOns: moveItem(
        current.addOns,
        index,
        direction
      ),
    }));

    setSuccess("");
  };

  // ------------------------------------------
  // PROCESS EDITING
  // ------------------------------------------

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

      process[index] = {
        ...process[index],
        [field]: value,
      };

      return {
        ...current,
        process,
      };
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
      process: moveItem(
        current.process,
        index,
        direction
      ).map((item, i) => ({
        ...item,
        number: String(i + 1).padStart(2, "0"),
      })),
    }));

    setSuccess("");
  };

  // ------------------------------------------
  // TOOLKIT CATEGORY EDITING
  // ------------------------------------------

  const updateToolCategory = (categoryIndex, field, value) => {
    setContent((current) => {
      const tools = [...current.tools];

      tools[categoryIndex] = {
        ...tools[categoryIndex],
        [field]: value,
      };

      return {
        ...current,
        tools,
      };
    });

    setSuccess("");
  };

  const addToolCategory = () => {
    setContent((current) => ({
      ...current,
      tools: [
        ...current.tools,
        createToolCategory(current.tools.length),
      ],
    }));

    setSuccess("");
  };

  const removeToolCategory = (categoryIndex) => {
    if (
      !window.confirm(
        "Delete this toolkit category and all its tools?"
      )
    ) {
      return;
    }

    setContent((current) => ({
      ...current,
      tools: current.tools
        .filter((_, index) => index !== categoryIndex)
        .map((category, index) => ({
          ...category,
          number: String(index + 1).padStart(2, "0"),
        })),
    }));

    setSuccess("");
  };

  const reorderToolCategory = (categoryIndex, direction) => {
    setContent((current) => ({
      ...current,
      tools: moveItem(
        current.tools,
        categoryIndex,
        direction
      ).map((category, index) => ({
        ...category,
        number: String(index + 1).padStart(2, "0"),
      })),
    }));

    setSuccess("");
  };

  // ------------------------------------------
  // INDIVIDUAL TOOL EDITING
  // ------------------------------------------

  const addTool = (categoryIndex) => {
    setContent((current) => {
      const tools = [...current.tools];
      const category = { ...tools[categoryIndex] };

      category.tools = [
        ...(category.tools || []),
        createTool(),
      ];

      tools[categoryIndex] = category;

      return {
        ...current,
        tools,
      };
    });

    setSuccess("");
  };

  const updateTool = (
    categoryIndex,
    toolIndex,
    field,
    value
  ) => {
    setContent((current) => {
      const tools = [...current.tools];
      const category = { ...tools[categoryIndex] };
      const categoryTools = [...(category.tools || [])];

      categoryTools[toolIndex] = {
        ...categoryTools[toolIndex],
        [field]: value,
      };

      category.tools = categoryTools;
      tools[categoryIndex] = category;

      return {
        ...current,
        tools,
      };
    });

    setSuccess("");
  };

  const removeTool = (categoryIndex, toolIndex) => {
    setContent((current) => {
      const tools = [...current.tools];
      const category = { ...tools[categoryIndex] };

      category.tools = category.tools.filter(
        (_, index) => index !== toolIndex
      );

      tools[categoryIndex] = category;

      return {
        ...current,
        tools,
      };
    });

    setSuccess("");
  };

  const reorderTool = (
    categoryIndex,
    toolIndex,
    direction
  ) => {
    setContent((current) => {
      const tools = [...current.tools];
      const category = { ...tools[categoryIndex] };

      category.tools = moveItem(
        category.tools,
        toolIndex,
        direction
      );

      tools[categoryIndex] = category;

      return {
        ...current,
        tools,
      };
    });

    setSuccess("");
  };

  // ------------------------------------------
  // SAVE / RESET
  // ------------------------------------------

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

      setSuccess(
        "Services, pricing and toolkit saved successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to save Explore content.");
    } finally {
      setSaving(false);
    }
  };

  const resetContent = () => {
    if (
      !window.confirm(
        "Reset all Explore content, services, pricing and toolkit to their original defaults? Save afterwards to overwrite the database."
      )
    ) {
      return;
    }

    setContent(clone(DEFAULT_SITE_CONTENT.explore));
    setError("");
    setSuccess(
      "Defaults restored locally. Save to publish them."
    );
  };

  // ------------------------------------------
  // SHARED FORM HELPERS
  // ------------------------------------------

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

    return (
    <div className="services-admin-page">
      <style>{`
        .services-admin-page {
          width: 100%;
          color: #eee;
          padding-bottom: 60px;
        }

        .services-admin-page * {
          box-sizing: border-box;
        }

        .services-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 35px;
        }

        .services-admin-eyebrow {
          color: #b9a17b;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .services-admin-header h1 {
          margin: 10px 0;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 400;
          letter-spacing: -1.5px;
        }

        .services-admin-header p {
          max-width: 520px;
          color: #888;
          font-size: 12px;
          line-height: 1.8;
        }

        .services-admin-header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .services-admin-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 18px;
          border: 1px solid rgba(255,255,255,.17);
          background: transparent;
          color: #eee;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: .25s ease;
        }

        .services-admin-button:hover {
          border-color: #b9a17b;
          color: #b9a17b;
        }

        .services-admin-button.primary {
          background: #b9a17b;
          border-color: #b9a17b;
          color: #111;
        }

        .services-admin-button.primary:hover {
          background: #d0b992;
          color: #111;
        }

        .services-admin-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .services-admin-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          margin-bottom: 15px;
          border: 1px solid rgba(185,161,123,.25);
          color: #cbb28e;
          font-size: 11px;
          line-height: 1.6;
        }

        .services-admin-notice.error {
          border-color: rgba(255,100,100,.3);
          color: #ff9999;
        }

        .services-admin-section {
          padding: clamp(18px, 3vw, 28px);
          margin-top: 24px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.018);
        }

        .services-admin-section-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding-bottom: 20px;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .services-admin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border: 1px solid rgba(185,161,123,.3);
          color: #b9a17b;
        }

        .services-admin-section-heading span {
          color: #b9a17b;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .services-admin-section-heading h2 {
          margin: 6px 0;
          font-size: 19px;
          font-weight: 400;
        }

        .services-admin-section-heading p {
          margin: 0;
          color: #888;
          font-size: 11px;
          line-height: 1.6;
        }

        .services-admin-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .services-admin-field > span {
          color: #999;
          font-size: 9px;
          letter-spacing: 1.2px;
        }

        .services-admin-field input,
        .services-admin-field textarea,
        .services-admin-field select {
          width: 100%;
          min-width: 0;
          border-radius: 0;
          outline: none;
          transition: border-color .2s ease;
        }

        .services-admin-field input:focus,
        .services-admin-field textarea:focus,
        .services-admin-field select:focus {
          border-color: #b9a17b !important;
        }

        .services-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .services-admin-grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .services-admin-full {
          grid-column: 1 / -1;
        }

        .services-admin-card {
          padding: 20px;
          margin-bottom: 18px;
          border: 1px solid rgba(255,255,255,.11);
          background: rgba(0,0,0,.13);
        }

        .services-admin-card:last-child {
          margin-bottom: 0;
        }

        .services-admin-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .services-admin-card-top h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 1px;
        }

        .services-admin-card-top > span {
          color: #b9a17b;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .services-admin-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .services-admin-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 29px;
          height: 29px;
          border: 1px solid rgba(255,255,255,.13);
          background: transparent;
          color: #aaa;
          cursor: pointer;
        }

        .services-admin-icon-button:hover {
          border-color: #b9a17b;
          color: #b9a17b;
        }

        .services-admin-icon-button.danger:hover {
          border-color: #e18b8b;
          color: #e18b8b;
        }

        .services-admin-icon-button:disabled {
          opacity: .25;
          cursor: not-allowed;
        }

        .services-admin-add {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          margin-top: 15px;
          border: 1px solid rgba(185,161,123,.4);
          background: transparent;
          color: #b9a17b;
          font-size: 9px;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .services-admin-add:hover {
          background: rgba(185,161,123,.08);
        }

        .services-admin-subheading {
          margin: 22px 0 14px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,.09);
          color: #b9a17b;
          font-size: 10px;
          letter-spacing: 1.4px;
        }

        .services-admin-feature {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 10px;
        }

        .services-admin-feature input {
          flex: 1;
          min-width: 0;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,.12);
          background: #111;
          color: #eee;
          outline: none;
          font-size: 11px;
        }

        .services-admin-feature button {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,.13);
          background: transparent;
          color: #e18b8b;
          cursor: pointer;
        }

        .services-admin-divider {
          height: 1px;
          margin: 22px 0;
          background: rgba(255,255,255,.1);
        }

        .services-admin-tool-category {
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,.11);
          background: rgba(0,0,0,.13);
        }

        .services-admin-tool-row {
          display: grid;
          grid-template-columns: 1fr 175px 1fr 90px;
          align-items: end;
          gap: 12px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .services-admin-tool-row:last-child {
          border-bottom: 0;
        }

        .services-admin-tool-row .services-admin-actions {
          justify-content: flex-end;
        }

        .services-admin-empty {
          padding: 15px 0;
          color: #777;
          font-size: 11px;
        }

        .services-admin-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid rgba(255,255,255,.1);
        }

        .services-admin-loading {
          padding: 50px 0;
          color: #b9a17b;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .services-admin-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #aaa;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .services-admin-checkbox input {
          accent-color: #b9a17b;
          width: 15px;
          height: 15px;
        }

        @media (max-width: 900px) {
          .services-admin-grid.three {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .services-admin-tool-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .services-admin-header {
            flex-direction: column;
          }

          .services-admin-header-actions {
            width: 100%;
          }

          .services-admin-header-actions button {
            flex: 1;
          }

          .services-admin-grid,
          .services-admin-grid.three {
            grid-template-columns: 1fr;
          }

          .services-admin-full {
            grid-column: auto;
          }

          .services-admin-tool-row {
            grid-template-columns: 1fr;
          }

          .services-admin-tool-row .services-admin-actions {
            justify-content: flex-start;
          }

          .services-admin-card,
          .services-admin-tool-category {
            padding: 14px;
          }

          .services-admin-section {
            padding: 16px;
          }

          .services-admin-footer {
            flex-direction: column;
          }

          .services-admin-footer button {
            width: 100%;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="services-admin-header">
        <div>
          <span className="services-admin-eyebrow">
            ADMIN PANEL / CONTENT MANAGEMENT
          </span>

          <h1>EXPLORE MANAGER</h1>

          <p>
            Manage your services, pricing packages, toolkit,
            add-ons and project process. All changes are saved
            to the same Explore content record used by your
            public website.
          </p>
        </div>

        <div className="services-admin-header-actions">
          <button
            type="button"
            className="services-admin-button"
            onClick={resetContent}
            disabled={loading || saving}
          >
            <RotateCcw size={13} />
            RESET
          </button>

          <button
            type="button"
            className="services-admin-button primary"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "SAVING..." : "SAVE ALL CHANGES"}
          </button>
        </div>
      </header>

      {success && (
        <div className="services-admin-notice" role="status">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="services-admin-notice error" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="services-admin-loading">
          LOADING EXPLORE CONTENT...
        </div>
      ) : (
        <>
          {/* =====================================
              HERO CONTENT
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              FileText,
              "01",
              "Explore Hero",
              "Edit the heading and introduction at the top of the public Explore page."
            )}

            <div className="services-admin-grid">
              {field(
                "EYEBROW",
                content.hero.eyebrow,
                (value) => updateSection("hero", "eyebrow", value)
              )}

              {field(
                "AVAILABILITY",
                content.hero.availability,
                (value) => updateSection("hero", "availability", value)
              )}

              {field(
                "MAIN TITLE",
                content.hero.title,
                (value) => updateSection("hero", "title", value)
              )}

              {field(
                "EMPHASIS",
                content.hero.emphasis,
                (value) => updateSection("hero", "emphasis", value)
              )}

              <div className="services-admin-full">
                {field(
                  "DESCRIPTION",
                  content.hero.description,
                  (value) => updateSection("hero", "description", value),
                  true
                )}
              </div>

              <div className="services-admin-full">
                {field(
                  "SUBTITLE",
                  content.hero.subtitle,
                  (value) => updateSection("hero", "subtitle", value)
                )}
              </div>
            </div>
          </section>

          {/* =====================================
              SERVICES & PRICING
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              BriefcaseBusiness,
              "02",
              "Services & Pricing",
              "Create services, edit their descriptions and manage all pricing packages."
            )}

            {content.services.map((service, serviceIndex) => (
              <div
                className="services-admin-card"
                key={service.id || serviceIndex}
              >
                <div className="services-admin-card-top">
                  <div>
                    <span className="services-admin-eyebrow">
                      SERVICE {String(serviceIndex + 1).padStart(2, "0")}
                    </span>

                    <h3>{service.title || "UNTITLED SERVICE"}</h3>
                  </div>

                  {itemActions(
                    serviceIndex,
                    content.services.length,
                    (direction) => reorderServices(serviceIndex, direction),
                    () => removeService(serviceIndex)
                  )}
                </div>

                <div className="services-admin-grid">
                  {field(
                    "SERVICE NUMBER",
                    service.number,
                    (value) => updateService(serviceIndex, "number", value)
                  )}

                  {field(
                    "CATEGORY",
                    service.category,
                    (value) => updateService(serviceIndex, "category", value)
                  )}

                  {field(
                    "SERVICE TITLE",
                    service.title,
                    (value) => updateService(serviceIndex, "title", value)
                  )}

                  {field(
                    "ICON / SYMBOL",
                    service.icon,
                    (value) => updateService(serviceIndex, "icon", value)
                  )}

                  <div className="services-admin-full">
                    {field(
                      "DESCRIPTION",
                      service.description,
                      (value) => updateService(serviceIndex, "description", value),
                      true
                    )}
                  </div>
                </div>

                <div className="services-admin-subheading">
                  PRICING PACKAGES ({service.packages?.length || 0})
                </div>

                {(service.packages || []).map((pack, packageIndex) => (
                  <div
                    className="services-admin-card"
                    key={`${service.id}-package-${packageIndex}`}
                  >
                    <div className="services-admin-card-top">
                      <div>
                        <span className="services-admin-eyebrow">
                          PACKAGE {String(packageIndex + 1).padStart(2, "0")}
                        </span>

                        <h3>{pack.name}</h3>
                      </div>

                      {itemActions(
                        packageIndex,
                        service.packages.length,
                        (direction) =>
                          reorderPackages(
                            serviceIndex,
                            packageIndex,
                            direction
                          ),
                        () => removePackage(serviceIndex, packageIndex)
                      )}
                    </div>

                    <div className="services-admin-grid three">
                      {field(
                        "PACKAGE NAME",
                        pack.name,
                        (value) =>
                          updatePackage(serviceIndex, packageIndex, "name", value)
                      )}

                      {field(
                        "PRICE",
                        pack.price,
                        (value) =>
                          updatePackage(serviceIndex, packageIndex, "price", value)
                      )}

                      {field(
                        "PRICE UNIT",
                        pack.unit,
                        (value) =>
                          updatePackage(serviceIndex, packageIndex, "unit", value)
                      )}

                      <div className="services-admin-full">
                        {field(
                          "PACKAGE DESCRIPTION",
                          pack.description,
                          (value) =>
                            updatePackage(
                              serviceIndex,
                              packageIndex,
                              "description",
                              value
                            ),
                          true
                        )}
                      </div>
                    </div>

                    <div className="services-admin-divider" />

                    <label className="services-admin-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(pack.popular)}
                        onChange={(event) =>
                          updatePackage(
                            serviceIndex,
                            packageIndex,
                            "popular",
                            event.target.checked
                          )
                        }
                      />
                      <Star size={13} />
                      MARK AS MOST POPULAR
                    </label>

                    <div className="services-admin-subheading">
                      PACKAGE FEATURES
                    </div>

                    {(pack.features || []).map((feature, featureIndex) => (
                      <div
                        className="services-admin-feature"
                        key={featureIndex}
                      >
                        <input
                          value={feature}
                          onChange={(event) =>
                            updateFeature(
                              serviceIndex,
                              packageIndex,
                              featureIndex,
                              event.target.value
                            )
                          }
                          placeholder="Package feature"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFeature(
                              serviceIndex,
                              packageIndex,
                              featureIndex
                            )
                          }
                          aria-label="Remove feature"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="services-admin-add"
                      onClick={() => addFeature(serviceIndex, packageIndex)}
                    >
                      <Plus size={13} />
                      ADD FEATURE
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="services-admin-add"
                  onClick={() => addPackage(serviceIndex)}
                >
                  <Plus size={13} />
                  ADD PRICING PACKAGE
                </button>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
              onClick={addService}
            >
              <Plus size={14} />
              ADD NEW SERVICE
            </button>
          </section>

          {/* =====================================
              TOOLKIT
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              Wrench,
              "03",
              "My Toolkit",
              "Manage the categories and individual tools displayed on the Explore page and homepage."
            )}

            <div className="services-admin-notice">
              <CheckCircle2 size={15} />
              Your homepage toolkit cards and Explore toolkit section
              use this same saved data.
            </div>

            {content.tools.map((category, categoryIndex) => (
              <div
                className="services-admin-tool-category"
                key={category.id || categoryIndex}
              >
                <div className="services-admin-card-top">
                  <div>
                    <span className="services-admin-eyebrow">
                      TOOLKIT CATEGORY {String(categoryIndex + 1).padStart(2, "0")}
                    </span>

                    <h3>{category.title}</h3>
                  </div>

                  {itemActions(
                    categoryIndex,
                    content.tools.length,
                    (direction) =>
                      reorderToolCategory(categoryIndex, direction),
                    () => removeToolCategory(categoryIndex)
                  )}
                </div>

                <div className="services-admin-grid">
                  {field(
                    "CATEGORY NUMBER",
                    category.number,
                    (value) =>
                      updateToolCategory(categoryIndex, "number", value)
                  )}

                  {field(
                    "CATEGORY TITLE",
                    category.title,
                    (value) =>
                      updateToolCategory(categoryIndex, "title", value)
                  )}

                  <div className="services-admin-full">
                    {field(
                      "CATEGORY DESCRIPTION",
                      category.description,
                      (value) =>
                        updateToolCategory(categoryIndex, "description", value),
                      true
                    )}
                  </div>
                </div>

                <div className="services-admin-subheading">
                  TOOLS ({category.tools?.length || 0})
                </div>

                {(category.tools || []).map((tool, toolIndex) => (
                  <div
                    className="services-admin-tool-row"
                    key={`${category.id}-${toolIndex}`}
                  >
                    <div className="services-admin-field">
                      <span>TOOL NAME</span>
                      <input
                        value={tool.name || ""}
                        onChange={(event) =>
                          updateTool(
                            categoryIndex,
                            toolIndex,
                            "name",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                        placeholder="React"
                      />
                    </div>

                    <div className="services-admin-field">
                      <span>STATUS</span>
                      <select
                        value={tool.status || "EXPLORING"}
                        onChange={(event) =>
                          updateTool(
                            categoryIndex,
                            toolIndex,
                            "status",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                      >
                        {TOOL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="services-admin-field">
                      <span>SHORT DESCRIPTION</span>
                      <input
                        value={tool.note || ""}
                        onChange={(event) =>
                          updateTool(
                            categoryIndex,
                            toolIndex,
                            "note",
                            event.target.value
                          )
                        }
                        style={inputStyle}
                        placeholder="What do you use it for?"
                      />
                    </div>

                    <div className="services-admin-actions">
                      <button
                        type="button"
                        className="services-admin-icon-button"
                        disabled={toolIndex === 0}
                        onClick={() =>
                          reorderTool(categoryIndex, toolIndex, -1)
                        }
                        aria-label="Move tool up"
                      >
                        <ChevronUp size={15} />
                      </button>

                      <button
                        type="button"
                        className="services-admin-icon-button"
                        disabled={toolIndex === category.tools.length - 1}
                        onClick={() =>
                          reorderTool(categoryIndex, toolIndex, 1)
                        }
                        aria-label="Move tool down"
                      >
                        <ChevronDown size={15} />
                      </button>

                      <button
                        type="button"
                        className="services-admin-icon-button danger"
                        onClick={() =>
                          removeTool(categoryIndex, toolIndex)
                        }
                        aria-label="Delete tool"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {(!category.tools || category.tools.length === 0) && (
                  <p className="services-admin-empty">
                    No tools added to this category yet.
                  </p>
                )}

                <button
                  type="button"
                  className="services-admin-add"
                  onClick={() => addTool(categoryIndex)}
                >
                  <Plus size={13} />
                  ADD TOOL
                </button>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
              onClick={addToolCategory}
            >
              <Plus size={14} />
              ADD TOOLKIT CATEGORY
            </button>
          </section>

          {/* =====================================
              CUSTOM PROJECT SECTION
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              FileText,
              "04",
              "Custom Projects",
              "Edit the custom project call-to-action on your Explore page."
            )}

            <div className="services-admin-grid">
              {field(
                "EYEBROW",
                content.custom.eyebrow,
                (value) => updateSection("custom", "eyebrow", value)
              )}

              {field(
                "TITLE",
                content.custom.title,
                (value) => updateSection("custom", "title", value)
              )}

              {field(
                "EMPHASIS",
                content.custom.emphasis,
                (value) => updateSection("custom", "emphasis", value)
              )}

              {field(
                "BUTTON TEXT",
                content.custom.button,
                (value) => updateSection("custom", "button", value)
              )}
            </div>

            <div className="services-admin-subheading">
              DESCRIPTION PARAGRAPHS
            </div>

            {content.custom.paragraphs.map((paragraph, index) => (
              <div
                className="services-admin-feature"
                key={index}
              >
                <textarea
                  value={paragraph}
                  onChange={(event) => {
                    const paragraphs = [...content.custom.paragraphs];
                    paragraphs[index] = event.target.value;

                    updateSection("custom", "paragraphs", paragraphs);
                  }}
                  style={{
                    ...inputStyle,
                    minHeight: 65,
                    resize: "vertical",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    updateSection(
                      "custom",
                      "paragraphs",
                      content.custom.paragraphs.filter(
                        (_, i) => i !== index
                      )
                    )
                  }
                  aria-label="Remove paragraph"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
              onClick={() =>
                updateSection("custom", "paragraphs", [
                  ...content.custom.paragraphs,
                  "New paragraph",
                ])
              }
            >
              <Plus size={13} />
              ADD PARAGRAPH
            </button>
          </section>

          {/* =====================================
              ADD-ONS
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              Tags,
              "05",
              "Additional Services",
              "Manage the optional extras and their prices."
            )}

            {content.addOns.map((addon, index) => (
              <div className="services-admin-card" key={index}>
                <div className="services-admin-card-top">
                  <span>ADD-ON {String(index + 1).padStart(2, "0")}</span>

                  {itemActions(
                    index,
                    content.addOns.length,
                    (direction) => reorderAddon(index, direction),
                    () => removeAddon(index)
                  )}
                </div>

                <div className="services-admin-grid">
                  {field(
                    "ADD-ON NAME",
                    addon.name,
                    (value) => updateAddon(index, "name", value)
                  )}

                  {field(
                    "PRICE",
                    addon.price,
                    (value) => updateAddon(index, "price", value)
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
              onClick={addAddon}
            >
              <Plus size={13} />
              ADD EXTRA
            </button>
          </section>

          {/* =====================================
              PROCESS
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              Workflow,
              "06",
              "Project Process",
              "Edit the steps shown to customers explaining how you work."
            )}

            {content.process.map((step, index) => (
              <div className="services-admin-card" key={index}>
                <div className="services-admin-card-top">
                  <span>
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>

                  {itemActions(
                    index,
                    content.process.length,
                    (direction) => reorderProcess(index, direction),
                    () => removeProcess(index)
                  )}
                </div>

                <div className="services-admin-grid">
                  {field(
                    "STEP NUMBER",
                    step.number,
                    (value) => updateProcess(index, "number", value)
                  )}

                  {field(
                    "STEP TITLE",
                    step.title,
                    (value) => updateProcess(index, "title", value)
                  )}

                  <div className="services-admin-full">
                    {field(
                      "DESCRIPTION",
                      step.description,
                      (value) => updateProcess(index, "description", value),
                      true
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
              onClick={addProcess}
            >
              <Plus size={13} />
              ADD PROCESS STEP
            </button>
          </section>

          {/* =====================================
              PRICING NOTES
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              FileText,
              "07",
              "Pricing Notes",
              "Edit the information customers see about pricing and project scope."
            )}

            <div className="services-admin-grid">
              {field(
                "EYEBROW",
                content.notes.eyebrow,
                (value) => updateSection("notes", "eyebrow", value)
              )}

              {field(
                "TITLE",
                content.notes.title,
                (value) => updateSection("notes", "title", value)
              )}

              {field(
                "EMPHASIS",
                content.notes.emphasis,
                (value) => updateSection("notes", "emphasis", value)
              )}
            </div>

            <div className="services-admin-subheading">
              NOTE PARAGRAPHS
            </div>

            {content.notes.paragraphs.map((paragraph, index) => (
              <div className="services-admin-feature" key={index}>
                <textarea
                  value={paragraph}
                  onChange={(event) => {
                    const paragraphs = [...content.notes.paragraphs];
                    paragraphs[index] = event.target.value;

                    updateSection("notes", "paragraphs", paragraphs);
                  }}
                  style={{
                    ...inputStyle,
                    minHeight: 75,
                    resize: "vertical",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    updateSection(
                      "notes",
                      "paragraphs",
                      content.notes.paragraphs.filter(
                        (_, i) => i !== index
                      )
                    )
                  }
                  aria-label="Remove note"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="services-admin-add"
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

          {/* =====================================
              ENDING / FINAL CTA
          ===================================== */}
          <section className="services-admin-section">
            {sectionHeading(
              Package,
              "08",
              "Final Call To Action",
              "Edit the final section displayed at the bottom of the Explore page."
            )}

            <div className="services-admin-grid">
              {field(
                "EYEBROW",
                content.ending.eyebrow,
                (value) => updateSection("ending", "eyebrow", value)
              )}

              {field(
                "TITLE",
                content.ending.title,
                (value) => updateSection("ending", "title", value)
              )}

              {field(
                "EMPHASIS",
                content.ending.emphasis,
                (value) => updateSection("ending", "emphasis", value)
              )}

              {field(
                "BUTTON TEXT",
                content.ending.button,
                (value) => updateSection("ending", "button", value)
              )}
            </div>
          </section>

          {/* =====================================
              FINAL SAVE
          ===================================== */}
          <div className="services-admin-footer">
            <button
              type="button"
              className="services-admin-button"
              onClick={resetContent}
              disabled={saving}
            >
              <RotateCcw size={13} />
              RESET ALL
            </button>

            <button
              type="button"
              className="services-admin-button primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}

              {saving
                ? "SAVING..."
                : "SAVE ALL EXPLORE CONTENT ↗"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}