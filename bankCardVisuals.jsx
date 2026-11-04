import { useId } from "react";

const ACCOUNT_DESIGNS = [
  { id: 0, name: "Wave", light: "#414143", dark: "#171719" },
  { id: 1, name: "Facet", light: "#555558", dark: "#202022" },
  { id: 2, name: "Strata", light: "#969699", dark: "#49494d" },
  { id: 3, name: "Orbit", light: "#66666b", dark: "#28282c" },
  { id: 4, name: "Weave", light: "#78787c", dark: "#333337" },
  { id: 5, name: "Ripple", light: "#616167", dark: "#252529" },
  { id: 6, name: "Dune", light: "#85858a", dark: "#3d3d42" },
  { id: 7, name: "Prism", light: "#696970", dark: "#242429" },
  { id: 8, name: "Contour", light: "#929298", dark: "#424248" },
  { id: 9, name: "Eclipse", light: "#5c5c63", dark: "#1b1b20" },
];

function AccountArt({ designId = 0, className = "hxr-account-art" }) {
  const uid = "xac" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const design = ACCOUNT_DESIGNS[designId] || ACCOUNT_DESIGNS[0];
  const lines = Array.from({ length: 18 }, (_, i) => i);
  return (
    <svg className={className} viewBox="0 0 320 200" fill="none" aria-hidden="true" data-design={design.id}>
      <defs>
        <linearGradient id={uid} x1="16" y1="0" x2="300" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor={design.light} /><stop offset="1" stopColor={design.dark} /></linearGradient>
        <linearGradient id={uid + "s"} x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".16" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={uid + "r"}><stop stopColor="#d9d9e0" stopOpacity=".45" /><stop offset="1" stopColor="#d9d9e0" stopOpacity="0" /></radialGradient>
        <clipPath id={uid + "c"}><rect x="1" y="1" width="318" height="198" rx="23" /></clipPath>
      </defs>
      <g clipPath={"url(#" + uid + "c)"}>
        <rect width="320" height="200" fill={"url(#" + uid + ")"} />
        <g stroke="#e4e4eb" strokeOpacity=".19" strokeWidth="1.2">
          {design.id === 0 && lines.map(i => <path key={i} d={`M-30 ${48 + i * 7} C40 ${-20 + i * 7} 65 ${152 + i * 7} 140 ${60 + i * 7} S250 ${-20 + i * 7} 355 ${65 + i * 7}`} />)}
          {design.id === 1 && <><path d="M-20-20 100 100-20 220H85L208 100 85-20Z" fill="#000" fillOpacity=".28" stroke="none" /><path d="m98-20 122 120-122 120h70l125-120L168-20Z" fill="#fff" fillOpacity=".06" stroke="none" /><path d="m85-20 123 120L85 220" strokeOpacity=".32" /></>}
          {design.id === 2 && lines.map(i => <path key={i} d={`M-20 ${i * 13} H${68 + i * 6} L${150 + i * 5} ${i * 13 - 30} H350`} />)}
          {design.id === 3 && lines.slice(0, 12).map(i => <ellipse key={i} cx="198" cy="132" rx={32 + i * 12} ry={14 + i * 6} transform="rotate(-32 198 132)" />)}
          {design.id === 4 && <>{lines.map(i => <path key={"a" + i} d={`M${-80 + i * 24} -10  ${130 + i * 24} 210`} />)}{lines.map(i => <path key={"b" + i} d={`M${-80 + i * 24} 210 ${130 + i * 24} -10`} strokeOpacity=".09" />)}</>}
          {design.id === 5 && lines.map(i => <circle key={i} cx="252" cy="152" r={12 + i * 10} strokeOpacity={i % 3 === 0 ? ".33" : ".13"} />)}
          {design.id === 6 && lines.map(i => <path key={i} d={`M-20 ${140 + i * 5} C90 ${30 + i * 7} 125 ${215 + i * 3} 340 ${25 + i * 9}`} strokeOpacity=".25" />)}
          {design.id === 7 && <><path d="m76 160 96-136 90 136Z" fill="#fff" fillOpacity=".045" /><path d="m76 160 96-136v136H76Zm96-136 90 136-90-44Z" fill="#000" fillOpacity=".19" />{lines.slice(0, 9).map(i => <path key={i} d={`m${86 + i * 9} 160 ${86 - i * 9} -${122 - i * 9} ${82 - i * 8} ${122 - i * 9}`} />)}</>}
          {design.id === 8 && lines.map(i => <path key={i} d={`M${36 - i * 7} 210 C${-40 + i * 4} ${52 - i * 6} ${224 + i * 7} ${178 - i * 8} ${236 + i * 10} -20`} />)}
          {design.id === 9 && <><circle cx="204" cy="112" r="97" fill={"url(#" + uid + "r)"} stroke="none" /><circle cx="216" cy="106" r="62" fill={design.dark} strokeOpacity=".35" />{lines.slice(0, 10).map(i => <path key={i} d={`M${75 + i * 4} 205  ${170 + i * 5} 10`} strokeOpacity=".07" />)}</>}
        </g>
        <rect width="320" height="200" fill={"url(#" + uid + "s)"} />
        <text x="22" y="31" fill="#f0f1f3" fillOpacity=".78" fontSize="12" fontFamily="sans-serif" letterSpacing="1.5">xwallet</text>
        <rect x="275" y="18" width="25" height="29" rx="8" fill="#ededf1" fillOpacity=".9" />
        <path d="m282 26 11 13m0-13-11 13" stroke={design.dark} strokeWidth="2.5" strokeLinecap="round" />
        <text x="22" y="177" fill="#ededf1" fillOpacity=".6" fontSize="10" fontFamily="sans-serif" letterSpacing="2">{design.name.toUpperCase()}</text>
        <text x="276" y="177" fill="#ededf1" fillOpacity=".5" fontSize="10" fontFamily="sans-serif">{String(design.id + 1).padStart(2, "0")}</text>
      </g>
    </svg>
  );
}

export { AccountArt, ACCOUNT_DESIGNS };
