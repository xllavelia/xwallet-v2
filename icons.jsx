import React from "react";

// Единая семья иконок: сетка 24, штрих 1.8, круглые концы.
// Все экраны берут иконки только отсюда, чтобы линии и пропорции совпадали.
const ICONS = {
  back: <path d="M14.5 5 7.5 12l7 7" />,
  chevron: <path d="m9.5 5 7 7-7 7" />,
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />,
  "arrow-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" />,
  "arrow-down-left": <path d="M17 7 7 17M15 17H7V9" />,
  check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  create: <path d="M12 5v14M5 12h14" />,
  add: (
    <>
      <circle cx="8.5" cy="8" r="3.2" />
      <path d="M3 20c0-3.2 2.5-5.5 5.5-5.5 1.4 0 2.7.5 3.7 1.4" />
      <path d="M17.5 13.5v6M14.5 16.5h6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  refresh: <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 4v5h-5" />,
  reset: <path d="M4 10.5A8.5 8.5 0 1 1 5 17M4 4.5v6h6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10.5h18" />
    </>
  ),
  swap: <path d="M4 9h13M14 6l3 3-3 3M20 15H7M10 12l-3 3 3 3" />,
  "swap-vertical": <path d="M9 4v13M6 7l3-3 3 3M15 20V7M12 17l3 3 3-3" />,
  chart: (
    <>
      <path d="M3.5 20.5V4M3.5 20.5h17" />
      <path d="m7 16 4-5 3 2.2 5-6" />
    </>
  ),
  history: (
    <>
      <path d="M4 10.5A8.5 8.5 0 1 1 5 17M4 4.5v6h6" />
      <path d="M12 8v4.5l3 1.8" />
    </>
  ),
  send: (
 <>
  <path d="M12 20V4" />
  <path d="M4.5 11.5 12 4l7.5 7.5" />
</>
  ),
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
      <circle cx="8" cy="9" r=".8" fill="currentColor" stroke="none" />
      <circle cx="11" cy="6.5" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r=".8" fill="currentColor" stroke="none" />
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
      <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
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
  bolt: <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />,
  expand: (
    <>
      <path d="M9.5 4.5H6.1A1.6 1.6 0 0 0 4.5 6.1v3.4" />
      <path d="M14.5 4.5h3.4a1.6 1.6 0 0 1 1.6 1.6v3.4" />
      <path d="M9.5 19.5H6.1a1.6 1.6 0 0 1-1.6-1.6v-3.4" />
      <path d="M14.5 19.5h3.4a1.6 1.6 0 0 0 1.6-1.6v-3.4" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  games: (
    <>
      <path d="M7.5 7h9c2.2 0 3.4 2.1 3.9 4.3l.9 4.2c.4 1.9-1.4 3-2.9 1.9L16 15h-8l-2.4 2.4c-1.5 1.1-3.3 0-2.9-1.9l.9-4.2C4.1 9.1 5.3 7 7.5 7Z" />
      <path d="M7 10.5v4M5 12.5h4" />
      <circle cx="16.2" cy="11.2" r=".9" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13.4" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  nft: (
  <>
  <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
  {/* <path d="m4 7.5 8 4.5 8-4.5" /> */}
  {/* <path d="M12 12v9" /> */}
  {/* <path d="m8.5 8.5 2-2 2 2" /> */}
</>
  ),
  store: (
    <>
      <path d="M4.5 9.5 6 4h12l1.5 5.5M4.5 9.5V20h15V9.5M4.5 9.5h15" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" />
      <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 11.5v-8h8l9 9-8 8-9-9Z" />
      <circle cx="7.8" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  upgrade: <path d="M7 20h10M12 16.5V4M7.5 8.5 12 4l4.5 4.5" />,
  merge: <path d="M5.5 5l6 7-6 7M18.5 5l-6 7 6 7" />,
  ticket: (
    <>
      <path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5a2.5 2.5 0 0 0 0 5A2.5 2.5 0 0 1 18.5 17h-13A2.5 2.5 0 0 1 3 14.5a2.5 2.5 0 0 0 0-5Z" />
      <path d="M14.5 7v2M14.5 11v2M14.5 15v2" />
    </>
  ),
  empire: (
    <>
      <path d="M5 20V9l2-1.5V5h2v2h2V5h2v2h2V5h2v2.5L19 9v11H5Z" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  slots: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="M9.5 5v14M14.5 5v14" />
      <circle cx="6.5" cy="12" r=".9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r=".9" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="12" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  pixel: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  flip: (
    <>
      <path d="M17 3.5 20.5 7 17 10.5M3.5 10.5V9a4 4 0 0 1 4-4h13" />
      <path d="M7 20.5 3.5 17 7 13.5M20.5 13.5V15a4 4 0 0 1-4 4h-13" />
    </>
  ),
  trade: (
    <>
      <path d="M3 17 8.5 11.5l4 4L20.5 7" />
      <path d="M15 7h5.5v5.5" />
    </>
  ),
  mine: (
    <>
      <path d="M12.8 4.2 19.8 11.2a1.6 1.6 0 0 1 0 2.3l-1.7 1.7a1.6 1.6 0 0 1-2.3 0L8.8 8.2a1.6 1.6 0 0 1 0-2.3l1.7-1.7a1.6 1.6 0 0 1 2.3 0Z" />
      <path d="M10.3 10.7 4.5 16.5a1.6 1.6 0 0 0 0 2.3l.7.7a1.6 1.6 0 0 0 2.3 0l5.8-5.8" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9.5a6 6 0 1 0-12 0c0 4.5-2 6.5-2 6.5h16s-2-2-2-6.5Z" />
      <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5a2.6 2.6 0 0 1 5.1.8c0 1.7-2.6 2.2-2.6 3.7" />
      <circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7.5" width="15.5" height="9" rx="2.5" />
      <path d="M21 10.5v3" />
    </>
  ),
  server: (
    <>
      <rect x="3.5" y="4" width="17" height="6" rx="1.8" />
      <rect x="3.5" y="14" width="17" height="6" rx="1.8" />
      <circle cx="7" cy="7" r=".9" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 3.5v17" />
      <path d="M16.2 7.4c-.9-1-2.4-1.7-4.2-1.7-2.3 0-4 1.2-4 3.1 0 1.9 1.8 2.6 4 3.1 2.4.5 4.2 1.2 4.2 3.1 0 1.9-1.8 3.1-4.2 3.1-1.9 0-3.4-.7-4.3-1.8" />
    </>
  ),
  star: <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-3.5-4.1 5.9-.9Z" />,
  candles: (
    <>
      <path d="M7 4v3M7 17v3M17 4v3M17 17v3" />
      <rect x="4.5" y="7" width="5" height="10" rx="1.4" />
      <rect x="14.5" y="7" width="5" height="10" rx="1.4" />
    </>
  ),
};

export function Icon({ name, size, strokeWidth = 1.8, className, ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {ICONS[name] || ICONS.spark}
    </svg>
  );
}
