import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Icon } from "./icons";

// PageTransition держит transform, поэтому fixed-оверлеи выносим в body
export function NftPortal({ children }) {
  return createPortal(children, document.body);
}

// Назад по истории, а при прямом заходе — на запасной маршрут
export function useNftBack(fallback) {
  const navigate = useNavigate();
  return function () {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
}

// Редкости по возрастанию ценности; цвета живут в CSS через классы nft-r-*.
export const RARITIES = ["common", "uncommon", "rare", "epic", "mythic", "legendary"];

export function rarityTitle(r) {
  if (!r) return "Pack";
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function rarityRank(r) {
  return RARITIES.indexOf(r);
}

export function money(v) {
  const n = Number(v) || 0;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(v) {
  const n = Number(v) || 0;
  if (n >= 10000) return "$" + (n / 1000).toFixed(1) + "k";
  return money(n);
}

// Доход в час бывает очень маленьким — точность растёт по мере уменьшения суммы.
export function perHour(v) {
  const n = Number(v) || 0;
  const digits = n >= 1 ? 2 : n >= 0.01 ? 3 : 4;
  return "$" + n.toFixed(digits) + "/h";
}

export function pendingText(v) {
  const n = Number(v) || 0;
  return "$" + n.toFixed(n >= 100 ? 2 : 4);
}

export function formatLeft(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return d + "d " + h + "h";
  if (h > 0) return h + "h " + m + "m";
  return m + "m " + (s % 60) + "s";
}

export function useNow(interval) {
  const [now, setNow] = useState(Date.now());
  useEffect(function () {
    const id = window.setInterval(function () { setNow(Date.now()); }, interval || 1000);
    return function () { window.clearInterval(id); };
  }, [interval]);
  return now;
}

// Блокировка прокрутки и Escape для оверлеев
export function useOverlayLock(open, onClose) {
  useEffect(function () {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = function (e) { if (e.key === "Escape" && onClose) onClose(); };
    window.addEventListener("keydown", onKey);
    return function () {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

/* ---------- Пиксель-арт ---------- */

// Спрайты 12×12: левая половина (6 символов), правая зеркалится.
// o контур, a основной, b тень, c светлый, d акцент, e глаз, w блик
const SPRITES = {
  cat: ["......", ".o....", ".oo...", ".oaooo", "oaaaaa", "oaweaa", "oaeeaa", "odaaad", "oaaaaa", ".oaccc", ".oaccc", "..oooo"],
  owl: ["o.....", "oo....", "oaoooo", "occcca", "ocweca", "occccd", "oaaaad", "obaccc", "obacbc", "obaccc", ".obaaa", "..oooo"],
  fox: ["o.....", "oo....", "oaoo..", "oaaaoo", "oaaaaa", "oaweaa", "ocaaaa", "occaae", ".occcc", "..oaaa", "..obaa", "...ooo"],
  bear: [".oo...", "oado..", "oaaooo", "oaaaaa", "oaaaaa", "oaweaa", "oaeeac", "oaaace", "odaacc", ".oaaaa", ".obaaa", "..oooo"],
  ghost: ["......", "...ooo", "..occc", ".owccc", ".occcc", "occecc", "occecc", "odcccc", "occcco", "occccc", "obcccc", "oo.oo."],
  robot: [".....d", ".....o", ".ooooo", ".oaaaa", "oabbbb", "oabwbb", "oabbbb", "oaaaaa", "oaadad", ".oaaaa", ".obbbb", ".ooooo"],
  mushroom: ["...ooo", ".ooaaa", "oaacca", "oacaaa", "oaaaac", "oooooo", "..occc", "..ocec", "..odcc", "..occc", "..occc", "...ooo"],
  gem: ["......", "..oooo", ".owcaa", "occaab", "oooooo", "oaaaab", ".oaaab", "..oaab", "...oab", "....ob", ".....o", "......"],
  planet: ["......", "......", "...ooo", "..ocaa", ".ocaaa", ".oaeaa", "ddoaaa", ".ddddd", "..obbb", "...ooo", "......", "......"],
  penguin: ["......", "...ooo", "..oaaa", ".oaacc", ".oacec", ".oaccd", "oaaccc", "oaaccc", "oaaccc", ".oaccc", ".oaacc", "..dd.."],
  frog: ["......", "......", ".ooo..", "oweo..", "oaaooo", "oaaaaa", "odaaaa", "oaoooo", "oaaaaa", ".occcc", ".occcc", ".oo.oo"],
  slime: ["......", "......", "......", "....oo", "...oca", "..ocaa", ".oaaaa", ".oweaa", "oaeeaa", "odaaao", "obaaaa", ".ooooo"],
  cactus: ["....oo", "...oca", ".o.oaa", "oaooaa", "oaooea", "oaaaaa", ".oooaa", "...oaa", "..oooo", "..oddd", "...odd", "...ooo"],
  rocket: ["......", ".....o", "....oa", "...oaa", "...oaw", "...oaw", "...oaa", "..doaa", ".ddobb", ".ddooo", "....cc", ".....c"],
  jelly: ["......", "...ooo", "..oaaa", ".ocaaa", ".oaaaa", "oaweaa", "odaaaa", "oooooo", ".b.b.b", "b.b.b.", ".b.b.b", "b...b."]
};

const THEMES = {
  frost: { o: "#1d2a3a", bg: ["#2a3f57", "#1f3349", "#34506b"], fx: "snow", fxc: ["#ffffff"],
    pal: [["#e8f1f8", "#b5cde0", "#ffffff", "#f2a7b8"], ["#9cc7e8", "#6d9cc4", "#eaf5ff", "#f29fb0"], ["#c9d6f2", "#9aa9d6", "#f6f8ff", "#ff9fb5"]] },
  neon: { o: "#120b24", bg: ["#1b1233", "#10162e", "#22103a"], fx: "grid", fxc: ["#47f0ff", "#ff4fa3"],
    pal: [["#ff4fa3", "#c2307e", "#ffd1ea", "#47f0ff"], ["#47f0ff", "#1fa5c4", "#d8fcff", "#ff4fa3"], ["#a66bff", "#7440d6", "#e9dcff", "#5cff9d"]] },
  ember: { o: "#2a0f0a", bg: ["#3a1a12", "#2c1410", "#47201a"], fx: "embers", fxc: ["#ff9a3d", "#ff5a3d"],
    pal: [["#ff7a3d", "#d44a1f", "#ffd3b8", "#ff3d3d"], ["#e8553a", "#b0321f", "#ffc2a8", "#ff9a3d"], ["#c43d2f", "#8f2419", "#ff9e85", "#ff7a3d"]] },
  bloom: { o: "#1d2b16", bg: ["#24361f", "#1c2c1a", "#2f2a33"], fx: "petals", fxc: ["#ffb3c7", "#c8f0a8"],
    pal: [["#8fd16a", "#5ea23f", "#e4f7d4", "#ff9fb5"], ["#d98fb8", "#b0628f", "#ffe1f0", "#8fd16a"], ["#6fc4a0", "#3f9474", "#d9f7ea", "#ff8fa0"]] },
  tide: { o: "#0c2233", bg: ["#0f3348", "#0b2638", "#12404f"], fx: "bubbles", fxc: ["#bff3ff"],
    pal: [["#4fc3d9", "#2b8fa8", "#d6f6ff", "#ff8f8f"], ["#ff9e9e", "#d46a75", "#ffe0e0", "#4fc3d9"], ["#7ad1c1", "#4a9e8f", "#e0fff8", "#a68bff"]] },
  cosmos: { o: "#0d0b1f", bg: ["#14112e", "#0e1430", "#1d1236"], fx: "stars", fxc: ["#ffffff", "#c9c2ff"],
    pal: [["#9b8cff", "#6a5bd6", "#e6e1ff", "#ff8fc8"], ["#6fb7ff", "#3f82d6", "#dceeff", "#c28cff"], ["#ff8fc8", "#c95e98", "#ffe0f0", "#8cf2ff"]] },
  dune: { o: "#2b1a0e", bg: ["#4a3020", "#3a261a", "#523626"], fx: "sand", fxc: ["#e8b48f"],
    pal: [["#e0a370", "#b8784a", "#f7dcc4", "#d9534f"], ["#c98a5b", "#9c623b", "#efd0b4", "#5fb3a5"], ["#e8b48f", "#c08560", "#fbe6d4", "#c8553d"]] },
  candy: { o: "#3a1530", bg: ["#3d1a35", "#2d1a3d", "#1f2f33"], fx: "sprinkles", fxc: ["#ff9ccf", "#7ee0d0", "#b99cff"],
    pal: [["#ff9ccf", "#e06aa8", "#ffe3f2", "#7ee0d0"], ["#b99cff", "#8a6be0", "#efe6ff", "#ff9ccf"], ["#8ee6c9", "#5cbf9f", "#e6fff6", "#ff8fb1"]] }
};

const CROWN = ["g.gg.g", "gggggg", "gdggdg"];
const HALO = [".hhhh.", "h....h", ".hhhh."];
const SPARKS = { uncommon: 1, rare: 2, epic: 2, mythic: 3, legendary: 4 };
const SIZE = 16;
const OX = 2;
const OY = 3;

function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Склеивает пиксели одного слоя в горизонтальные отрезки одного path
function toPath(cells) {
  const rows = {};
  cells.forEach(function (i) {
    const y = Math.floor(i / SIZE);
    (rows[y] = rows[y] || []).push(i % SIZE);
  });
  let d = "";
  Object.keys(rows).forEach(function (y) {
    const xs = rows[y].sort(function (p, q) { return p - q; });
    let start = xs[0];
    let prev = xs[0];
    for (let k = 1; k <= xs.length; k += 1) {
      if (k < xs.length && xs[k] === prev + 1) { prev = xs[k]; continue; }
      d += "M" + start + " " + y + "h" + (prev - start + 1) + "v1h-" + (prev - start + 1) + "z";
      if (k < xs.length) { start = xs[k]; prev = xs[k]; }
    }
  });
  return d;
}

function buildArt(art, rarity) {
  const a = art || {};
  const sprite = SPRITES[a.sprite] || SPRITES.slime;
  const theme = THEMES[a.theme] || THEMES.frost;
  const pal = theme.pal[(a.palette | 0) % 3];
  const colors = { o: theme.o, a: pal[0], b: pal[1], c: pal[2], d: pal[3], e: theme.o, w: "#ffffff" };
  const rand = rng((a.seed | 0) + 17);
  const layers = {};
  const solid = new Set();
  const push = function (key, i) { (layers[key] = layers[key] || []).push(i); };

  let top = 12;
  for (let r = 0; r < 12; r += 1) {
    for (let c = 0; c < 12; c += 1) {
      const ch = c < 6 ? sprite[r][c] : sprite[r][11 - c];
      if (ch === ".") continue;
      const i = (r + OY) * SIZE + c + OX;
      solid.add(i);
      push("c:" + colors[ch], i);
      if (c >= 4 && c <= 7 && r < top) top = r;
    }
  }

  // Ореол силуэта для epic и выше
  const halo = new Set();
  solid.forEach(function (i) {
    const x = i % SIZE;
    [-1, 1, -SIZE, SIZE].forEach(function (dv) {
      const j = i + dv;
      if (j < 0 || j >= SIZE * SIZE || solid.has(j)) return;
      if ((dv === -1 && x === 0) || (dv === 1 && x === SIZE - 1)) return;
      halo.add(j);
    });
  });
  const rank = rarityRank(rarity);
  const taken = new Set(solid);
  if (rank >= 3) halo.forEach(function (j) { push("aura", j); taken.add(j); });
  else halo.forEach(function (j) { taken.add(j); });

  const stamp = function (pattern, x0, y0, map) {
    pattern.forEach(function (row, dy) {
      for (let dx = 0; dx < row.length; dx += 1) {
        const ch = row[dx];
        if (ch === "." || !map[ch]) continue;
        const x = x0 + dx;
        const y = y0 + dy;
        if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue;
        const i = y * SIZE + x;
        push(map[ch], i);
        taken.add(i);
      }
    });
  };
  if (rarity === "legendary") stamp(CROWN, 5, Math.max(0, top + OY - 3), { g: "gold", d: "c:" + pal[3] });
  else if (rarity === "mythic") stamp(HALO, 5, Math.max(0, top + OY - 4), { h: "halo" });

  const free = function () {
    for (let n = 0; n < 40; n += 1) {
      const x = 1 + Math.floor(rand() * (SIZE - 2));
      const y = 1 + Math.floor(rand() * (SIZE - 3));
      const i = y * SIZE + x;
      if (!taken.has(i) && !taken.has(i - 1) && !taken.has(i + 1) && !taken.has(i - SIZE) && !taken.has(i + SIZE)) return i;
    }
    return -1;
  };

  const sparks = SPARKS[rarity] || 0;
  for (let s = 0; s < sparks; s += 1) {
    const i = free();
    if (i < 0) break;
    [i, i - 1, i + 1, i - SIZE, i + SIZE].forEach(function (j) { push(j === i ? "sparkc" : "spark", j); taken.add(j); });
  }

  const fx = theme.fxc;
  const count = theme.fx === "grid" ? 0 : theme.fx === "stars" ? 9 : 7;
  for (let p = 0; p < count; p += 1) {
    const i = free();
    if (i < 0) break;
    push("fx:" + fx[p % fx.length], i);
    taken.add(i);
    if (theme.fx === "stars" && p % 4 === 0 && !taken.has(i + 1)) push("fx:" + fx[p % fx.length], i + 1);
  }

  const bg = theme.bg[(a.bg | 0) % 3];
  const disc = [];
  const grid = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dx = x - 7.5;
      const dy = y - 8.5;
      if (dx * dx + dy * dy < 44) disc.push(y * SIZE + x);
      if (theme.fx === "grid" && (y === 13 || y === 15 || (y > 12 && (x === 1 || x === 5 || x === 10 || x === 14)))) grid.push(y * SIZE + x);
    }
  }
  const shadow = [];
  for (let x = 4; x <= 11; x += 1) shadow.push(15 * SIZE + x);

  return { bg: bg, disc: toPath(disc), grid: toPath(grid), gridColor: fx[0], shadow: toPath(shadow), layers: layers };
}

// Вложенный в другой SVG арт задаёт размеры и обрезку сам: CSS .nft-art перебивается через style.
export function NftArt({ art, rarity, className, x, y, width, height, preserveAspectRatio, style }) {
  const key = JSON.stringify(art || {}) + (rarity || "");
  const built = useMemo(function () { return buildArt(art, rarity); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const order = Object.keys(built.layers).sort(function (p, q) {
    const w = function (k) { return k.startsWith("fx:") ? 0 : k === "aura" ? 1 : k.startsWith("c:") ? 2 : 3; };
    return w(p) - w(q);
  });
  const size = width || height ? { ...(width ? { width } : null), ...(height ? { height } : null) } : null;
  return (
    <svg className={"nft-art nft-r-" + (rarity || "common") + (className ? " " + className : "")} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true"
      x={x} y={y} width={width} height={height} preserveAspectRatio={preserveAspectRatio} style={{ ...size, ...style }}>
      <rect width="16" height="16" fill={built.bg} />
      <path d={built.disc} fill="#ffffff" opacity="0.06" />
      {built.grid && <path d={built.grid} fill={built.gridColor} opacity="0.22" />}
      <path d={built.shadow} fill="#000000" opacity="0.28" />
      {order.map(function (k) {
        const d = toPath(built.layers[k]);
        if (k.startsWith("fx:")) return <path key={k} d={d} fill={k.slice(3)} opacity="0.55" />;
        if (k.startsWith("c:")) return <path key={k} d={d} fill={k.slice(2)} />;
        return <path key={k} d={d} className={"nft-px-" + k} />;
      })}
    </svg>
  );
}

/* ---------- Иконки ---------- */

export function NftIcon({ name }) {
  return <Icon name={name} />;
}

export function RarityPill({ rarity }) {
  return <span className={"nft-pill nft-r-" + (rarity || "pack")}>{rarityTitle(rarity)}</span>;
}

export function NftTopbar({ title, onBack, right }) {
  return (
    <div className="nft-topbar">
      <button className="nft-round" type="button" onClick={onBack} aria-label="Back"><NftIcon name="back" /></button>
      <span className="nft-topbar-title">{title}</span>
      {right || <span className="nft-round nft-round--ghost" />}
    </div>
  );
}
