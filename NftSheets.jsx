import { useEffect, useState } from "react";
import { NftArt, NftIcon, NftPortal, RarityPill, money, perHour, useOverlayLock } from "./nftShared";

// Стандартные строки описания NFT для листа деталей
export function itemRows(item, extra) {
  const rows = [];
  if (item.collection) rows.push(["Collection", item.collection.name]);
  rows.push(["Edition", "#" + item.serial + " of " + item.supply]);
  if (item.source) rows.push(["Source", item.source]);
  if (item.mintedAt) rows.push(["Minted", new Date(item.mintedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })]);
  rows.push(["Daily income", money(item.incomeHour * 24)]);
  return rows.concat(extra || []);
}

// Главная кнопка: круг с иконкой слева, шевроны справа
export function NftCta({ icon, label, onClick, disabled, tone }) {
  return (
    <button className={"nft-cta" + (tone ? " nft-cta--" + tone : "")} type="button" onClick={onClick} disabled={disabled}>
      <span className="nft-cta-icon"><NftIcon name={icon || "bolt"} /></span>
      <span className="nft-cta-label">{label}</span>
      <span className="nft-cta-chev" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}

// Лист деталей NFT: большой арт сверху, панель с метриками и действиями снизу
export function NftDetailSheet({ item, onClose, owner, metrics, rows, note, children }) {
  const open = !!item;
  useOverlayLock(open, onClose);
  if (!open) return null;
  return (
    <NftPortal>
    <div className="nft-sheet-wrap" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className={"nft-sheet nft-r-" + item.rarity} onClick={function (e) { e.stopPropagation(); }}>
        <div className="nft-sheet-hero">
          <NftArt art={item.art} rarity={item.rarity} />
          <div className="nft-sheet-bar">
            <button className="nft-sheet-back" type="button" onClick={onClose} aria-label="Close"><NftIcon name="back" /></button>
            <span className="nft-sheet-heading">{"#" + item.serial + " " + item.name}</span>
            <RarityPill rarity={item.rarity} />
          </div>
        </div>

        <div className="nft-sheet-panel">
          <div className="nft-sheet-owner">
            <span className="nft-sheet-logo"><NftArt art={item.art} rarity="common" /></span>
            <span className="nft-sheet-owner-text">
              <b>{item.collection ? item.collection.name : "xwallet"}<i className="nft-verified"><NftIcon name="check" /></i></b>
              <span>{owner}</span>
            </span>
          </div>

          {metrics && metrics.length > 0 && (
            <div className="nft-sheet-metrics">
              {metrics.map(function (m) {
                return (
                  <div className="nft-metric" key={m.label}>
                    <span className="nft-metric-icon"><NftIcon name={m.icon} /></span>
                    <span className="nft-metric-text">
                      <span>{m.label}</span>
                      <b>{m.value}</b>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="nft-rows">
            {(rows || itemRows(item)).map(function (r) {
              return (
                <div className="nft-row" key={r[0]}>
                  <span>{r[0]}</span>
                  <b>{r[1]}</b>
                </div>
              );
            })}
          </div>

          {note && <p className={"nft-note" + (note.ok === false ? " is-err" : note.ok ? " is-ok" : "")}>{note.text}</p>}

          <div className="nft-sheet-actions">{children}</div>
        </div>
      </div>
    </div>
    </NftPortal>
  );
}

function receive(price, fee) {
  return Math.floor(price * (1 - fee) * 100) / 100;
}

// Центрированный диалог выставления на маркет
export function NftListDialog({ item, config, onClose, onSubmit }) {
  const open = !!item;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useOverlayLock(open, onClose);

  useEffect(function () {
    if (!item) return;
    setText((item.listPrice || item.value).toFixed(2));
    setError("");
    setBusy(false);
  }, [item]);

  if (!open) return null;
  const fee = config ? config.marketFee : 0.05;
  const min = config ? config.minListPrice : 0.1;
  const max = config ? config.maxListPrice : 1000000;
  const price = Math.round(parseFloat(text.replace(",", ".")) * 100) / 100;
  const valid = isFinite(price) && price >= min && price <= max;
  const diff = valid ? Math.round((price / item.value - 1) * 100) : 0;
  const chips = [["Value", 1], ["+10%", 1.1], ["+25%", 1.25], ["+50%", 1.5]];

  function submit() {
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    Promise.resolve(onSubmit(price)).catch(function (e) {
      setError(e && e.message ? e.message : "Could not list this NFT");
      setBusy(false);
    });
  }

  return (
    <NftPortal>
    <div className="nft-dialog-wrap" role="dialog" aria-modal="true" aria-label="List on market" onClick={onClose}>
      <div className={"nft-dialog nft-r-" + item.rarity} onClick={function (e) { e.stopPropagation(); }}>
        <div className="nft-dialog-head">
          <span className="nft-dialog-art"><NftArt art={item.art} rarity={item.rarity} /></span>
          <span className="nft-dialog-title">
            <span>{item.listingId ? "Change price" : "List on market"}</span>
            <b>{item.name + " #" + item.serial}</b>
          </span>
          <button className="nft-dialog-x" type="button" onClick={onClose} aria-label="Close"><NftIcon name="close" /></button>
        </div>

        <label className={"nft-price-field" + (text && !valid ? " is-bad" : "")}>
          <span className="nft-price-cur">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={text}
            onChange={function (e) { setText(e.target.value.replace(/[^0-9.,]/g, "")); }}
            onKeyDown={function (e) { if (e.key === "Enter") submit(); }}
            aria-label="Price in USD"
          />
          {valid && <span className={"nft-price-diff" + (diff > 0 ? " is-up" : diff < 0 ? " is-down" : "")}>{(diff > 0 ? "+" : "") + diff + "%"}</span>}
        </label>

        <div className="nft-chips">
          {chips.map(function (c) {
            const v = (Math.round(item.value * c[1] * 100) / 100).toFixed(2);
            return <button key={c[0]} type="button" className={"nft-chip" + (text === v ? " is-on" : "")} onClick={function () { setText(v); }}>{c[0]}</button>;
          })}
        </div>

        <div className="nft-rows nft-rows--tight">
          <div className="nft-row"><span>Estimated value</span><b>{money(item.value)}</b></div>
          <div className="nft-row"><span>{"Market fee · " + Math.round(fee * 100) + "%"}</span><b>{valid ? "−" + money(price - receive(price, fee)) : "—"}</b></div>
          <div className="nft-row nft-row--total"><span>You receive</span><b>{valid ? money(receive(price, fee)) : "—"}</b></div>
          <div className="nft-row nft-row--muted"><span>Instant sale instead</span><b>{money(item.instantPrice)}</b></div>
        </div>

        <p className="nft-note">{"Keeps earning " + perHour(item.incomeHour) + " while listed. Min " + money(min) + "."}</p>
        {error && <p className="nft-note is-err">{error}</p>}

        <button className="nft-btn nft-btn--light nft-btn--block" type="button" disabled={!valid || busy} onClick={submit}>
          {busy ? "Listing..." : valid ? (item.listingId ? "Update to " : "List for ") + money(price) : "Enter a price"}
        </button>
      </div>
    </div>
    </NftPortal>
  );
}

// Небольшое подтверждение для необратимых действий
export function NftConfirm({ open, title, text, confirm, tone, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  useOverlayLock(open, onCancel);
  useEffect(function () { if (open) setBusy(false); }, [open]);
  if (!open) return null;

  function go() {
    if (busy) return;
    setBusy(true);
    Promise.resolve(onConfirm()).catch(function () {}).then(function () { setBusy(false); });
  }

  return (
    <NftPortal>
    <div className="nft-dialog-wrap nft-dialog-wrap--top" role="alertdialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div className="nft-dialog nft-dialog--confirm" onClick={function (e) { e.stopPropagation(); }}>
        <b className="nft-confirm-title">{title}</b>
        <p className="nft-confirm-text">{text}</p>
        <div className="nft-confirm-actions">
          <button className="nft-btn nft-btn--glass" type="button" onClick={onCancel}>Cancel</button>
          <button className={"nft-btn " + (tone === "danger" ? "nft-btn--danger" : "nft-btn--light")} type="button" disabled={busy} onClick={go}>{busy ? "Working..." : confirm}</button>
        </div>
      </div>
    </div>
    </NftPortal>
  );
}

// Всплывающее сообщение внизу экрана
export function NftToast({ toast }) {
  if (!toast) return null;
  return <NftPortal><div className={"nft-toast" + (toast.ok ? " is-ok" : " is-err")} key={toast.id}>{toast.text}</div></NftPortal>;
}

export function useNftToast() {
  const [toast, setToast] = useState(null);
  useEffect(function () {
    if (!toast) return undefined;
    const id = window.setTimeout(function () { setToast(null); }, 3600);
    return function () { window.clearTimeout(id); };
  }, [toast]);
  return [toast, function (ok, text) { setToast({ ok: ok, text: text, id: Date.now() }); }];
}
