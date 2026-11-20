import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNftState } from "./useNft";
import { RARITIES, NftArt, NftIcon, NftTopbar, formatLeft, money, moneyShort, pendingText, perHour, rarityRank, rarityTitle, useNftBack, useNow } from "./nftShared";
import { NftToast, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";

function themeOf(c) {
  return "nft-t-" + (c && c.theme ? c.theme : "frost");
}

// Лучшие шаблоны коллекции для превью
function previewTemplates(collection, n) {
  return (collection.templates || []).slice().sort(function (a, b) {
    return rarityRank(b.rarity) - rarityRank(a.rarity);
  }).slice(0, n);
}

export default function Nft() {
  const navigate = useNavigate();
  const back = useNftBack("/services");
  const { state, error, pendingAt, collect, refresh } = useNftState();
  const now = useNow(1000);
  const [collecting, setCollecting] = useState(false);
  const [toast, showToast] = useNftToast();

  if (!state) {
    return (
      <div className="nft-page">
        <NftTopbar title="NFT" onBack={back} />
        <div className="nft-wrap">
          {error
            ? <div className="nft-empty"><b>Could not load NFTs</b><span>{error}</span><button className="nft-btn nft-btn--glass" type="button" onClick={function () { refresh().catch(function () {}); }}>Try again</button></div>
            : <Skeleton rows={3} hero />}
        </div>
      </div>
    );
  }

  const p = state.profile;
  const pending = pendingAt(now);
  const items = state.items || [];
  const top = items.slice().sort(function (a, b) { return b.value - a.value; }).slice(0, 3);
  const total = RARITIES.reduce(function (s, r) { return s + ((p.byRarity || {})[r] || 0); }, 0);
  const nextAt = state.nextDrop && state.nextDrop.startsAt ? new Date(state.nextDrop.startsAt).getTime() : 0;

  function onCollect() {
    if (collecting) return;
    setCollecting(true);
    collect().then(function (r) {
      showToast(true, r.collected > 0 ? "Collected " + money(r.collected) : "Nothing to collect yet");
    }).catch(function (e) {
      showToast(false, e.message || "Could not collect");
    }).then(function () { setCollecting(false); });
  }

  return (
    <div className="nft-page">
      <NftTopbar title="NFT" onBack={back} />
      <div className="nft-wrap">
        <section className="nft-port">
          <div className="nft-port-top">
            <span className="nft-kicker">Portfolio value</span>
            <span className="nft-port-count">{p.count + " NFT" + (p.count === 1 ? "" : "s") + (p.listed ? " · " + p.listed + " listed" : "")}</span>
          </div>
          <div className="nft-port-value">{money(p.value)}</div>

          <div className="nft-port-stats">
            <div className="nft-port-stat">
              <span>Income</span>
              <b>{perHour(p.incomeHour)}</b>
            </div>
            <div className="nft-port-stat">
              <span>Per day</span>
              <b>{money(p.incomeHour * 24)}</b>
            </div>
            <div className="nft-port-stat">
              <span>Earned</span>
              <b>{moneyShort(p.earned)}</b>
            </div>
          </div>

          <div className="nft-port-bar" aria-label="Rarity distribution">
            {total > 0
              ? RARITIES.map(function (r) {
                const n = (p.byRarity || {})[r] || 0;
                return n ? <span key={r} className={"nft-r-" + r} style={{ flexGrow: n }} title={rarityTitle(r) + " · " + n} /> : null;
              })
              : <span className="nft-port-bar-empty" />}
          </div>
          {total > 0 && (
            <div className="nft-port-legend">
              {RARITIES.map(function (r) {
                const n = (p.byRarity || {})[r] || 0;
                return n ? <span key={r} className={"nft-r-" + r}><i />{rarityTitle(r) + " " + n}</span> : null;
              })}
            </div>
          )}

          <div className="nft-claimbar">
            <span className="nft-claimbar-icon"><NftIcon name="bolt" /></span>
            <span className="nft-claimbar-text">
              <span>Unclaimed income</span>
              <b className="nft-ticker">{pendingText(pending)}</b>
            </span>
            <button className="nft-btn nft-btn--light nft-btn--sm" type="button" disabled={collecting || pending < 0.01} onClick={onCollect}>
              {collecting ? "..." : "Collect"}
            </button>
          </div>
        </section>

        <div className="nft-entries">
          <button className="nft-entry" type="button" onClick={function () { navigate("/nft/inventory"); }}>
            <span className="nft-entry-stack">
              {top.length
                ? top.map(function (it, i) { return <span key={it.id} className={"nft-entry-card nft-r-" + it.rarity} style={{ zIndex: 3 - i }}><NftArt art={it.art} rarity={it.rarity} /></span>; })
                : <span className="nft-entry-card nft-entry-card--empty"><NftIcon name="grid" /></span>}
            </span>
            <span className="nft-entry-title">Inventory</span>
            <span className="nft-entry-sub">{p.count ? p.count + " owned · " + perHour(p.incomeHour) : "Nothing here yet"}</span>
            {/* <span className="nft-entry-go"><NftIcon name="arrow" /></span> */}
          </button>
          <button className="nft-entry" type="button" onClick={function () { navigate("/nft/market"); }}>
            <span className="nft-entry-stack">
              <span className="nft-entry-card nft-entry-card--icon"><NftIcon name="store" /></span>
            </span>
            <span className="nft-entry-title">Market</span>
            <span className="nft-entry-sub">Buy from xwallet & players</span>
            {/* <span className="nft-entry-go"><NftIcon name="arrow" /></span> */}
          </button>
        </div>

        <div className="nft-section-head">
          <span>Live drops</span>
          <small>{(state.collections || []).length + " active"}</small>
        </div>

        <div className="nft-drops">
          {(state.collections || []).map(function (c) {
            const ends = new Date(c.endsAt).getTime() - now;
            const minted = (c.templates || []).reduce(function (s, t) { return s + t.minted; }, 0);
            const supply = (c.templates || []).reduce(function (s, t) { return s + t.supply; }, 0);
            const cheapest = (c.packs || []).reduce(function (m, pk) { return Math.min(m, pk.price); }, Infinity);
            return (
              <button key={c.id} className={"nft-drop " + themeOf(c)} type="button" onClick={function () { navigate("/nft/drop?id=" + c.id); }}>
                <span className="nft-drop-arts">
                  {previewTemplates(c, 4).map(function (t) {
                    return <span key={t.id} className={"nft-drop-art nft-r-" + t.rarity}><NftArt art={t.art} rarity={t.rarity} /></span>;
                  })}
                </span>
                <span className="nft-drop-body">
                  <span className="nft-drop-name">{c.name}</span>
                  <span className="nft-drop-tag">{c.tagline}</span>
                  <span className="nft-drop-meta">
                    <span><NftIcon name="clock" />{formatLeft(ends)}</span>
                    <span><NftIcon name="box" />{(c.packs || []).length + " packs"}</span>
                    {isFinite(cheapest) && <span>{"from " + money(cheapest)}</span>}
                  </span>
                  <span className="nft-drop-progress"><i style={{ width: (supply ? minted / supply * 100 : 0) + "%" }} /></span>
                </span>
              </button>
            );
          })}
          {nextAt > 0 && (
            <div className={"nft-drop nft-drop--next " + themeOf(state.nextDrop)}>
              <span className="nft-drop-lock"><NftIcon name="spark" /></span>
              <span className="nft-drop-body">
                <span className="nft-kicker">Next collection</span>
                <span className="nft-drop-name">{state.nextDrop.name}</span>
                <span className="nft-drop-meta"><span><NftIcon name="clock" />{"Drops in " + formatLeft(nextAt - now)}</span></span>
              </span>
            </div>
          )}
        </div>

        <div className="nft-section-head"><span>How it works</span></div>
        <div className="nft-how">
          <div className="nft-how-item">
            <span className="nft-how-icon"><NftIcon name="bolt" /></span>
            <b>Earn every hour</b>
            <span>Each NFT pays a steady hourly income while you hold it, even when listed.</span>
          </div>
          <div className="nft-how-item">
            <span className="nft-how-icon"><NftIcon name="wallet" /></span>
            <b>{"Sell instantly at " + Math.round(state.config.instantRate * 100) + "%"}</b>
            <span>Get cash right now for a part of the estimated value.</span>
          </div>
          <div className="nft-how-item">
            <span className="nft-how-icon"><NftIcon name="tag" /></span>
            <b>List at any price</b>
            <span>{"Set your own price and wait for a buyer. Fee " + Math.round(state.config.marketFee * 100) + "%."}</span>
          </div>
        </div>
      </div>
      <NftToast toast={toast} />
    </div>
  );
}
