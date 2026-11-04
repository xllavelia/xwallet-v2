import { useId } from "react";

// Пять градиентных дизайнов без узоров: только мягкие цветовые переходы и свет.
const ACCOUNT_DESIGNS = [
  { id: 0, name: "Send", ink: "#ffffff", accent: "#ff6f8e", gradient: { from: "#ffb35c", to: "#e8447f", glow: "#ffd36e", deep: "#b32b66" } },
  { id: 1, name: "Lime", ink: "#17321c", accent: "#8fdc4f", gradient: { from: "#e7fa8a", to: "#2fa463", glow: "#f4ffb8", deep: "#1c7a4c" } },
  { id: 2, name: "Space", ink: "#ffffff", accent: "#8b6cf0", gradient: { from: "#8e6df0", to: "#241a52", glow: "#b79bff", deep: "#140f33" } },
  { id: 3, name: "Sky", ink: "#ffffff", accent: "#41a8f5", gradient: { from: "#9fe4ff", to: "#2f6fe4", glow: "#c9f2ff", deep: "#1c4bb8" } },
  { id: 4, name: "Dark", ink: "#ffffff", accent: "#5b5f68", gradient: { from: "#4a4f59", to: "#101114", glow: "#6d7480", deep: "#050506" } },
];

function AccountArt({ designId = 0, className = "hxr-account-art" }) {
  const uid = "xac" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const design = ACCOUNT_DESIGNS[designId] || ACCOUNT_DESIGNS[0];
  const g = design.gradient;
  return (
    <svg className={className} viewBox="0 0 320 200" fill="none" aria-hidden="true" data-design={design.id}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="320" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor={g.from} /><stop offset="1" stopColor={g.to} /></linearGradient>
        <radialGradient id={uid + "a"} cx="15%" cy="0%" r="95%"><stop stopColor={g.glow} stopOpacity=".9" /><stop offset="1" stopColor={g.glow} stopOpacity="0" /></radialGradient>
        <radialGradient id={uid + "b"} cx="92%" cy="105%" r="105%"><stop stopColor={g.deep} stopOpacity=".85" /><stop offset="1" stopColor={g.deep} stopOpacity="0" /></radialGradient>
        <linearGradient id={uid + "s"} x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".2" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id={uid + "c"}><rect x="1" y="1" width="318" height="198" rx="23" /></clipPath>
      </defs>
      <g clipPath={"url(#" + uid + "c)"}>
        <rect width="320" height="200" fill={"url(#" + uid + ")"} />
        <rect width="320" height="200" fill={"url(#" + uid + "a)"} />
        <rect width="320" height="200" fill={"url(#" + uid + "b)"} />
        <rect width="320" height="200" fill={"url(#" + uid + "s)"} />
        <text x="22" y="31" fill={design.ink} fillOpacity=".85" fontSize="12" fontFamily="sans-serif" letterSpacing="1.5">xwallet</text>
        <rect x="275" y="18" width="25" height="29" rx="8" fill={design.ink} fillOpacity=".18" />
        <path d="m282 26 11 13m0-13-11 13" stroke={design.ink} strokeOpacity=".85" strokeWidth="2.5" strokeLinecap="round" />
        <text x="22" y="177" fill={design.ink} fillOpacity=".62" fontSize="10" fontFamily="sans-serif" letterSpacing="2">{design.name.toUpperCase()}</text>
        <text x="276" y="177" fill={design.ink} fillOpacity=".5" fontSize="10" fontFamily="sans-serif">{String(design.id + 1).padStart(2, "0")}</text>
      </g>
    </svg>
  );
}

export { AccountArt, ACCOUNT_DESIGNS };
