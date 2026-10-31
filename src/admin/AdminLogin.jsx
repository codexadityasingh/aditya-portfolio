
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  ArrowUpRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const ADMIN_UID = "c30c2471-a7cf-4f11-8102-98f9c12c214e";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (data.session?.user?.id === ADMIN_UID) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      setChecking(false);
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;

      if (data.user?.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        throw new Error(
          "This account does not have administrator access."
        );
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="adi-login-loading">
        <Loader2 size={25} />
        <span>VERIFYING ACCESS</span>
        <LoginStyles />
      </div>
    );
  }

  return (
    <main className="adi-login-page">
      <LoginStyles />

      <div className="adi-login-grain" />

      <div className="adi-login-orb adi-orb-one" />
      <div className="adi-login-orb adi-orb-two" />

      <header className="adi-login-header">
        <a href="/" className="adi-login-logo">
          <span>AS.</span>
          <span>ADITYA SINGH</span>
        </a>

        <div className="adi-header-status">
          <span />
          PRIVATE WORKSPACE
        </div>
      </header>

      <section className="adi-login-main">
        <div className="adi-login-card">

          <div className="adi-login-topline">
            <span>ADMINISTRATION / 001</span>
            <ShieldCheck size={17} />
          </div>

          <div className="adi-login-icon">
            <LockKeyhole size={22} strokeWidth={1.5} />
          </div>

          <p className="adi-login-eyebrow">
            WELCOME BACK
          </p>

          <h1>
            Your work.
            <br />
            Your <span>control.</span>
          </h1>

          <p className="adi-login-description">
            Sign in to manage your projects, collaborations
            and client experiences.
          </p>

          <form onSubmit={handleLogin}>

            <div className="adi-login-field">
              <label htmlFor="admin-email">
                EMAIL ADDRESS
              </label>

              <div className="adi-input-wrap">
                <Mail size={17} />

                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="adi-login-field">
              <label htmlFor="admin-password">
                PASSWORD
              </label>

              <div className="adi-input-wrap">
                <LockKeyhole size={17} />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="adi-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword
                    ? <EyeOff size={17} />
                    : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="adi-login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="adi-login-submit"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading ? "AUTHENTICATING..." : "ENTER DASHBOARD"}
              </span>

              {loading
                ? <Loader2 size={17} className="adi-spinner" />
                : <ArrowUpRight size={18} />}
            </button>
          </form>

          <div className="adi-login-security">
            <LockKeyhole size={13} />
            <span>ENCRYPTED SESSION · AUTHORIZED ACCESS ONLY</span>
          </div>
        </div>
      </section>

      <footer className="adi-login-footer">
        <span>© 2026 ADITYA SINGH</span>
        <span>BUILT WITH INTENTION.</span>
        <span>ADMIN PORTAL / 01</span>
      </footer>
    </main>
  );
}

function LoginStyles() {
  return (
    <style>{`
      .adi-login-page {
        --adi-gold: #c9b38d;
        --adi-muted: #85817a;
        position: relative;
        isolation: isolate;
        min-height: 100vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 30px 5.5%;
        background:
          radial-gradient(ellipse at 50% 48%, #191816 0%, #10100f 38%, #090909 78%);
        color: #f4f1eb;
        font-family: inherit;
      }

      .adi-login-grain {
        position: absolute;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        opacity: 0.12;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.23'/%3E%3C/svg%3E");
      }

      .adi-login-orb {
        position: absolute;
        z-index: -1;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        filter: blur(120px);
        pointer-events: none;
        opacity: 0.11;
      }

      .adi-orb-one {
        top: 8%;
        left: -180px;
        background: #b79c6c;
      }

      .adi-orb-two {
        bottom: -200px;
        right: -100px;
        background: #78684c;
      }

      .adi-login-header,
      .adi-login-footer {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .adi-login-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #f5f2eb;
        text-decoration: none;
        font-size: 10px;
        letter-spacing: 2px;
      }

      .adi-login-logo span:first-child {
        display: grid;
        place-items: center;
        width: 39px;
        height: 39px;
        border: 1px solid rgba(201,179,141,.5);
        color: var(--adi-gold);
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -1px;
      }

      .adi-header-status {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #8c8982;
        font-size: 9px;
        letter-spacing: 1.8px;
      }

      .adi-header-status span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #9caa83;
        box-shadow: 0 0 12px #9caa83;
      }

      .adi-login-main {
        position: relative;
        z-index: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 55px 0;
      }

      .adi-login-card {
        width: 100%;
        max-width: 470px;
        padding: 36px 40px 30px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 3px;
        background: linear-gradient(
          145deg,
          rgba(255,255,255,.065),
          rgba(255,255,255,.018)
        );
        box-shadow:
          0 35px 100px rgba(0,0,0,.4),
          inset 0 1px rgba(255,255,255,.045);
        backdrop-filter: blur(18px);
        animation: adiCardEnter .8s cubic-bezier(.2,.7,.2,1) both;
      }

      @keyframes adiCardEnter {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .adi-login-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 19px;
        border-bottom: 1px solid rgba(255,255,255,.09);
        color: #817e77;
        font-size: 9px;
        letter-spacing: 1.8px;
      }

      .adi-login-topline svg {
        color: var(--adi-gold);
      }

      .adi-login-icon {
        width: 48px;
        height: 48px;
        margin-top: 31px;
        display: grid;
        place-items: center;
        color: var(--adi-gold);
        background: rgba(201,179,141,.09);
        border: 1px solid rgba(201,179,141,.24);
      }

      .adi-login-eyebrow {
        margin: 26px 0 12px;
        color: var(--adi-gold);
        font-size: 9px;
        letter-spacing: 2.5px;
      }

      .adi-login-card h1 {
        margin: 0;
        color: #f4f1eb;
        font-size: clamp(38px, 5vw, 54px);
        line-height: 1.08;
        font-weight: 500;
        letter-spacing: -2.8px;
      }

      .adi-login-card h1 span {
        color: var(--adi-gold);
        font-family: Georgia, serif;
        font-style: italic;
        font-weight: 400;
      }

      .adi-login-description {
        max-width: 350px;
        margin: 17px 0 30px;
        color: #99958d;
        font-size: 12px;
        line-height: 1.8;
      }

      .adi-login-field {
        margin-bottom: 21px;
      }

      .adi-login-field label {
        display: block;
        margin-bottom: 10px;
        color: #c1bdb4;
        font-size: 9px;
        letter-spacing: 1.5px;
      }

      .adi-input-wrap {
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 15px;
        border: 1px solid rgba(255,255,255,.11);
        background: rgba(0,0,0,.2);
        transition: border-color .25s ease, background .25s ease;
      }

      .adi-input-wrap:focus-within {
        border-color: rgba(201,179,141,.65);
        background: rgba(0,0,0,.32);
      }

      .adi-input-wrap > svg {
        flex-shrink: 0;
        color: #77736b;
      }

      .adi-input-wrap input {
        width: 100%;
        min-width: 0;
        height: 50px;
        border: 0;
        outline: 0;
        background: transparent;
        color: #f3f0e9;
        font-family: inherit;
        font-size: 12px;
      }

      .adi-input-wrap input::placeholder {
        color: #66635e;
      }

      .adi-password-toggle {
        display: grid;
        place-items: center;
        padding: 5px;
        border: 0;
        background: transparent;
        color: #85817a;
        cursor: pointer;
      }

      .adi-password-toggle:hover {
        color: var(--adi-gold);
      }

      .adi-login-submit {
        width: 100%;
        min-height: 53px;
        margin-top: 6px;
        padding: 0 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid var(--adi-gold);
        background: var(--adi-gold);
        color: #15130f;
        font-family: inherit;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.3px;
        cursor: pointer;
        transition: background .25s ease, color .25s ease;
      }

      .adi-login-submit:hover:not(:disabled) {
        background: transparent;
        color: var(--adi-gold);
      }

      .adi-login-submit:disabled {
        opacity: .65;
        cursor: wait;
      }

      .adi-spinner {
        animation: adiSpin 1s linear infinite;
      }

      @keyframes adiSpin {
        to { transform: rotate(360deg); }
      }

      .adi-login-error {
        margin: 0 0 16px;
        padding: 12px;
        border: 1px solid rgba(220,90,90,.25);
        background: rgba(140,35,35,.12);
        color: #e5a5a0;
        font-size: 11px;
        line-height: 1.6;
      }

      .adi-login-security {
        margin-top: 23px;
        padding-top: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-top: 1px solid rgba(255,255,255,.08);
        color: #77736b;
        font-size: 8px;
        letter-spacing: 1.1px;
      }

      .adi-login-security svg {
        color: var(--adi-gold);
      }

      .adi-login-footer {
        color: #69665f;
        font-size: 8px;
        letter-spacing: 1.3px;
      }

      .adi-login-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        background: #0b0b0a;
        color: var(--adi-gold);
        font-size: 9px;
        letter-spacing: 2px;
      }

      .adi-login-loading svg {
        animation: adiSpin 1s linear infinite;
      }

      @media (max-width: 600px) {
        .adi-login-page {
          min-height: 100svh;
          padding: 20px;
        }

        .adi-login-card {
          padding: 27px 23px 23px;
        }

        .adi-login-card h1 {
          font-size: 43px;
        }

        .adi-login-footer span:nth-child(2) {
          display: none;
        }

        .adi-header-status {
          font-size: 8px;
          letter-spacing: 1px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .adi-login-card {
          animation: none;
        }
      }
    `}</style>
  );
}
