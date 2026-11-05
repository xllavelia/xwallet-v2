import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AccountArt, ACCOUNT_DESIGNS } from "./bankCardVisuals";

// Полноэкранный фокус карты: клон стартует ровно на месте карты и плавно перелетает в центр.
function HomeCardFocus({ account, rect, onExitStart, onDone }) {
  const design = ACCOUNT_DESIGNS[account.designId] || ACCOUNT_DESIGNS[0];
  const cardRef = useRef(null);
  const doneRef = useRef(false);
  const [centered, setCentered] = useState(false);
  const [closing, setClosing] = useState(false);

  const targetWidth = Math.min(window.innerWidth - 24, 384);
  const targetHeight = targetWidth * 200 / 320;
  const dx = (window.innerWidth - targetWidth) / 2 - rect.left;
  const dy = (window.innerHeight - targetHeight) / 2 - rect.top;
  const scale = targetWidth / rect.width;

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setCentered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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
      if (event.propertyName !== "transform") return;
      el.removeEventListener("transitionend", onEnd);
      finish();
    };
    el.addEventListener("transitionend", onEnd);
    setTimeout(finish, 1100);
  }

  useEffect(() => {
    const onKey = event => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className="hxr-focus-layer"
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
        <span className="hxr-focus-art"><AccountArt designId={account.designId} /></span>
      </button>
    </div>
  );
}

export { HomeCardFocus };
