import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

var SESSION_KEY = "xw_session";
var TOKEN_KEY = "xw_token";
var API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

var SLIDES = [
  {
    eyebrow: "Welcome to XWallet",
    title: "Trade crypto without the noise",
    text: "Real-time markets, deep charts, and leverage up to 200x — all in one focused wallet."
  },
  {
    eyebrow: "Move money instantly",
    title: "Send USDT in seconds",
    text: "Find anyone by their ID and move funds instantly, anywhere in the app."
  },
  {
    eyebrow: "Progress that pays off",
    title: "Level up as you trade",
    text: "Earn XP, unlock Battle Pass rewards, and climb from Initiate to Legend."
  }
];

function LogoMark(props) {
  var cls = props.className || "";
  return (
    <svg className={cls} viewBox="0 0 1299 1536" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="70" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 462 350 C 465 510 466 670 470 820 C 472 900 475 970 478 1035"></path>
      <path d="M 660 360 C 663 520 665 680 670 830 C 675 920 680 1010 686 1085"></path>
      <path d="M 125 985 C 220 865 330 760 470 690 C 600 625 735 575 850 585 C 905 590 935 615 900 655 C 830 725 700 800 560 865 C 450 915 350 960 250 970"></path>
      <path d="M 245 970 C 330 975 405 970 470 970 C 545 970 615 1015 690 1085"></path>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="13 6 19 12 13 18"></polyline>
    </svg>
  );
}

function EyeIcon(props) {
  if (props.off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l18 18"></path>
        <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 9.5 6 9.5 7a12.6 12.6 0 0 1-3 3.6"></path>
        <path d="M6.6 6.6A12.6 12.6 0 0 0 2.5 12s3.5 7 9.5 7a9.9 9.9 0 0 0 4.4-1"></path>
        <path d="M9.5 9.8a3 3 0 0 0 4.2 4.2"></path>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"></polyline>
      <polyline points="23 20 23 14 17 14"></polyline>
      <path d="M20.5 9A9 9 0 0 0 4.6 5.6L1 10"></path>
      <path d="M3.5 15a9 9 0 0 0 15.9 3.4L23 14"></path>
    </svg>
  );
}

async function apiRegister(username, playerId, password) {
  console.log("[XWallet] POST", API_BASE + "/auth/register");
  var res = await fetch(API_BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, playerId: playerId, password: password })
  });
  var data = await res.json().catch(function () { return null; });
  console.log("[XWallet] register response", res.status, data);
  if (!res.ok) {
    var message = (data && data.error) ? data.error : ("Registration failed (" + res.status + ")");
    throw new Error(message);
  }
  return data;
}

async function apiLogin(identifier, password) {
  console.log("[XWallet] POST", API_BASE + "/auth/login");
  var res = await fetch(API_BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifier, password: password })
  });
  var data = await res.json().catch(function () { return null; });
  console.log("[XWallet] login response", res.status, data);
  if (!res.ok) {
    var message = (data && data.error) ? data.error : ("Login failed (" + res.status + ")");
    throw new Error(message);
  }
  return data;
}

async function apiGenerateId() {
  console.log("[XWallet] GET", API_BASE + "/auth/generate-id");
  var res = await fetch(API_BASE + "/auth/generate-id");
  var data = await res.json().catch(function () { return null; });
  console.log("[XWallet] generate-id response", res.status, data);
  if (!res.ok) {
    throw new Error("Could not generate an ID, try again");
  }
  return data.playerId;
}

const Welcome = () => {
  const navigate = useNavigate();

  var [stage, setStage] = useState("onboarding");
  var [slideIndex, setSlideIndex] = useState(0);
  var [mode, setMode] = useState("register");

  var [username, setUsername] = useState("");
  var [playerId, setPlayerId] = useState("");
  var [password, setPassword] = useState("");
  var [confirmPassword, setConfirmPassword] = useState("");
  var [loginId, setLoginId] = useState("");
  var [loginPassword, setLoginPassword] = useState("");
  var [showPassword, setShowPassword] = useState(false);
  var [error, setError] = useState(null);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [isGeneratingId, setIsGeneratingId] = useState(false);

  var slide = SLIDES[slideIndex];
  var isLastSlide = slideIndex === SLIDES.length - 1;
  var nextLabel = isLastSlide ? "Get Started" : "Next";

  function handleNextSlide() {
    if (isLastSlide) {
      setStage("auth");
      return;
    }
    setSlideIndex(slideIndex + 1);
  }

  function completeSession(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(SESSION_KEY, "1");
    navigate("/");
  }

  async function handleGenerateId() {
    setError(null);
    setIsGeneratingId(true);
    try {
      var id = await apiGenerateId();
      setPlayerId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingId(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^\d{6}$/.test(playerId)) {
      setError("Player ID must be exactly 6 digits");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      var data = await apiRegister(username.trim(), playerId, password);
      completeSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError(null);

    if (loginId.trim().length === 0 || loginPassword.length === 0) {
      setError("Enter your username/ID and password");
      return;
    }

    setIsSubmitting(true);
    try {
      var data = await apiLogin(loginId.trim(), loginPassword);
      completeSession(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  var modePillClass = "wlc-mode-pill " + mode;
  var submitLabel = isSubmitting ? "Please wait..." : (mode === "register" ? "Create Account" : "Log In");

  return (
    <div className="WelcomeContent">

      {stage === "onboarding" && (
        <div className="wlc-onboarding">

          <div className="wlc-scene">
            <div className="wlc-circle c1"></div>
            <div className="wlc-circle c2"></div>
            <div className="wlc-ring r1"></div>
            <div className="wlc-ring r2"></div>
            <div className="wlc-sparkle">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z"></path>
              </svg>
            </div>
            <div className="wlc-burst"></div>
            <div className="wlc-burst-dot"></div>
          </div>

          <div className="wlc-content">
            <div className="wlc-text-block" key={slideIndex}>
              <span className="wlc-eyebrow">{slide.eyebrow}</span>
              <h1 className="wlc-title">{slide.title}</h1>
              <p className="wlc-subtitle">{slide.text}</p>
            </div>

            <div className="wlc-footer">
              <div className="wlc-dots">
                {SLIDES.map(function (s, idx) {
                  return (
                    <span
                      key={idx}
                      className={"wlc-dot" + (idx === slideIndex ? " active" : "")}
                      onClick={() => setSlideIndex(idx)}
                    ></span>
                  );
                })}
              </div>
              <button className="wlc-next-btn" onClick={handleNextSlide}>
                {nextLabel}
                <ArrowIcon />
              </button>
            </div>
          </div>

        </div>
      )}

      {stage === "auth" && (
        <div className="wlc-auth">
          <div className="wlc-auth-glow"></div>

          <div className="wlc-auth-card">
            <LogoMark className="wlc-auth-logo" />
            <h2 className="wlc-auth-title">{mode === "register" ? "Create your account" : "Welcome back"}</h2>
            <p className="wlc-auth-subtitle">
              {mode === "register" ? "Set up your wallet in under a minute" : "Log in to continue trading"}
            </p>

            <div className="wlc-mode-toggle">
              <div className={modePillClass}></div>
              <button className={"wlc-mode-btn " + (mode === "register" ? "active" : "")} onClick={() => { setMode("register"); setError(null); }}>
                Register
              </button>
              <button className={"wlc-mode-btn " + (mode === "login" ? "active" : "")} onClick={() => { setMode("login"); setError(null); }}>
                Log In
              </button>
            </div>

            {error && <div className="wlc-error-banner">{error}</div>}

            {mode === "register" && (
              <form className="wlc-form" onSubmit={handleRegisterSubmit}>
                <div className="wlc-field">
                  <label className="wlc-label">Username</label>
                  <input
                    className="wlc-input"
                    type="text"
                    placeholder="e.g. xlavelia"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="wlc-field">
                  <label className="wlc-label">Player ID</label>
                  <div className="wlc-id-row">
                    <input
                      className="wlc-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6 digits"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                    <button type="button" className="wlc-generate-btn" onClick={handleGenerateId} disabled={isGeneratingId}>
                      <RefreshIcon />
                    </button>
                  </div>
                  <span className="wlc-hint">Digits only, exactly 6 characters</span>
                </div>

                <div className="wlc-field">
                  <label className="wlc-label">Password</label>
                  <div className="wlc-pass-row">
                    <input
                      className="wlc-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="wlc-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="wlc-field">
                  <label className="wlc-label">Confirm Password</label>
                  <input
                    className="wlc-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="wlc-submit-btn" disabled={isSubmitting}>{submitLabel}</button>
              </form>
            )}

            {mode === "login" && (
              <form className="wlc-form" onSubmit={handleLoginSubmit}>
                <div className="wlc-field">
                  <label className="wlc-label">Username or Player ID</label>
                  <input
                    className="wlc-input"
                    type="text"
                    placeholder="Username or 6-digit ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                </div>

                <div className="wlc-field">
                  <label className="wlc-label">Password</label>
                  <div className="wlc-pass-row">
                    <input
                      className="wlc-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button type="button" className="wlc-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                </div>

                <button type="submit" className="wlc-submit-btn" disabled={isSubmitting}>{submitLabel}</button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Welcome;