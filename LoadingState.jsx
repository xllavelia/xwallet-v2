import React from "react";

// Единые состояния загрузки: один спиннер и одна подпись на всех экранах.
export function LoadingState({ label, compact = false }) {
  return (
    <div className={"xw-loading" + (compact ? " is-compact" : "")} role="status" aria-live="polite">
      <span className="xw-spinner" aria-hidden="true" />
      {label ? <span className="xw-loading-text">{label}</span> : null}
    </div>
  );
}

// Скелетоны карточек тоже общие: герой-блок и ровные строки.
export function Skeleton({ rows = 3, hero = false }) {
  return (
    <div className={"xw-skeleton" + (hero ? " is-hero" : "")} role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => <i key={index} aria-hidden="true" />)}
    </div>
  );
}
