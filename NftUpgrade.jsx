import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { useNftState } from "./useNft";
import { NftArt, NftIcon, NftTopbar, money, rarityTitle, useNftBack } from "./nftShared";
import { NftConfirm, NftToast, useNftToast } from "./NftSheets";
import { Skeleton } from "./LoadingState";

const RADIUS = 100;
const CIRC = 2 * Math.PI * RADIUS;
const TURNS = 4;
const SPARKS = Array.from({ length: 12 }, function (_, i) { return i; });

function pct(v) {
  const n = Math.round((Number(v) || 0) * 1000) / 10;
  return (Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1)) + "%";
}

function chanceWord(v) {
  const n = Number(v) || 0;
  if (n < 0.15) return "low";
  if (n < 0.45) return "medium";
  return "high";
}

function spinWait() {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? 900 : 6150;
}

// Короткий отклик на приземление стрелки: 12 мс на промах, двойной тик на выигрыш.
function haptic(won) {
  if (navigator.vibrate) navigator.vibrate(won ? [0, 12, 44, 22] : 12);
}

// Сектор выигрыша закреплён снизу по центру: старт от 12 часов, ширина = шанс * 360.
function winStart(chance) {
  return 180 - 180 * (Number(chance) || 0);
}

// Указатель останавливается там же, куда попал бросок сервера (доля оборота).
function needleAngle(chance, roll) {
  return winStart(chance) + (Number(roll) || 0) * 360;
}

function groupTargets(list) {
  const groups = [];
  list.forEach(function (t) {
    const last = groups[groups.length - 1];
    if (last && last.rarity === t.rarity) last.items.push(t);
    else groups.push({ rarity: t.rarity, items: [t] });
  });
  return groups;
}

function SourceTile({ item, active, disabled, onClick }) {
  const label = item.name + " #" + item.serial + " · " + money(item.value);
  return (
    <button type="button" title={label} aria-label={label} className={"upg-src nft-r-" + item.rarity + (active ? " is-on" : "")} disabled={disabled} onClick={onClick}>
      <span className="upg-src-art"><NftArt art={item.art} rarity={item.rarity} /></span>
      <span className="upg-src-val">{money(item.value)}</span>
    </button>
  );
}

function TargetTile({ target, active, disabled, onClick }) {
  const label = target.name + " · " + pct(target.chance) + " chance";
  return (
    <button type="button" title={label} aria-label={label} className={"upg-tgt nft-r-" + target.rarity + (active ? " is-on" : "")} disabled={disabled} onClick={onClick}>
      <span className="upg-tgt-art"><NftArt art={target.art} rarity={target.rarity} /></span>
      <span className="upg-tgt-chance">{pct(target.chance)}</span>
    </button>
  );
}

export default function NftUpgrade() {
  const navigate = useNavigate();
  const back = useNftBack("/nft/inventory");
  const { state, error, upgrade } = useNftState();
  const [sourceId, setSourceId] = useState(null);
  const [view, setView] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [spin, setSpin] = useState(false);
  const [angle, setAngle] = useState(0);
  const [noAnim, setNoAnim] = useState(false);
  const [burst, setBurst] = useState(false);
  const [land, setLand] = useState(false);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [toast, showToast] = useNftToast();

  const items = ((state && state.items) || []).filter(function (it) { return !it.listingId; });
  const source = view ? view.item : items.find(function (it) { return it.id === sourceId; }) || null;
  const target = view && targetId ? view.targets.find(function (t) { return t.templateId === targetId; }) || null : null;
  const groups = view ? groupTargets(view.targets) : [];
  const busy = spin || land || burst;

  useEffect(function () {
    if (!sourceId) return undefined;
    let alive = true;
    setLoading(true);
    setLoadError("");
    authFetch("/nft/upgrade?itemId=" + sourceId).then(function (data) {
      if (!alive) return;
      setView(data);
      setTargetId(data.targets && data.targets.length ? data.targets[0].templateId : null);
    }).catch(function (e) {
      if (alive) setLoadError(e && e.message ? e.message : "Could not load upgrade options");
    }).then(function () { if (alive) setLoading(false); });
    return function () { alive = false; };
  }, [sourceId]);

  function resetWheel() {
    setNoAnim(true);
    setAngle(0);
    window.setTimeout(function () { setNoAnim(false); }, 40);
  }

  function pickSource(item) {
    if (busy) return;
    setResult(null);
    setTargetId(null);
    setView(null);
    resetWheel();
    setSourceId(sourceId === item.id ? null : item.id);
  }

  function again() {
    setBurst(false);
    setLand(false);
    setResult(null);
    setView(null);
    setTargetId(null);
    setSourceId(null);
    resetWheel();
  }

  function run() {
    if (!source || !target || busy) return;
    setConfirm(false);
    setLand(false);
    setSpin(true);
    // Круг, тики и сектор выигрыша неподвижны — вращается только стрелка.
    const from = Math.ceil(angle / 360) * 360;
    upgrade(source.id, target.templateId).then(function (r) {
      setAngle(from + 360 * TURNS + needleAngle(r.chance, r.roll));
      window.setTimeout(function () {
        setSpin(false);
        setLand(true);
        haptic(r.won);
        window.setTimeout(function () { setLand(false); }, 700);
        if (!r.won) {
          // Даём стрелке осесть, и только потом показываем карточку.
          window.setTimeout(function () { setResult(r); }, 520);
          return;
        }
        // Сначала короткий залп на колесе, потом карточка результата.
        setBurst(true);
        window.setTimeout(function () {
          setBurst(false);
          setResult(r);
        }, 1400);
      }, spinWait());
    }).catch(function (e) {
      setSpin(false);
      showToast(false, e && e.message ? e.message : "Upgrade failed");
    });
  }

  const winLen = target ? target.chance * CIRC : 0;

  return (
    <div className="nft-page nft-upgrade-page">
      <NftTopbar title="Upgrade" onBack={back} />
      <div className="nft-wrap upg-wrap">
        {!state && (error
          ? <div className="upg-empty upg-center"><b>Could not load NFTs</b><span>{error}</span></div>
          : <Skeleton rows={3} hero />)}

        {state && items.length === 0 && (
          <div className="upg-empty upg-center">
            <span className="upg-pick-art"><NftIcon name="upgrade" /></span>
            <b>Nothing to upgrade</b>
            <span>Get an NFT from a drop, the Battle Pass or Daily Rewards first.</span>
            <div className="nft-empty-actions">
              <button className="nft-btn nft-btn--light" type="button" onClick={function () { navigate("/nft"); }}>See drops</button>
              <button className="nft-btn nft-btn--glass" type="button" onClick={function () { navigate("/nft/market"); }}>Open market</button>
            </div>
          </div>
        )}

        {state && items.length > 0 && (
          <>
            {!result && (
              <>
                <div className="nft-section-head upg-head">
                  <span>Your stake</span>
                  <small>{source ? source.name + " #" + source.serial : items.length + " available"}</small>
                </div>
                <div className="upg-sources">
                  {items.map(function (it) {
                    return <SourceTile key={it.id} item={it} active={it.id === sourceId} disabled={busy} onClick={function () { pickSource(it); }} />;
                  })}
                </div>
              </>
            )}

            {!sourceId && !result && (
              <div className="upg-empty upg-center">
                <span className="upg-pick-art"><NftIcon name="upgrade" /></span>
                <b>Pick an NFT to start</b>
                <span>Choose what you risk above, then a target one or two rarities higher.</span>
              </div>
            )}

            {loading && <div className="upg-loading">Loading targets...</div>}
            {loadError && <p className="nft-note is-err">{loadError}</p>}

            {view && !result && view.targets.length > 0 && (
              <>
                <div className="nft-section-head upg-head">
                  <span>Target</span>
                  <small>one or two rarities higher</small>
                </div>
                <div className="upg-targets">
                  {groups.map(function (g) {
                    return (
                      <Fragment key={g.rarity}>
                        <span className={"upg-tier nft-r-" + g.rarity}>{rarityTitle(g.rarity)}</span>
                        {g.items.map(function (t) {
                          return <TargetTile key={t.templateId} target={t} active={t.templateId === targetId} disabled={busy} onClick={function () { if (!busy) setTargetId(t.templateId); }} />;
                        })}
                      </Fragment>
                    );
                  })}
                </div>
              </>
            )}

            {view && !result && view.targets.length === 0 && (
              <div className="upg-empty upg-center">
                <b>No targets right now</b>
                <span>Higher tiers are sold out, or this NFT is already at the top.</span>
              </div>
            )}

            {target && !result && (
              <div className="upg-stage">
                <div className="upg-picked">
                  <b>{source.name + " #" + source.serial}</b>
                  <span className="upg-picked-arrow"><NftIcon name="upgrade" /></span>
                  <b className={"nft-r-" + target.rarity}>{target.name}</b>
                </div>

                <div className={"upg-gauge nft-r-" + target.rarity + (spin ? " is-spin" : "") + (land ? " is-land" : "") + (burst ? " is-win" : "")}>
                  <svg className="upg-gauge-base" viewBox="0 0 240 240" aria-hidden="true">
                    <circle className="upg-track" cx="120" cy="120" r={RADIUS} />
                    <circle
                      className="upg-arc"
                      cx="120"
                      cy="120"
                      r={RADIUS}
                      transform={"rotate(" + (90 - 180 * target.chance) + " 120 120)"}
                      style={{ strokeDasharray: winLen + " " + CIRC }}
                    />
                    <circle className="upg-ticks" cx="120" cy="120" r={RADIUS} />
                    <circle className="upg-ring" cx="120" cy="120" r="116" />
                    <circle className="upg-ring" cx="120" cy="120" r="82" />
                  </svg>
                  <span className={"upg-needle" + (noAnim ? " no-anim" : "")} style={{ transform: "rotate(" + angle + "deg)" }} aria-hidden="true">
                    <svg viewBox="0 0 240 240">
                      <path className="upg-needle-tip" d="M120 24 L111 39 L129 39 Z" />
                    </svg>
                  </span>
                  {burst && (
                    <span className="upg-burst" aria-hidden="true">
                      <span className="upg-burst-flash" />
                      <span className="upg-burst-rings"><span /><span /></span>
                      {SPARKS.map(function (d, i) {
                        return (
                          <span key={i} className="upg-spark" style={{ "--a": i * 30 + "deg", "--d": (i % 4) * 55 + "ms" }}>
                            <i />
                          </span>
                        );
                      })}
                    </span>
                  )}
                  <span className="upg-hub">
                    <b>{pct(target.chance)}</b>
                    <em>{chanceWord(target.chance) + " chance"}</em>
                  </span>
                </div>

                <div className="upg-readout">
                  <div><span>You risk</span><b>{money(source.value)}</b></div>
                  <div><span>You can get</span><b>{money(target.basePrice)}</b></div>
                  <div><span>Potential</span><b>{money(target.basePrice - source.value)}</b></div>
                </div>

                <button className="nft-btn nft-btn--light nft-btn--block" type="button" disabled={busy} onClick={function () { setConfirm(true); }}>
                  {spin ? "Spinning..." : "Upgrade · " + pct(target.chance)}
                </button>
                <p className="nft-hint upg-hint">Your NFT is consumed either way.</p>
              </div>
            )}

            {result && (
              <div className={"upg-result" + (result.won ? " is-win nft-r-" + result.item.rarity : " is-loss")}>
                <span className={"upg-result-art nft-r-" + (result.won ? result.item.rarity : result.source.rarity)}>
                  <NftArt art={result.won ? result.item.art : result.source.art} rarity={result.won ? result.item.rarity : result.source.rarity} />
                </span>
                <span className="upg-result-body">
                  <span className="nft-kicker">{result.won ? "Upgrade complete" : "Upgrade failed"}</span>
                  <b>{result.won ? result.item.name + " #" + result.item.serial : result.source.name + " #" + result.source.serial + " is gone"}</b>
                  <span>{result.won
                    ? "Added to your inventory · " + money(result.item.value)
                    : "Chance was " + pct(result.chance) + " · nothing returned"}</span>
                </span>
                <div className="upg-result-actions">
                  <button className="nft-btn nft-btn--light" type="button" onClick={again}>Upgrade again</button>
                  <button className="nft-btn nft-btn--glass" type="button" onClick={function () { navigate("/nft/inventory"); }}>Inventory</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <NftConfirm
        open={confirm && !!source && !!target}
        title="Start the upgrade?"
        text={source && target ? source.name + " #" + source.serial + " will be consumed. You have a " + pct(target.chance) + " chance to receive " + target.name + " worth " + money(target.basePrice) + ". On a miss nothing is returned." : ""}
        confirm="Upgrade now"
        tone="danger"
        onCancel={function () { setConfirm(false); }}
        onConfirm={run}
      />

      <NftToast toast={toast} />
    </div>
  );
}
