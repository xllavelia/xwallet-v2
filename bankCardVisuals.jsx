import { useId } from "react";
import { NftArt } from "./nftShared";

// Базовые дизайны доступны всем: 0 — кошелёк, 1–3 — основные счета.
// Слева цветная часть с надписью, справа графитовая полоса с меткой xavero.
const BASE_DESIGNS = [
  { id: 0, key: "card-base-cloud", name: "Cloud", left: "#e7e5de", ink: "#101010" },
  { id: 1, key: "card-base-sand", name: "Sand", left: "#dcc9a8", ink: "#101010" },
  { id: 2, key: "card-base-mint", name: "Mint", left: "#c3d9cb", ink: "#101010" },
  { id: 3, key: "card-base-graphite", name: "Graphite", left: "#2c2d32", ink: "#f4f2ec" },
];

// Цвета разблокируемых дизайнов: зеркало каталога profile_sql.
const CARD_COLORS = {
  "card-sage": ["#788b43", "#ffffff"],
  "card-coral": ["#e45d55", "#ffffff"],
  "card-glacier": ["#75cbdc", "#101010"],
  "card-dusk": ["#895b83", "#ffffff"],
  "card-aurora": ["#24a879", "#ffffff"],
  "card-ember": ["#d8793f", "#ffffff"],
  "card-prism": ["#db65b5", "#ffffff"],
  "card-silver": ["#c0c7d1", "#101010"],
  "card-gold": ["#e9bd62", "#21180d"],
  "card-platinum": ["#e4e5e8", "#20232b"],
  "card-supernova": ["#f05b8b", "#ffffff"],
  "card-cocoa": ["#5c4230", "#efe0c9"],
  "card-olive": ["#66703c", "#e6e3c6"],
  "card-silk": ["#e5b49e", "#ffffff"],
  "card-nebula": ["#9271e9", "#ffffff"],
  "card-iridescent": ["#9acbba", "#101010"],
  "card-xlavelia": ["#013e37", "#ffefb3"],
  "card-wave": ["#16324b", "#f3eddd"],
};

const GRAPHITE = "#1b1b21";
const BRAND_FONT = '"Unbounded", "Inter", sans-serif';

// Цвета редкостей совпадают с --nft-c в main7.css.
const NFT_RARITY = {
  common: "#9a9ba1",
  uncommon: "#8cc8ff",
  rare: "#6fdc8c",
  epic: "#b48cff",
  mythic: "#ff6b6b",
  legendary: "#f0dfad",
};

function hex(value) {
  const clean = String(value || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return [0, 0, 0];
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
}

// Смешивает цвет редкости с тёмной подложкой оверлея получения.
function mixDark(color, amount) {
  const rgb = hex(color);
  const dark = [12, 12, 14];
  return "#" + rgb.map((v, i) => Math.round(v + (dark[i] - v) * amount).toString(16).padStart(2, "0")).join("");
}

function nftSkin(custom) {
  const nft = custom?.nft;
  if (!nft || !nft.rarity) return null;
  return nft;
}

function baseDesign(designId) {
  return BASE_DESIGNS[Number(designId)] || BASE_DESIGNS[0];
}

// Итоговая палитра карточки: базовый дизайн, разблокированный, кастомный или скин NFT.
function cardPalette(design) {
  const base = baseDesign(design?.designId);
  const custom = design?.custom || null;
  const skin = nftSkin(custom);
  if (skin) {
    const accent = NFT_RARITY[skin.rarity] || NFT_RARITY.common;
    return {
      left: accent,
      ink: "#f4f2ec",
      inkOpacity: 1,
      rightInk: accent,
      right: accent,
      accent,
      linked: false,
      leftImage: "",
      rightImage: "",
      nft: skin,
    };
  }
  const key = design?.designKey || "";
  const mapped = CARD_COLORS[key];
  const linked = Boolean(custom?.link);
  const left = custom?.left?.color || (mapped ? mapped[0] : base.left);
  const ink = custom?.ink || (mapped ? mapped[1] : base.ink);
  const right = linked ? left : custom?.right?.color || GRAPHITE;
  // Текст правой части подчиняется выбранному цвету текста, без выбора остаётся светлым.
  const rightInk = custom?.ink || "#f4f2ec";
  return {
    left,
    ink,
    inkOpacity: custom?.inkOpacity ?? 1,
    rightInk: linked ? ink : rightInk,
    right,
    linked,
    leftImage: custom?.left?.image || "",
    rightImage: linked ? "" : custom?.right?.image || "",
    accent: "",
    nft: null,
  };
}

function openedLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return pad(date.getUTCDate()) + "." + pad(date.getUTCMonth() + 1) + "." + date.getUTCFullYear();
}

function AccountArt({
  designId = 0,
  designKey = "",
  custom = null,
  opened = "",
  owner = "xlavelia",
  className = "hxr-account-art",
  compact = false,
}) {
  const uid = "xac" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const palette = cardPalette({ designId, designKey, custom });
  const skin = palette.nft;
  const markColor = palette.rightInk;
  const meta = [openedLabel(opened) ? "Opened " + openedLabel(opened) : "", owner ? "Owned by " + owner : ""]
    .filter(Boolean)
    .join(" · ");

  // Скин NFT: арт на всю левую часть, справа — его же отражение, сильно размытое.
  // Размытие статичное (без анимаций внутри фильтра), поэтому считается один раз.
  if (skin) {
    const silk = mixDark(palette.accent, 0.68);
    return (
      <svg
        className={"xac-nft " + className}
        viewBox="0 0 320 200"
        fill="none"
        aria-hidden="true"
        data-design="nft"
      >
        <defs>
          <clipPath id={uid + "c"}>
            <rect width="320" height="200" rx="24" />
          </clipPath>
          <clipPath id={uid + "l"}>
            <rect x="0" y="0" width="214" height="200" />
          </clipPath>
          <clipPath id={uid + "r"}>
            <rect x="214" y="0" width="106" height="200" />
          </clipPath>
          <filter id={uid + "bl"} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <linearGradient id={uid + "v"} x1="214" y1="0" x2="214" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0c0c0c" stopOpacity=".08" />
            <stop offset=".55" stopColor="#0c0c0c" stopOpacity="0" />
            <stop offset="1" stopColor="#0c0c0c" stopOpacity=".22" />
          </linearGradient>
          <linearGradient id={uid + "e"} x1="214" y1="0" x2="214" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".3" />
            <stop offset=".5" stopColor="#ffffff" stopOpacity=".08" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={uid + "s"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".4" stopColor="#ffffff" stopOpacity="0" />
            <stop offset=".5" stopColor="#ffffff" stopOpacity=".34" />
            <stop offset=".6" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g clipPath={"url(#" + uid + "c)"}>
          <rect width="320" height="200" fill={silk} />
          <g clipPath={"url(#" + uid + "l)"}>
            <NftArt
              art={skin.art}
              rarity={skin.rarity}
              width="214"
              height="200"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
          <g clipPath={"url(#" + uid + "r)"}>
            <g filter={"url(#" + uid + "bl)"}>
              <g transform="translate(534 0) scale(-1 1)">
                <NftArt
                  art={skin.art}
                  rarity={skin.rarity}
                  className="nft-blur-copy"
                  x="143"
                  y="-24"
                  width="248"
                  height="248"
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
            </g>
            <rect x="214" width="106" height="200" fill={"url(#" + uid + "v)"} />
          </g>
          <rect className="xac-nft-shine" x="-90" y="-24" width="90" height="248" fill={"url(#" + uid + "s)"} />
          <rect className="xac-nft-edge" x="213.5" width="2.5" height="200" fill={"url(#" + uid + "e)"} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 320 200"
      fill="none"
      aria-hidden="true"
      data-design={designKey || designId}
      data-linked={palette.linked ? "1" : undefined}
    >
      <defs>
        <clipPath id={uid + "c"}>
          <rect width="320" height="200" rx="24" />
        </clipPath>
        <clipPath id={uid + "l"}>
          <rect x="0" y="0" width="214" height="200" />
        </clipPath>
        <clipPath id={uid + "r"}>
          <rect x="214" y="0" width="106" height="200" />
        </clipPath>
      </defs>
      <g clipPath={"url(#" + uid + "c)"}>
        {palette.linked ? (
          palette.leftImage ? (
            <image href={palette.leftImage} width="320" height="200" preserveAspectRatio="none" />
          ) : <rect width="320" height="200" fill={palette.left} />
        ) : (
          <>
            {palette.leftImage ? <image href={palette.leftImage} width="214" height="200" preserveAspectRatio="none" clipPath={"url(#" + uid + "l)"} /> : <rect width="214" height="200" fill={palette.left} />}
            {palette.rightImage ? (
              // Боковое фото — это баннер, повёрнутый на 90°: режем как баннер, затем кладём в правую полосу.
              <g clipPath={"url(#" + uid + "r)"}>
                <g transform="rotate(90 267 100)">
                  <image href={palette.rightImage} x="167" y="47" width="200" height="106" preserveAspectRatio="xMidYMid slice" />
                </g>
              </g>
            ) : <rect x="214" width="106" height="200" fill={palette.right} />}
            <path d="M214 1v198" stroke="#ffffff" strokeOpacity=".1" />
          </>
        )}

        <text
          x={palette.linked ? 160 : 107}
          y={compact ? 110 : 114}
          textAnchor="middle"
          fontFamily={BRAND_FONT}
          fontWeight="800"
          fontSize={compact ? 34 : 46}
          letterSpacing="-1.4"
          fill={palette.ink}
          fillOpacity={palette.inkOpacity}
        >
          Hello!
        </text>

        {!compact && meta ? (
          <text
            x={palette.linked ? 160 : 21}
            y="179"
            textAnchor={palette.linked ? "middle" : "start"}
            fontFamily={BRAND_FONT}
            fontWeight="500"
            fontSize="7.1"
            letterSpacing=".18"
            fill={palette.ink}
            fillOpacity={.62 * palette.inkOpacity}
          >
            {meta}
          </text>
        ) : null}

        {palette.linked ? null : (
          <g transform={compact ? "translate(267 96) scale(.9) translate(-267 -100)" : undefined} opacity={palette.inkOpacity}>
            <g transform="translate(258 68)" fill="none" stroke={markColor} strokeWidth="2.2" strokeLinecap="round">
              <circle cx="0" cy="14" r="1.7" fill={markColor} stroke="none" />
              <path d="M5.5 8.5a8 8 0 0 1 0 11" />
              <path d="M10.5 3.5a15 15 0 0 1 0 21" />
              <path d="M15.5-1.5a22 22 0 0 1 0 31" />
            </g>
            <text
              x="267"
              y={compact ? 128 : 132}
              textAnchor="middle"
              fontFamily={BRAND_FONT}
              fontWeight="700"
              fontSize={compact ? 8.6 : 10}
              letterSpacing="2.6"
              fill={markColor}
            >
              xavero
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

export { AccountArt, BASE_DESIGNS, CARD_COLORS, NFT_RARITY, cardPalette, openedLabel, GRAPHITE };
