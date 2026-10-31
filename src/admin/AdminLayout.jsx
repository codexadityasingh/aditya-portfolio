
import { useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  MessageSquareText,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  UserRound,
  Settings2,
  Contact,
} from "lucide-react";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  // VERIFY ADMIN ACCESS
  useEffect(() => {
    let mounted = true;

    const verifyAdmin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        navigate("/admin", { replace: true });
        return;
      }

      if (data.session.user.id !== ADMIN_UID) {
        await supabase.auth.signOut();

        if (mounted) {
          navigate("/admin", { replace: true });
        }

        return;
      }

      setUserEmail(data.session.user.email || "");
      setLoading(false);
    };

    verifyAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        navigate("/admin", { replace: true });
        return;
      }

      if (session.user.id !== ADMIN_UID) {
        navigate("/admin", { replace: true });
        return;
      }

      setUserEmail(session.user.email || "");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // CLOSE MOBILE SIDEBAR AFTER NAVIGATION
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // LOGOUT
  const handleLogout = async () => {
    setLoggingOut(true);
    setAuthError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      setLoggingOut(false);
      return;
    }

    navigate("/admin", { replace: true });
  };

  // SIDEBAR NAVIGATION
  const navigation = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Personal Projects",
      path: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Client Work",
      path: "/admin/client-work",
      icon: BriefcaseBusiness,
    },
    {
      label: "Client Reviews",
      path: "/admin/reviews",
      icon: MessageSquareText,
    },
    {
      label: "About Page",
      path: "/admin/about",
      icon: UserRound,
    },
    {
      label: "Services & Pricing",
      path: "/admin/services",
      icon: Settings2,
    },
    {
      label: "Contact Page",
      path: "/admin/contact",
      icon: Contact,
    },
  ];

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="admin-layout-loading">
        <Loader2 size={27} />
        <p>VERIFYING ADMIN ACCESS</p>

        <style>{`
          .admin-layout-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            background: #090909;
            color: #c9b38d;
          }

          .admin-layout-loading svg {
            animation: adminLayoutSpin 1s linear infinite;
          }

          .admin-layout-loading p {
            color: #777;
            font-size: 10px;
            letter-spacing: 2px;
          }

          @keyframes adminLayoutSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <style>{`
        .admin-shell {
          min-height: 100vh;
          display: flex;
          background: #090909;
          color: #f1f0ec;
          font-family: inherit;
        }

        .admin-sidebar {
          width: 260px;
          min-width: 260px;
          min-height: 100vh;
          height: 100vh;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 100;
          background: #101010;
          border-right: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 8px 35px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .admin-brand-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.3);
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -1px;
        }

        .admin-brand-text strong {
          display: block;
          font-size: 13px;
          letter-spacing: 1.5px;
        }

        .admin-brand-text span {
          display: block;
          margin-top: 5px;
          color: #777;
          font-size: 9px;
          letter-spacing: 1.8px;
        }

        .admin-nav-label {
          margin: 32px 10px 14px;
          color: #666;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .admin-nav-link {
          min-height: 48px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          gap: 13px;
          color: #888;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.3px;
          border: 1px solid transparent;
          transition: 0.25s ease;
        }

        .admin-nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.04);
        }

        .admin-nav-link.active {
          color: #fff;
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.1);
        }

        .admin-nav-link.active svg {
          color: #d6c39b;
        }

        .admin-sidebar-bottom {
          margin-top: auto;
          padding-top: 25px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .admin-user-card {
          padding: 14px 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          min-width: 0;
        }

        .admin-user-avatar {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #24221d;
          color: #d6c39b;
        }

        .admin-user-info {
          min-width: 0;
        }

        .admin-user-info strong {
          display: block;
          font-size: 11px;
        }

        .admin-user-info span {
          display: block;
          max-width: 145px;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #777;
          font-size: 10px;
        }

        .admin-logout {
          width: 100%;
          min-height: 43px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 12px;
          padding: 0 13px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #999;
          font: inherit;
          font-size: 11px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .admin-logout:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        .admin-logout:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .admin-sidebar-footer {
          padding: 0 8px;
          color: #555;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .admin-main {
          flex: 1;
          min-width: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .admin-topbar {
          height: 76px;
          min-height: 76px;
          padding: 0 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .admin-topbar-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .admin-topbar-label {
          color: #777;
          font-size: 10px;
          letter-spacing: 1.8px;
        }

        .admin-live-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .admin-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9aaf88;
          box-shadow: 0 0 10px rgba(154,175,136,0.5);
        }

        .admin-content {
          flex: 1;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px;
        }

        .admin-mobile-menu {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
        }

        .admin-mobile-overlay {
          display: none;
        }

        .admin-view-site {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #888;
          text-decoration: none;
          font-size: 10px;
          letter-spacing: 1px;
          transition: color 0.2s ease;
        }

        .admin-view-site:hover {
          color: #fff;
        }

        .admin-auth-error {
          padding: 10px 12px;
          color: #e6a0a0;
          background: rgba(150,40,40,0.1);
          border: 1px solid rgba(200,80,80,0.2);
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 800px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100dvh;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .admin-sidebar.is-open {
            transform: translateX(0);
          }

          .admin-mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 90;
            background: rgba(0,0,0,0.7);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .admin-mobile-overlay.is-open {
            opacity: 1;
            pointer-events: auto;
          }

          .admin-mobile-menu {
            display: inline-flex;
          }

          .admin-topbar {
            padding: 0 20px;
          }

          .admin-content {
            padding: 28px 20px;
          }
        }

        @media (max-width: 480px) {
          .admin-live-status {
            font-size: 9px;
          }

          .admin-topbar-label {
            font-size: 9px;
          }

          .admin-content {
            padding: 24px 16px;
          }
        }
      `}</style>

      {/* MOBILE OVERLAY */}
      <div
        className={`admin-mobile-overlay ${
          sidebarOpen ? "is-open" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "is-open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-mark">AS.</div>

          <div className="admin-brand-text">
            <strong>ADITYA SINGH</strong>
            <span>ADMINISTRATION</span>
          </div>
        </div>

        <p className="admin-nav-label">WORKSPACE</p>

        <nav className="admin-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          {authError && (
            <div className="admin-auth-error" role="alert">
              {authError}
            </div>
          )}

          <div className="admin-user-card">
            <div className="admin-user-avatar">
              <ShieldCheck size={17} />
            </div>

            <div className="admin-user-info">
              <strong>Administrator</strong>
              <span>{userEmail}</span>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} />
            {loggingOut ? "SIGNING OUT..." : "SIGN OUT"}
          </button>

          <div className="admin-sidebar-footer">
            PRIVATE WORKSPACE · 2026
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <span className="admin-topbar-label">
              CONTROL CENTER
            </span>
          </div>

          <div className="admin-live-status">
            <span className="admin-live-dot" />
            SYSTEM ONLINE
          </div>

          <a
            href="/"
            className="admin-view-site"
            target="_blank"
            rel="noreferrer"
          >
            VIEW WEBSITE
            <ArrowUpRight size={13} />
          </a>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
