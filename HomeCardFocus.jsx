import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccountArt, ACCOUNT_DESIGNS } from "./bankCardVisuals";

const FLIGHT_MS = 1300;
const LEVITATE_MS = 7000;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Полноэкранный фокус карты: клон стартует ровно на месте карты и плавно перелетает в центр.
// Слой тумана повторяет подрезанный низ карты на Home, поэтому старт и приземление идут без рывка.
function HomeCardFocus({ account, rect, clipBottom = 0, onExitStart, onDone }) {
  const design = ACCOUNT_DESIGNS[account.designId] || ACCOUNT_DESIGNS[0];
  const cardRef = useRef(null);
  const artRef = useRef(null);
  const doneRef = useRef(false);
  const [centered, setCentered] = useState(false);
  const [closing, setClosing] = useState(false);

  const targetWidth = Math.min(window.innerWidth - 24, 384);
  const targetHeight = targetWidth * 200 / 320;
  const dx = (window.innerWidth - targetWidth) / 2 - rect.left;
  const dy = (window.innerHeight - targetHeight) / 2 - rect.top;
  const scale = targetWidth / rect.width;

  // Туман: 14px под картой (перекрывает тень) + подрезанная часть + 72px полосы как на Home
  const clip = Math.max(0, Math.round(clipBottom));
  const fogHeight = clip + 86;
  const fogSolid = ((14 + clip) / fogHeight) * 100;
  const fogMid = ((14 + clip + 31.7) / fogHeight) * 100;

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setCentered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Левитация через WAAPI: на закрытии гасим её с текущей фазы, чтобы не было щелчка
  useEffect(() => {
    const el = artRef.current;
    if (!el || !centered || prefersReducedMotion()) return undefined;
    const motion = el.animate([
      { transform: "translate3d(0px, 0px, 0px)" },
      { transform: "translate3d(0px, 9px, 0px)" },
      { transform: "translate3d(0px, -4px, 0px)" },
      { transform: "translate3d(0px, 0px, 0px)" },
    ], { duration: LEVITATE_MS, iterations: Infinity, easing: "ease-in-out", delay: FLIGHT_MS });
    return () => {
      const from = getComputedStyle(el).transform;
      motion.cancel();
      if (from && from !== "none") {
        el.animate([{ transform: from }, { transform: "translate3d(0px, 0px, 0px)" }],
          { duration: 340, easing: "cubic-bezier(.33, 0, .2, 1)", fill: "forwards" });
      }
    };
  }, [centered]);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  function close() {
    if (closing) return;
    setClosing(true);
    setCentered(false);
    onExitStart();
    const el = cardRef.current;
    if (!el) { finish(); return; }
    const onEnd = event => {
      if (event.target !== el || event.propertyName !== "transform") return;
      el.removeEventListener("transitionend", onEnd);
      finish();
    };
    el.addEventListener("transitionend", onEnd);
    setTimeout(finish, FLIGHT_MS + 300);
  }

  useEffect(() => {
    const onKey = event => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className={"hxr-focus-layer" + (closing ? " is-closing" : "")}
      style={{
        "--focus-from": design.gradient.from,
        "--focus-to": design.gradient.to,
        "--focus-glow": design.gradient.glow,
        "--focus-deep": design.gradient.deep,
      }}
      onClick={close}
      role="dialog"
      aria-label={account.label + " card"}
    >
      <div className={"hxr-focus-veil" + (centered ? " is-visible" : "")} aria-hidden="true" />
      <button
        ref={cardRef}
        type="button"
        className={"hxr-focus-card" + (centered ? " is-centered" : "")}
        style={{
          left: rect.left + "px",
          top: rect.top + "px",
          width: rect.width + "px",
          height: rect.height + "px",
          "--focus-dx": dx + "px",
          "--focus-dy": dy + "px",
          "--focus-scale": scale,
        }}
        onClick={event => { event.stopPropagation(); close(); }}
        aria-label="Return to Home"
      >
        <span className="hxr-focus-floor" aria-hidden="true" />
        <span className="hxr-focus-art" ref={artRef}><AccountArt designId={account.designId} /></span>
        <span
          className="hxr-focus-fog"
          aria-hidden="true"
          style={{
            height: fogHeight + "px",
            background: "linear-gradient(0deg, var(--hxr-bg) 0%, var(--hxr-bg) " + fogSolid.toFixed(1)
              + "%, color-mix(in srgb, var(--hxr-bg) 64%, transparent) " + fogMid.toFixed(1) + "%, transparent 100%)",
          }}
        />
      </button>
    </div>
  );
}

export { HomeCardFocus };
