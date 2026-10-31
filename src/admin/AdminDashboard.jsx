
import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  BriefcaseBusiness,
  FolderKanban,
  MessageSquareText,
  Star,
  ArrowUpRight,
  RefreshCw,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

const formatDate = (date) => {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProjectName = (slug) =>
  (slug || "unknown-project")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    personalProjects: 0,
    publishedPersonalProjects: 0,
    clientProjects: 0,
    activeClientProjects: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
  });

  const [recentReviews, setRecentReviews] = useState([]);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [
        personalResult,
        publishedPersonalResult,
        clientResult,
        activeClientResult,
        reviewsResult,
        pendingResult,
        approvedResult,
        recentResult,
      ] = await Promise.all([
        supabase
          .from("personal_projects")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("personal_projects")
          .select("*", { count: "exact", head: true })
          .eq("published", true),

        supabase
          .from("client_projects")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("client_projects")
          .select("*", { count: "exact", head: true })
          .eq("active", true),

        supabase
          .from("client_reviews")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("client_reviews")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("client_reviews")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),

        supabase
          .from("client_reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const results = [
        personalResult,
        publishedPersonalResult,
        clientResult,
        activeClientResult,
        reviewsResult,
        pendingResult,
        approvedResult,
        recentResult,
      ];

      const failedResult = results.find((result) => result.error);

      if (failedResult) {
        throw failedResult.error;
      }

      setStats({
        personalProjects: personalResult.count || 0,
        publishedPersonalProjects: publishedPersonalResult.count || 0,
        clientProjects: clientResult.count || 0,
        activeClientProjects: activeClientResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        pendingReviews: pendingResult.count || 0,
        approvedReviews: approvedResult.count || 0,
      });

      setRecentReviews(recentResult.data || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (
        sessionError ||
        !data.session ||
        data.session.user.id !== ADMIN_UID
      ) {
        navigate("/admin", { replace: true });
        return;
      }

      await loadDashboard();
    };

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (
        event === "SIGNED_OUT" ||
        !session ||
        session.user.id !== ADMIN_UID
      ) {
        navigate("/admin", { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadDashboard]);

  const statCards = [
    {
      label: "PERSONAL PROJECTS",
      value: stats.personalProjects,
      detail: `${stats.publishedPersonalProjects} published`,
      icon: FolderKanban,
      link: "/admin/projects",
    },
    {
      label: "CLIENT PROJECTS",
      value: stats.clientProjects,
      detail: `${stats.activeClientProjects} active`,
      icon: BriefcaseBusiness,
      link: "/admin/client-work",
    },
    {
      label: "TOTAL REVIEWS",
      value: stats.totalReviews,
      detail: `${stats.approvedReviews} approved`,
      icon: Star,
      link: "/admin/reviews",
    },
    {
      label: "PENDING REVIEWS",
      value: stats.pendingReviews,
      detail: "Awaiting moderation",
      icon: MessageSquareText,
      link: "/admin/reviews",
      highlight: stats.pendingReviews > 0,
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={25} />
        <span>LOADING YOUR WORKSPACE</span>

        <style>{`
          .dashboard-loading {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            color: #aaa;
            font-size: 10px;
            letter-spacing: 2px;
          }

          .dashboard-loading svg {
            animation: dashboardSpin 1s linear infinite;
          }

          @keyframes dashboardSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="admin-dashboard">
      <style>{`
        .admin-dashboard {
          width: 100%;
          color: #f1f0ec;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 38px;
        }

        .dashboard-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #a99570;
          font-size: 10px;
          letter-spacing: 2px;
          margin-bottom: 16px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 54px);
          font-weight: 500;
          letter-spacing: -2.5px;
          line-height: 1;
        }

        .dashboard-header h1 em {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .dashboard-header p {
          margin: 14px 0 0;
          color: #858585;
          font-size: 13px;
          line-height: 1.7;
        }

        .dashboard-refresh {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          color: #ddd;
          background: #151515;
          border: 1px solid rgba(255,255,255,0.12);
          font: inherit;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .dashboard-refresh:hover {
          border-color: rgba(255,255,255,0.4);
          background: #202020;
        }

        .dashboard-refresh:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .dashboard-refresh .spinning {
          animation: dashboardSpin 1s linear infinite;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          margin-bottom: 24px;
          color: #e6a0a0;
          background: rgba(150,40,40,0.1);
          border: 1px solid rgba(200,80,80,0.2);
          font-size: 12px;
          line-height: 1.5;
        }

        .dashboard-section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          color: #777;
          font-size: 10px;
          letter-spacing: 1.8px;
        }

        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 48px;
        }

        .dashboard-stat-card {
          min-width: 0;
          min-height: 170px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.055),
            rgba(255,255,255,0.015)
          );
          border: 1px solid rgba(255,255,255,0.09);
          transition: 0.3s ease;
        }

        .dashboard-stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.07);
        }

        .dashboard-stat-card.highlight {
          border-color: rgba(194,157,101,0.35);
        }

        .dashboard-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .dashboard-stat-top span {
          color: #999;
          font-size: 9px;
          letter-spacing: 1.2px;
        }

        .dashboard-stat-icon {
          color: #b7a17d;
        }

        .dashboard-stat-number {
          display: block;
          margin-top: 18px;
          font-size: clamp(30px, 4vw, 43px);
          font-weight: 400;
          letter-spacing: -2px;
        }

        .dashboard-stat-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }

        .dashboard-stat-bottom span {
          color: #777;
          font-size: 10px;
        }

        .dashboard-stat-bottom svg {
          color: #888;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.8fr);
          gap: 22px;
          align-items: start;
        }

        .dashboard-panel {
          min-width: 0;
          padding: 24px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.09);
        }

        .dashboard-panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 19px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .dashboard-panel-heading h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .dashboard-panel-heading span {
          color: #777;
          font-size: 9px;
          letter-spacing: 1.2px;
        }

        .dashboard-panel-heading a {
          color: #b7a17d;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 0.7px;
        }

        .dashboard-review-list {
          display: flex;
          flex-direction: column;
        }

        .dashboard-review-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 17px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .dashboard-review-item:last-child {
          border-bottom: 0;
        }

        .dashboard-review-info {
          min-width: 0;
        }

        .dashboard-review-info strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 500;
        }

        .dashboard-review-info span {
          display: block;
          margin-top: 6px;
          color: #777;
          font-size: 10px;
        }

        .dashboard-review-status {
          flex-shrink: 0;
          padding: 6px 9px;
          color: #c6b18b;
          background: rgba(190,160,110,0.09);
          border: 1px solid rgba(190,160,110,0.18);
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .dashboard-review-status.approved {
          color: #9bbd9a;
          background: rgba(100,160,100,0.08);
          border-color: rgba(100,160,100,0.18);
        }

        .dashboard-review-status.rejected {
          color: #cf9292;
          background: rgba(170,70,70,0.08);
          border-color: rgba(170,70,70,0.18);
        }

        .dashboard-empty {
          padding: 30px 0;
          color: #777;
          text-align: center;
          font-size: 12px;
        }

        .dashboard-quick-links {
          display: flex;
          flex-direction: column;
          margin-top: 8px;
        }

        .dashboard-quick-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 0;
          color: #ddd;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: 0.2s ease;
        }

        .dashboard-quick-link:hover {
          color: #c9b38d;
        }

        .dashboard-quick-link-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dashboard-quick-link-main svg {
          color: #a99570;
        }

        .dashboard-quick-link-main span {
          font-size: 11px;
        }

        .dashboard-quick-link > svg {
          color: #777;
        }

        .dashboard-footer-note {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 45px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: #666;
          font-size: 9px;
          letter-spacing: 1.2px;
        }

        @media (max-width: 1100px) {
          .dashboard-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .dashboard-stat-grid {
            gap: 9px;
          }

          .dashboard-stat-card {
            min-height: 145px;
            padding: 14px;
          }

          .dashboard-stat-top span {
            font-size: 8px;
          }

          .dashboard-stat-number {
            font-size: 34px;
          }

          .dashboard-panel {
            padding: 17px;
          }

          .dashboard-footer-note {
            flex-direction: column;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            <span>✳</span>
            ADI / ADMIN OVERVIEW
          </span>

          <h1>
            YOUR <em>WORKSPACE.</em>
          </h1>

          <p>
            An overview of your portfolio, collaborations and client activity.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={refreshing ? "spinning" : ""}
          />
          {refreshing ? "REFRESHING..." : "REFRESH DATA"}
        </button>
      </header>

      {error && (
        <div className="dashboard-error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="dashboard-section-label">
        <span>01 / PORTFOLIO STATISTICS</span>
        <span>LIVE DATABASE DATA</span>
      </div>

      <div className="dashboard-stat-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              to={card.link}
              className={`dashboard-stat-card ${
                card.highlight ? "highlight" : ""
              }`}
              key={card.label}
            >
              <div className="dashboard-stat-top">
                <span>{card.label}</span>
                <Icon size={18} className="dashboard-stat-icon" />
              </div>

              <strong className="dashboard-stat-number">
                {String(card.value).padStart(2, "0")}
              </strong>

              <div className="dashboard-stat-bottom">
                <span>{card.detail}</span>
                <ArrowUpRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* LOWER DASHBOARD */}
      <div className="dashboard-section-label">
        <span>02 / ACTIVITY & MANAGEMENT</span>
        <span>WORKSPACE</span>
      </div>

      <div className="dashboard-main-grid">
        {/* RECENT REVIEWS */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>RECENT CLIENT REVIEWS</h2>
              <span>THE LATEST SUBMISSIONS</span>
            </div>

            <Link to="/admin/reviews">
              VIEW ALL ↗
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="dashboard-empty">
              No client reviews submitted yet.
            </div>
          ) : (
            <div className="dashboard-review-list">
              {recentReviews.map((review) => (
                <article
                  className="dashboard-review-item"
                  key={review.id}
                >
                  <div className="dashboard-review-info">
                    <strong>{review.reviewer_name}</strong>

                    <span>
                      {getProjectName(review.project_slug)}
                      {" · "}
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  <span
                    className={`dashboard-review-status ${review.status}`}
                  >
                    {review.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* QUICK MANAGEMENT */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>QUICK MANAGEMENT</h2>
              <span>JUMP INTO YOUR WORKSPACE</span>
            </div>
          </div>

          <div className="dashboard-quick-links">
            <Link
              to="/admin/projects"
              className="dashboard-quick-link"
            >
              <div className="dashboard-quick-link-main">
                <FolderKanban size={17} />
                <span>Personal Projects</span>
              </div>
              <ArrowUpRight size={15} />
            </Link>

            <Link
              to="/admin/client-work"
              className="dashboard-quick-link"
            >
              <div className="dashboard-quick-link-main">
                <BriefcaseBusiness size={17} />
                <span>Client Work</span>
              </div>
              <ArrowUpRight size={15} />
            </Link>

            <Link
              to="/admin/reviews"
              className="dashboard-quick-link"
            >
              <div className="dashboard-quick-link-main">
                <MessageSquareText size={17} />
                <span>Manage Reviews</span>
              </div>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="dashboard-footer-note">
        <span>ADITYA SINGH / PRIVATE WORKSPACE</span>
        <span>
          <Clock3 size={11} style={{ verticalAlign: "middle" }} />
          {" "}ALL TIMES IN IST
        </span>
      </footer>
    </section>
  );
}
