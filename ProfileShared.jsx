import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AccountArt, CARD_COLORS } from "./bankCardVisuals";

// Единая линейная семья иконок: 24-сетка, одинаковый штрих и скругления.
export function ProfileIcon({ name, className = "", ...props }) {
  const paths = {
    back: <path d="M14.5 5 7.5 12l7 7" />,
    arrow: <path d="m9.5 5 7 7-7 7" />,
    chevron: <path d="m9 6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: (
      <>
        <path d="M4.5 19.5 5 16l10-10 3 3L8 19l-3.5.5Z" />
        <path d="m13.5 7.5 3 3" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4Z" />
        <circle cx="12" cy="13.5" r="3.2" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3.5a8.5 8.5 0 1 0 0 17h1.6a1.8 1.8 0 0 0 0-3.6h-.8a1.9 1.9 0 0 1 0-3.8H17c3.4 0 3.9-9.6-5-9.6Z" />
        <circle cx="8" cy="9" r=".8" />
        <circle cx="11" cy="6.5" r=".8" />
        <circle cx="14.5" cy="7.5" r=".8" />
      </>
    ),
    settings: (
      <>
        <path d="M5 7h14M5 12h14M5 17h14" />
        <circle cx="9" cy="7" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    qr: (
      <>
        <rect x="3.5" y="3.5" width="6" height="6" rx="1.2" />
        <rect x="14.5" y="3.5" width="6" height="6" rx="1.2" />
        <rect x="3.5" y="14.5" width="6" height="6" rx="1.2" />
        <path d="M14.5 14.5H17v2.5h2.5M14.5 20.5h3M20.5 17v3.5M11 11v2M11 17h1.5" />
      </>
    ),
    scan: (
      <>
        <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
        <path d="M4 12h16" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 14.8c2 .6 3.5 2.3 3.5 4.7" />
      </>
    ),
    "person-plus": (
      <>
        <circle cx="9.5" cy="8" r="3.4" />
        <path d="M3.5 20c0-3.3 2.7-5.7 6-5.7 1.6 0 3 .6 4 1.6" />
        <path d="M18 13.5v6M15 16.5h6" />
      </>
    ),
    add: (
      <>
        <circle cx="8.5" cy="8" r="3.2" />
        <path d="M3 20c0-3.2 2.5-5.5 5.5-5.5 1.4 0 2.7.5 3.7 1.4" />
        <path d="M17.5 13.5v6M14.5 16.5h6" />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2.5" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
        <path d="M12 14v2.5" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3.5v5.3c0 5-8 9.2-8 9.2s-8-4.2-8-9.2V6.5Z" />
        <path d="m8.5 12 2.5 2.5 4.5-5" />
      </>
    ),
    gift: (
      <>
        <rect x="3.5" y="8.5" width="17" height="4.5" rx="1" />
        <path d="M5.5 13v7.5h13V13M12 8.5v12" />
        <path d="M12 8.5H9A2.5 2.5 0 1 1 11.5 6L12 8.5Zm0 0h3A2.5 2.5 0 1 0 12.5 6L12 8.5Z" />
      </>
    ),
    wallet: (
      <>
        <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
        <path d="M3.5 9.5h17" />
        <circle cx="16.5" cy="14.5" r="1" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.3-3.6-8.5S9.6 5.8 12 3.5Z" />
      </>
    ),
    trophy: (
      <>
        <path d="M7.5 4h9v6a4.5 4.5 0 0 1-9 0Z" />
        <path d="M7.5 6H4v2a3.5 3.5 0 0 0 3.5 3.5M16.5 6H20v2a3.5 3.5 0 0 1-3.5 3.5M12 14.5V19M8.5 20h7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    news: (
      <>
        <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
        <path d="M7 8.5h10M7 12h6M7 15.5h10" />
      </>
    ),
    copy: (
      <>
        <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
        <path d="M16 8.5v-4H3.5v12.5H8" />
      </>
    ),
    logout: <path d="M10 4H4v16h6M14.5 8l4 4-4 4M8 12h10.5" />,
    trash: <path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20h9l1-13.5M10 10v6M14 10v6" />,
    mail: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    spark: <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z" />,
    chart: (
      <>
        <path d="M3.5 20.5V4M3.5 20.5h17" />
        <path d="m7 16 4-5 3 2.2 5-6" />
      </>
    ),
    reset: <path d="M4 10.5A8.5 8.5 0 1 1 5 17M4 4.5v6h6" />,
    send: (
      <>
        <path d="M21 3 3.5 10.5l7 2.5 2.5 7Z" />
        <path d="m10.5 13 4.5-4.5" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.spark}
    </svg>
  );
}

// Старые темы из истории кейсов показываем как ближайшие дизайны карточек.
const LEGACY_CARD = {
  "theme-sage": "card-sage",
  "theme-dusk": "card-dusk",
  "theme-silver": "card-silver",
  "theme-gold": "card-gold",
  "theme-platinum": "card-platinum",
  "theme-supernova": "card-supernova",
  "theme-nebula": "card-nebula",
  "theme-coral": "card-coral",
  "theme-glacier": "card-glacier",
  "theme-aurora": "card-aurora",
  "theme-ember": "card-ember",
  "theme-prism": "card-prism",
  "theme-cocoa": "card-cocoa",
  "theme-olive": "card-olive",
  "theme-silk": "card-silk",
};

export function CosmeticRewardArt({ reward }) {
  if (!reward) return null;
  if (reward.kind === "custom" || reward.voucher) {
    return (
      <span className="pf-reward-art pf-reward-art--voucher">
        <ProfileIcon name="palette" />
        <em>{reward.value ? "-" + reward.value + "%" : "FREE"}</em>
      </span>
    );
  }
  let id = reward.cosmetic || "";
  if (!id || !id.startsWith("card-")) id = LEGACY_CARD[id] || "";
  if (!id || !CARD_COLORS[id]) return null;
  return (
    <span className="pf-reward-art">
      <AccountArt designKey={id} compact />
    </span>
  );
}

export function ProfileAvatar({ profile, className = "" }) {
  const photo = profile?.avatarUrl;
  const initial = (profile?.username || "X").slice(0, 1).toUpperCase();
  return (
    <span className={"pf-avatar " + className}>
      {photo?.startsWith("data:image/jpeg;base64,") ? <img src={photo} alt="" /> : <span>{initial}</span>}
    </span>
  );
}

// Баннер 3:1, поверх — ручки редактирования; ниже аватар, ник и @id.
export function ProfileHero({ profile, actions, children, compact = false }) {
  const banner = profile?.bannerUrl || "";
  return (
    <section className={"pf-hero" + (compact ? " pf-hero--compact" : "")}>
      <div className="pf-hero-banner">
        {banner.startsWith("data:image/jpeg;base64,") ? <img src={banner} alt="" /> : <span className="pf-hero-banner-empty" aria-hidden="true" />}
        {actions ? <div className="pf-hero-actions">{actions}</div> : null}
      </div>
      <div className="pf-hero-identity">
        <ProfileAvatar profile={profile} />
        <div className="pf-hero-names">
          <h1>{profile?.username || "Player " + (profile?.playerId || "")}{profile?.isAdmin ? <em>team</em> : null}</h1>
          <p>@{profile?.playerId}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ProfileModal({ title, onClose, children, className = "" }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const root = document.getElementById("root");
    const priorInert = root?.inert;
    const priorFocus = document.activeElement;
    const priorOverflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = "hidden";
    ref.current.querySelector("button, input")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const nodes = [...ref.current.querySelectorAll("button:not(:disabled), input:not(:disabled), textarea, a[href], [tabindex='0']")].filter((node) => node.getClientRects().length);
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault();
        nodes.at(-1)?.focus();
      }
      if (!event.shiftKey && document.activeElement === nodes.at(-1)) {
        event.preventDefault();
        nodes[0]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      if (root) root.inert = priorInert;
      document.body.style.overflow = priorOverflow;
      document.removeEventListener("keydown", onKey);
      if (priorFocus?.isConnected) priorFocus.focus();
    };
  }, []);
  return createPortal(
    <div className="pf-modal-backdrop" onClick={onClose}>
      <section
        className={"pf-modal " + className}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button type="button" className="pf-modal-close" onClick={onClose} aria-label="Close">
            <ProfileIcon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}

export const qrPayload = (playerId) => (/^\d{6}$/.test(playerId) ? "XWPROFILE:" + playerId : "");
export const parseProfileQr = (text) => (/^XWPROFILE:\d{6}$/.test(text || "") ? text.slice(10) : null);

export function QRSheet({ profile, onClose }) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    import("qrcode")
      .then((module) =>
        (module.default || module).toDataURL(qrPayload(profile.playerId), {
          width: 320,
          margin: 3,
          errorCorrectionLevel: "M",
          color: {
            dark: "#101010",
            light: "#ffffff",
          },
        }),
      )
      .then((url) => {
        if (active) setImage(url);
      })
      .catch(() => {
        if (active) setError("Could not generate your code.");
      });
    return () => {
      active = false;
    };
  }, [profile.playerId]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.playerId);
      setCopied(true);
    } catch {
      setError("Could not copy. Your ID is shown below.");
    }
  };
  return (
    <ProfileModal title="Your player code" onClose={onClose} className="pf-qr-sheet">
      <div className="pf-qr-identity">
        <ProfileAvatar profile={profile} />
        <strong>{profile.username}</strong>
        <small>Player ID {profile.playerId}</small>
      </div>
      {image ? <img className="pf-qr-image" src={image} alt={"Player code for " + profile.playerId} /> : <p className="pf-helper">{error || "Creating your code…"}</p>}
      <p className="pf-helper">Scan this inside Community to open your profile. It is an xwallet identity, not a website link.</p>
      <button type="button" className="pf-primary" onClick={copy}>
        <ProfileIcon name="copy" />
        {copied ? "ID copied" : "Copy player ID"}
      </button>
      {error && image ? (
        <p className="pf-error" role="alert">
          {error}
        </p>
      ) : null}
    </ProfileModal>
  );
}

export function ScannerSheet({ onClose, onFound }) {
  const video = useRef(null);
  const stream = useRef(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const choose = (text) => {
    const id = parseProfileQr(text);
    if (id) {
      onFound(id);
      return true;
    }
    setError("Use a player code created in xwallet.");
    return false;
  };
  useEffect(() => {
    if (!running) return;
    let stopped = false;
    let frame = 0;
    let last = 0;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const start = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
        });
        if (stopped) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream.current = media;
        video.current.srcObject = media;
        await video.current.play();
        const { default: jsQR } = await import("jsqr");
        const scan = (time) => {
          if (stopped) return;
          if (time - last > 180 && video.current?.readyState >= 2) {
            last = time;
            canvas.width = 480;
            canvas.height = 480;
            ctx.drawImage(video.current, 0, 0, 480, 480);
            const pixels = ctx.getImageData(0, 0, 480, 480);
            const result = jsQR(pixels.data, 480, 480, { inversionAttempts: "dontInvert" });
            if (result && parseProfileQr(result.data)) {
              stopped = true;
              media.getTracks().forEach((track) => track.stop());
              onFound(parseProfileQr(result.data));
              return;
            }
          }
          frame = requestAnimationFrame(scan);
        };
        frame = requestAnimationFrame(scan);
      } catch {
        if (!stopped) {
          setError("Camera is unavailable. Upload a code image or enter an ID.");
          setRunning(false);
        }
      }
    };
    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
    };
  }, [running, onFound]);
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image under 8 MB.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file, { resizeWidth: 1000, resizeHeight: 1000, resizeQuality: "high" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const { default: jsQR } = await import("jsqr");
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(pixels.data, pixels.width, pixels.height);
      if (!result) setError("No QR code found in this image.");
      else choose(result.data);
    } catch {
      setError("Could not read this image.");
    }
  };
  const openCamera = () => {
    setError("");
    const tg = window.Telegram?.WebApp;
    if (tg?.isVersionAtLeast?.("6.4") && tg.showScanQrPopup) {
      tg.showScanQrPopup({ text: "Scan an xwallet player code" }, (text) => {
        const id = parseProfileQr(text);
        if (id) {
          tg.closeScanQrPopup();
          onFound(id);
          return true;
        }
        setError("This is not an xwallet player code.");
        return false;
      });
    } else {
      setRunning(true);
    }
  };
  useEffect(() => () => window.Telegram?.WebApp?.closeScanQrPopup?.(), []);
  return (
    <ProfileModal title="Find a player" onClose={onClose}>
      <p className="pf-helper">Scan an xwallet code, choose a screenshot, or enter the six-digit player ID.</p>
      {running ? (
        <video className="pf-scanner" ref={video} muted playsInline />
      ) : (
        <button type="button" className="pf-scan-launch" onClick={openCamera}>
          <ProfileIcon name="scan" />
          <span>Open camera</span>
        </button>
      )}
      <label className="pf-secondary pf-upload-label">
        <ProfileIcon name="news" />
        Choose code image
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
      </label>
      <form
        className="pf-id-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (/^\d{6}$/.test(manual)) onFound(manual);
          else setError("Enter the six-digit player ID.");
        }}
      >
        <label>
          Player ID
          <input
            inputMode="numeric"
            value={manual}
            maxLength={6}
            onChange={(event) => setManual(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </label>
        <button type="submit" className="pf-primary">
          Open profile
        </button>
      </form>
      {error ? (
        <p className="pf-error" role="alert">
          {error}
        </p>
      ) : null}
    </ProfileModal>
  );
}

export function MenuRow({ icon, title, subtitle, onClick, tail }) {
  return (
    <button type="button" className="pf-menu-row" onClick={onClick}>
      <span className="pf-menu-icon">
        <ProfileIcon name={icon} />
      </span>
      <span className="pf-menu-copy">
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
      </span>
      {tail || <ProfileIcon name="chevron" className="pf-chevron" />}
    </button>
  );
}

export const usd = (value) => "$" + Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
