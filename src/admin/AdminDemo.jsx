
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, BriefcaseBusiness,
  MessageSquareText, UserRound, Settings2, Contact,
  Menu, X, ArrowUpRight, Star, Sparkles, Send,
  Eye, EyeOff, CheckCircle2, ShieldCheck, LogOut,
  RefreshCw, TrendingUp, Clock3, Globe, Activity
} from "lucide-react";

const sections = [
  ["Dashboard", "dashboard", LayoutDashboard],
  ["Personal Projects", "projects", FolderKanban],
  ["Client Work", "client-work", BriefcaseBusiness],
  ["Client Reviews", "reviews", MessageSquareText],
  ["About Page", "about", UserRound],
  ["Services & Pricing", "services", Settings2],
  ["Contact Page", "contact", Contact],
];

const sampleProjects = [
  { name: "GYMOS", category: "SAAS / WEB APP", tech: "React · Supabase · Tailwind", status: "BUILDING", published: true },
  { name: "FAKE NEWS DETECTOR", category: "AI / MACHINE LEARNING", tech: "Python · Flask · PyTorch", status: "COMPLETED", published: true },
  { name: "CREATIVE PORTFOLIO", category: "WEB EXPERIENCE", tech: "React · GSAP · Three.js", status: "LIVE", published: true },
];

const sampleClients = [
  { name: "BONE JAM", type: "BRAND WEBSITE", status: "ACTIVE" },
  { name: "NORTHSTAR STUDIO", type: "LANDING PAGE", status: "COMPLETED" },
];

const sampleReviews = [
  { id: 1, name: "Alex Morgan", project: "BONE JAM", rating: 5, status: "approved", message: "Great communication and a thoughtful final experience." },
  { id: 2, name: "Jordan Lee", project: "NORTHSTAR STUDIO", rating: 5, status: "pending", message: "The process was smooth and the result feels polished." },
  { id: 3, name: "Sam Taylor", project: "BONE JAM", rating: 4, status: "pending", message: "Really happy with the overall quality of the work." },
];

const services = [
  ["WEB DEVELOPMENT", "₹8,000 – ₹18,000", "Responsive websites and web applications."],
  ["UI / UX DESIGN", "₹6,000 – ₹14,000", "Product interfaces and design systems."],
  ["CREATIVE DEVELOPMENT", "₹5,000 – ₹16,000", "Motion, interactions and digital experiences."],
];

export default function AdminDemo() {
  const navigate = useNavigate();

  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [projects, setProjects] = useState(sampleProjects);
  const [reviews, setReviews] = useState(sampleReviews);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome to the portfolio demo workspace. Ask me about projects, client work, reviews, services or the dashboard." }
  ]);

  const heading = sections.find(item => item[1] === page)?.[0] || "Dashboard";
  const approved = reviews.filter(item => item.status === "approved").length;
  const pending = reviews.filter(item => item.status === "pending").length;

  const stats = [
    ["PERSONAL PROJECTS", projects.length, "projects", FolderKanban, "Portfolio builds"],
    ["CLIENT PROJECTS", sampleClients.length, "client-work", BriefcaseBusiness, "Client engagements"],
    ["TOTAL REVIEWS", reviews.length, "reviews", Star, `${approved} approved`],
    ["PENDING REVIEWS", pending, "reviews", Clock3, "Awaiting moderation"],
  ];

  const filteredProjects = useMemo(() => projects.filter(project =>
    project.name.toLowerCase().includes(query.toLowerCase())
  ), [projects, query]);

  const go = target => {
    setPage(target);
    setMenuOpen(false);
    setNotice("");
    setQuery("");
    window.history.replaceState(null, "", `/admin-demo/${target}`);
  };

  const simulate = action => {
    setNotice(`${action}. This is a demo action; no live portfolio data was changed.`);
  };

  const updateReview = (id, status) => {
    setReviews(old => old.map(item =>
      item.id === id ? { ...item, status } : item
    ));
    simulate(`Review ${status}`);
  };

  const answerAssistant = event => {
    event.preventDefault();
    if (!question.trim()) return;

    const q = question.toLowerCase();
    let answer = "This is a simulated assistant for the public portfolio demo. Try asking about projects, client work, reviews, services or dashboard statistics.";

    if (q.includes("project")) {
      answer = `There are ${projects.length} sample personal projects: ${projects.map(p => p.name).join(", ")}.`;
    } else if (q.includes("client")) {
      answer = "The sample workspace contains Bone Jam (active) and Northstar Studio (completed).";
    } else if (q.includes("review")) {
      answer = `There are ${reviews.length} sample reviews: ${approved} approved and ${pending} pending.`;
    } else if (q.includes("service") || q.includes("price")) {
      answer = "The sample services include web development, UI/UX design and creative development. Prices are illustrative demo values.";
    } else if (q.includes("dashboard") || q.includes("stat")) {
      answer = `Dashboard overview: ${projects.length} personal projects, ${sampleClients.length} client projects, ${reviews.length} reviews and ${pending} pending reviews.`;
    } else if (q.includes("about")) {
      answer = "The About section previews biography content, personal principles and profile information.";
    } else if (q.includes("contact")) {
      answer = "The Contact section previews sample contact channels and availability settings. No real inbox is connected.";
    }

    setMessages(old => [
      ...old,
      { role: "user", text: question },
      { role: "ai", text: answer }
    ]);
    setQuestion("");
  };

  return (
    <div id="admin-demo-root">
      <style>{`
        #admin-demo-root {
          --d-bg: #090909;
          --d-panel: #111;
          --d-line: rgba(255,255,255,.12);
          --d-text: #f1f0ec;
          --d-muted: #888;
          --d-gold: #c9b38d;
          position: relative;
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: var(--d-bg);
          color: var(--d-text);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          isolation: isolate;
          overflow-x: clip;
        }

        #admin-demo-root * { box-sizing: border-box; }
        #admin-demo-root button,
        #admin-demo-root input { font: inherit; }
        #admin-demo-root button { color: inherit; }
        #admin-demo-root .demo-sidebar {
          width: 255px;
          min-width: 255px;
          min-height: 100vh;
          padding: 25px 17px;
          background: #101010;
          border-right: 1px solid var(--d-line);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }
        #admin-demo-root .demo-brand {
          padding: 10px 8px 30px;
          border-bottom: 1px solid var(--d-line);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        #admin-demo-root .demo-mark {
          border: 1px solid #aaa;
          padding: 12px;
          font-weight: bold;
        }
        #admin-demo-root .demo-brand b { font-size: 13px; letter-spacing: 1px; }
        #admin-demo-root .demo-brand small {
          display: block;
          color: #777;
          font-size: 9px;
          letter-spacing: 2px;
          margin-top: 5px;
        }
        #admin-demo-root .demo-label {
          font-size: 9px;
          letter-spacing: 2px;
          color: #777;
          margin: 30px 10px 12px;
        }
        #admin-demo-root .demo-nav { display: grid; gap: 6px; }
        #admin-demo-root .demo-nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          padding: 14px 11px;
          color: #888;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          font-size: 11px;
          width: 100%;
        }
        #admin-demo-root .demo-nav button.active,
        #admin-demo-root .demo-nav button:hover {
          background: #ffffff0b;
          border-color: #ffffff1b;
          color: white;
        }
        #admin-demo-root .demo-nav button.active svg { color: var(--d-gold); }
        #admin-demo-root .demo-sidebar-bottom { margin-top: auto; }
        #admin-demo-root .demo-user {
          padding: 13px;
          border: 1px solid var(--d-line);
          color: #aaa;
          font-size: 10px;
          display: flex;
          gap: 10px;
          align-items: center;
        }
        #admin-demo-root .demo-user svg { color: var(--d-gold); }
        #admin-demo-root .demo-exit {
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          background: transparent;
          color: #aaa;
          border: 1px solid #ffffff20;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        #admin-demo-root .demo-main { flex: 1; min-width: 0; min-height: 100vh; }
        #admin-demo-root .demo-topbar {
          min-height: 75px;
          padding: 0 35px;
          border-bottom: 1px solid var(--d-line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          color: #888;
          font-size: 9px;
          letter-spacing: 1.5px;
        }
        #admin-demo-root .demo-top-left,
        #admin-demo-root .demo-top-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        #admin-demo-root .demo-top-right { color: #a8bd91; }
        #admin-demo-root .demo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #a8bd91;
        }
        #admin-demo-root .demo-menu {
          display: none;
          background: transparent;
          border: 1px solid #ffffff30;
          padding: 8px;
          cursor: pointer;
        }
        #admin-demo-root .demo-content {
          width: 100%;
          max-width: 1500px;
          padding: 35px;
          margin: auto;
        }
        #admin-demo-root .demo-warning {
          padding: 12px 15px;
          margin-bottom: 30px;
          color: var(--d-gold);
          background: #c9b38d10;
          border: 1px solid #c9b38d30;
          font-size: 9px;
          letter-spacing: 1px;
          line-height: 1.7;
        }
        #admin-demo-root .demo-notice {
          padding: 12px;
          margin-bottom: 20px;
          background: #a8bd9115;
          color: #a8bd91;
          font-size: 11px;
          line-height: 1.6;
        }
        #admin-demo-root .demo-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 38px;
        }
        #admin-demo-root .demo-eyebrow {
          color: var(--d-gold);
          font-size: 9px;
          letter-spacing: 2px;
        }
        #admin-demo-root .demo-heading h1 {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 500;
          letter-spacing: -2px;
          margin: 15px 0;
          line-height: 1.05;
        }
        #admin-demo-root .demo-heading h1 em {
          font-family: Georgia, serif;
          color: var(--d-gold);
          font-weight: 400;
        }
        #admin-demo-root .demo-heading p {
          color: #888;
          font-size: 12px;
          line-height: 1.8;
        }
        #admin-demo-root .demo-btn {
          padding: 12px 15px;
          background: #171717;
          border: 1px solid #ffffff30;
          color: #ddd;
          cursor: pointer;
          font-size: 9px;
          letter-spacing: 1px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        #admin-demo-root .demo-section-label {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #777;
          font-size: 9px;
          letter-spacing: 1.5px;
          margin: 25px 0 14px;
        }
        #admin-demo-root .demo-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 35px;
        }
        #admin-demo-root .demo-stat {
          padding: 19px;
          min-height: 145px;
          text-align: left;
          background: #ffffff06;
          border: 1px solid var(--d-line);
          color: white;
          cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        #admin-demo-root .demo-stat:hover {
          background: #ffffff0c;
          border-color: #c9b38d70;
        }
        #admin-demo-root .demo-stat span {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #999;
          font-size: 8px;
          letter-spacing: 1px;
        }
        #admin-demo-root .demo-stat strong {
          display: block;
          font-size: 38px;
          font-weight: 400;
          margin: 20px 0 10px;
        }
        #admin-demo-root .demo-stat small { color: #777; font-size: 10px; }
        #admin-demo-root .demo-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 15px;
        }
        #admin-demo-root .demo-panel {
          padding: 22px;
          background: #ffffff05;
          border: 1px solid var(--d-line);
          min-width: 0;
        }
        #admin-demo-root .demo-panel h2 {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          margin: 0 0 18px;
        }
        #admin-demo-root .demo-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 15px 0;
          border-bottom: 1px solid #ffffff12;
          font-size: 11px;
        }
        #admin-demo-root .demo-row small {
          display: block;
          color: #777;
          margin-top: 6px;
          font-size: 9px;
        }
        #admin-demo-root .demo-status {
          font-size: 8px;
          letter-spacing: 1px;
          color: var(--d-gold);
          text-transform: uppercase;
        }
        #admin-demo-root .demo-list { display: grid; gap: 10px; }
        #admin-demo-root .demo-item {
          padding: 20px;
          background: #ffffff05;
          border: 1px solid var(--d-line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }
        #admin-demo-root .demo-item h3 {
          font-size: 17px;
          font-weight: 500;
          margin: 8px 0;
        }
        #admin-demo-root .demo-item p { color: #888; font-size: 10px; line-height: 1.7; }
        #admin-demo-root .demo-kicker { color: var(--d-gold); font-size: 8px; letter-spacing: 1.5px; }
        #admin-demo-root .demo-actions { display: flex; gap: 7px; flex-wrap: wrap; }
        #admin-demo-root .demo-actions button {
          padding: 9px;
          background: transparent;
          border: 1px solid #ffffff25;
          color: #aaa;
          font-size: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        #admin-demo-root .demo-search {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          background: #111;
          border: 1px solid #ffffff20;
          color: white;
        }
        #admin-demo-root .demo-review {
          padding: 18px;
          background: #ffffff06;
          border: 1px solid #ffffff18;
          margin-bottom: 10px;
        }
        #admin-demo-root .demo-review p { color: #aaa; font-size: 11px; line-height: 1.7; }
        #admin-demo-root .demo-footer {
          margin-top: 40px;
          padding-top: 17px;
          border-top: 1px solid #ffffff18;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #555;
          font-size: 8px;
          letter-spacing: 1px;
        }
        #admin-demo-root .demo-assistant-button {
          position: fixed;
          right: 22px;
          bottom: 22px;
          padding: 14px 18px;
          background: var(--d-gold);
          color: #111;
          border: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          z-index: 150;
          font-size: 9px;
        }
        #admin-demo-root .demo-chat {
          position: fixed;
          right: 20px;
          bottom: 75px;
          width: min(350px, calc(100vw - 30px));
          height: 430px;
          background: #111;
          border: 1px solid #ffffff30;
          z-index: 151;
          display: flex;
          flex-direction: column;
          box-shadow: 0 15px 60px #000;
        }
        #admin-demo-root .demo-chat-head {
          padding: 15px;
          border-bottom: 1px solid #ffffff20;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        #admin-demo-root .demo-chat-body {
          padding: 13px;
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        #admin-demo-root .demo-message {
          padding: 10px;
          background: #ffffff0b;
          font-size: 10px;
          line-height: 1.6;
          max-width: 90%;
        }
        #admin-demo-root .demo-message.user {
          align-self: flex-end;
          background: var(--d-gold);
          color: #111;
        }
        #admin-demo-root .demo-chat form {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ffffff20;
        }
        #admin-demo-root .demo-chat input {
          flex: 1;
          min-width: 0;
          padding: 10px;
          background: #080808;
          color: white;
          border: 1px solid #ffffff20;
        }
        #admin-demo-root .demo-chat form button {
          background: var(--d-gold);
          color: #111;
          border: 0;
          padding: 10px;
          cursor: pointer;
        }
        @media (max-width: 950px) {
          #admin-demo-root .demo-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 760px) {
          #admin-demo-root { display: block; }
          #admin-demo-root .demo-sidebar {
            position: fixed;
            z-index: 200;
            top: 0;
            bottom: 0;
            left: 0;
            width: 260px;
            min-width: 260px;
            transform: translateX(-110%);
            transition: transform .25s;
          }
          #admin-demo-root .demo-sidebar.open { transform: translateX(0); }
          #admin-demo-root .demo-menu { display: inline-flex; }
          #admin-demo-root .demo-topbar { padding: 15px; }
          #admin-demo-root .demo-content { padding: 22px 15px; }
          #admin-demo-root .demo-heading { align-items: flex-start; flex-direction: column; }
          #admin-demo-root .demo-grid { grid-template-columns: 1fr; }
          #admin-demo-root .demo-item { align-items: flex-start; flex-direction: column; }
        }
        @media (max-width: 430px) {
          #admin-demo-root .demo-stats { gap: 8px; }
          #admin-demo-root .demo-stat { padding: 12px; min-height: 125px; }
          #admin-demo-root .demo-stat strong { font-size: 30px; }
          #admin-demo-root .demo-topbar { font-size: 8px; }
          #admin-demo-root .demo-footer { flex-direction: column; gap: 8px; }
        }
      `}</style>

      <aside className={`demo-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="demo-brand">
          <div className="demo-mark">AS.</div>
          <div><b>ADITYA SINGH</b><small>ADMINISTRATION</small></div>
        </div>

        <div className="demo-label">DEMO WORKSPACE</div>
        <nav className="demo-nav">
          {sections.map(([label, key, Icon]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => go(key)}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div className="demo-sidebar-bottom">
          <div className="demo-user"><ShieldCheck size={18} /> Demo Visitor · READ ONLY</div>
          <button className="demo-exit" onClick={() => navigate("/")}>
            <LogOut size={15} /> EXIT DEMO <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>

      <main className="demo-main">
        <header className="demo-topbar">
          <div className="demo-top-left">
            <button className="demo-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            CONTROL CENTER / {heading.toUpperCase()}
          </div>
          <div className="demo-top-right"><span className="demo-dot" /> DEMO ENVIRONMENT</div>
        </header>

        <div className="demo-content">
          <div className="demo-warning">
            ◈ INTERACTIVE PUBLIC PREVIEW — SAMPLE DATA ONLY — NO LIVE CHANGES
          </div>

          {notice && <div className="demo-notice">{notice}</div>}

          <header className="demo-heading">
            <div>
              <span className="demo-eyebrow">✳ ADI / {heading.toUpperCase()}</span>
              <h1>{page === "dashboard" ? <>YOUR <em>WORKSPACE.</em></> : <>{heading.toUpperCase()}<em>.</em></>}</h1>
              <p>Explore the portfolio control centre in a safe, interactive demo.</p>
            </div>
            {page === "dashboard" && (
              <button className="demo-btn" onClick={() => simulate("Dashboard refreshed")}>
                <RefreshCw size={13} /> REFRESH DATA
              </button>
            )}
          </header>

          {page === "dashboard" && <>
            <div className="demo-section-label"><span>01 / PORTFOLIO STATISTICS</span><span>SAMPLE DATA</span></div>
            <div className="demo-stats">
              {stats.map(([label, value, target, Icon, detail]) => (
                <button className="demo-stat" key={label} onClick={() => go(target)}>
                  <span>{label}<Icon size={16} /></span>
                  <strong>{String(value).padStart(2, "0")}</strong>
                  <small>{detail} ↗</small>
                </button>
              ))}
            </div>

            <div className="demo-section-label"><span>02 / ACTIVITY & MANAGEMENT</span><span>WORKSPACE</span></div>
            <div className="demo-grid">
              <div className="demo-panel">
                <h2>RECENT CLIENT REVIEWS</h2>
                {reviews.slice(0, 3).map(review => (
                  <div className="demo-row" key={review.id}>
                    <div>{review.name}<small>{review.project}</small></div>
                    <span className="demo-status">{review.status}</span>
                  </div>
                ))}
              </div>
              <div className="demo-panel">
                <h2>QUICK MANAGEMENT</h2>
                {sections.slice(1).map(([label, key, Icon]) => (
                  <button className="demo-row" key={key} style={{ width: "100%", background: "transparent", border: 0, color: "#ccc", cursor: "pointer", textAlign: "left" }} onClick={() => go(key)}>
                    <span><Icon size={15} /> {label}</span><ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="demo-section-label"><span>03 / WORKSPACE HEALTH</span><span>ILLUSTRATIVE</span></div>
            <div className="demo-grid">
              <div className="demo-panel">
                <h2>REVIEW APPROVAL OVERVIEW</h2>
                <div className="demo-row"><span>Approved reviews</span><b>{approved}</b></div>
                <div className="demo-row"><span>Pending reviews</span><b>{pending}</b></div>
                <div className="demo-row"><span>Average rating</span><b>4.7 / 5</b></div>
              </div>
              <div className="demo-panel">
                <h2>PORTFOLIO STATUS</h2>
                <div className="demo-row"><span><Globe size={14} /> Public website</span><span className="demo-status">ONLINE</span></div>
                <div className="demo-row"><span><Activity size={14} /> Demo environment</span><span className="demo-status">ACTIVE</span></div>
                <div className="demo-row"><span><ShieldCheck size={14} /> Data access</span><span className="demo-status">READ ONLY</span></div>
              </div>
            </div>
          </>}

          {page === "projects" && <>
            <input className="demo-search" placeholder="Search personal projects..." value={query} onChange={e => setQuery(e.target.value)} />
            <div className="demo-list">
              {filteredProjects.map(project => (
                <article className="demo-item" key={project.name}>
                  <div>
                    <span className="demo-kicker">{project.category}</span>
                    <h3>{project.name}</h3>
                    <p>{project.tech} · {project.status}</p>
                    <span className="demo-status">{project.published ? "PUBLISHED" : "DRAFT"}</span>
                  </div>
                  <div className="demo-actions">
                    <button onClick={() => simulate(`Previewed ${project.name}`)}><Eye size={13} /> PREVIEW</button>
                    <button onClick={() => {
                      setProjects(old => old.map(item => item.name === project.name ? { ...item, published: !item.published } : item));
                      simulate("Demo publishing status changed");
                    }}>{project.published ? <EyeOff size={13} /> : <Eye size={13} />}{project.published ? "UNPUBLISH" : "PUBLISH"}</button>
                    <button onClick={() => simulate(`Edit view opened for ${project.name}`)}>EDIT</button>
                  </div>
                </article>
              ))}
              {filteredProjects.length === 0 && <div className="demo-panel">No matching sample projects.</div>}
            </div>
          </>}

          {page === "client-work" && <div className="demo-list">
            {sampleClients.map(client => (
              <article className="demo-item" key={client.name}>
                <div><span className="demo-kicker">{client.type}</span><h3>{client.name}</h3><p>Sample client case study and project details.</p><span className="demo-status">{client.status}</span></div>
                <div className="demo-actions">
                  <button onClick={() => simulate(`Previewed ${client.name}`)}><Eye size={13} /> PREVIEW</button>
                  <button onClick={() => simulate(`Edit view opened for ${client.name}`)}>EDIT</button>
                </div>
              </article>
            ))}
          </div>}

          {page === "reviews" && <>
            <div className="demo-section-label"><span>{reviews.length} SAMPLE REVIEWS</span><span>{pending} PENDING</span></div>
            {reviews.map(review => (
              <article className="demo-review" key={review.id}>
                <div className="demo-row" style={{ paddingTop: 0 }}>
                  <b>{review.name} · {review.project}</b><span className="demo-status">{review.status}</span>
                </div>
                <div style={{ color: "#c9b38d", margin: "12px 0" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                <p>“{review.message}”</p>
                <div className="demo-actions" style={{ marginTop: 15 }}>
                  <button onClick={() => updateReview(review.id, "approved")}><CheckCircle2 size={13} /> APPROVE</button>
                  <button onClick={() => updateReview(review.id, "rejected")}><EyeOff size={13} /> REJECT</button>
                </div>
              </article>
            ))}
          </>}

          {page === "about" && <div className="demo-panel">
            <span className="demo-kicker">01 / HERO CONTENT</span>
            <h2 style={{ fontSize: 30, marginTop: 20 }}>THE PERSON BEHIND THE WORK.</h2>
            <p style={{ color: "#999", lineHeight: 1.9 }}>Developer, creative thinker and problem solver focused on building useful digital experiences with thoughtful design and technology.</p>
            <div className="demo-section-label">02 / PRINCIPLES</div>
            {["CLARITY FIRST", "DETAIL MATTERS", "KEEP LEARNING"].map((item, index) => <div className="demo-row" key={item}><b>0{index + 1} / {item}</b><span>CONTENT BLOCK</span></div>)}
            <button className="demo-btn" style={{ marginTop: 20 }} onClick={() => simulate("About editor preview opened")}>PREVIEW EDITOR</button>
          </div>}

          {page === "services" && <div className="demo-grid">
            {services.map(([name, price, description]) => (
              <div className="demo-panel" key={name}>
                <span className="demo-kicker">SERVICE PACKAGE</span>
                <h2 style={{ marginTop: 20 }}>{name}</h2>
                <h3 style={{ fontSize: 23, color: "#c9b38d" }}>{price}</h3>
                <p style={{ color: "#999", fontSize: 11, lineHeight: 1.7, marginTop: 12 }}>{description}</p>
                <button className="demo-btn" style={{ marginTop: 20 }} onClick={() => simulate(`${name} package editor opened`)}>MANAGE PACKAGES</button>
              </div>
            ))}
          </div>}

          {page === "contact" && <div className="demo-grid">
            <div className="demo-panel">
              <h2>CONTACT CHANNELS</h2>
              {["EMAIL · hello@example.com", "LINKEDIN · linkedin.com/in/example", "INSTAGRAM · @example.studio", "PHONE · DISABLED"].map(item => <div className="demo-row" key={item}>{item}<span className="demo-status">SAMPLE</span></div>)}
            </div>
            <div className="demo-panel">
              <h2>AVAILABILITY</h2>
              <p style={{ color: "#a8bd91" }}>● OPEN TO SELECT PROJECTS</p>
              <p style={{ color: "#999", lineHeight: 1.8, marginTop: 15 }}>Sample inquiry settings and contact preferences. No real inbox is connected.</p>
              <button className="demo-btn" style={{ marginTop: 20 }} onClick={() => navigate("/contact")}>VIEW PUBLIC CONTACT PAGE ↗</button>
            </div>
          </div>}

          <footer className="demo-footer">
            <span>ADITYA SINGH / ADMIN DEMO</span>
            <span>PUBLIC PREVIEW · SAMPLE DATA ONLY</span>
          </footer>
        </div>
      </main>

      <button className="demo-assistant-button" onClick={() => setAssistantOpen(v => !v)}>
        <Sparkles size={17} /> DEMO AI ASSISTANT
      </button>

      {assistantOpen && <div className="demo-chat">
        <div className="demo-chat-head">
          <b>✳ WORKSPACE ASSISTANT · DEMO</b>
          <button onClick={() => setAssistantOpen(false)} style={{ background: "transparent", border: 0, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <div className="demo-chat-body">
          {messages.map((message, index) => <div key={index} className={`demo-message ${message.role === "user" ? "user" : ""}`}>{message.text}</div>)}
        </div>
        <form onSubmit={answerAssistant}>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about this workspace..." />
          <button type="submit" aria-label="Send message"><Send size={15} /></button>
        </form>
      </div>}
    </div>
  );
}
