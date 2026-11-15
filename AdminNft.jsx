import React, { useCallback, useEffect, useMemo, useState } from "react";
import { authFetch } from "./apiClient";
import { NftArt, NftPortal, RarityPill, RARITIES, money, perHour, pendingText, rarityTitle, useOverlayLock } from "./nftShared";

function post(path, body) {
  return authFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

// Общий запуск действий: блокировка кнопок и строка результата внутри оверлея
function useAction() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  async function run(fn, okText) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fn();
      if (okText) setMsg({ ok: true, text: typeof okText === "function" ? okText(res) : okText });
      return res || true;
    } catch (err) {
      setMsg({ ok: false, text: (err && err.message) || "Error" });
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, msg, setMsg, run };
}

function dateText(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AdxSheet({ eyebrow, title, onClose, msg, children }) {
  useOverlayLock(true, onClose);
  return (
    <NftPortal>
      <div className="adx-overlay" onClick={onClose}>
        <div className="adx-sheet" onClick={function (e) { e.stopPropagation(); }}>
          <div className="adm-detail-handle"></div>
          <div className="adx-head">
            <div>
              <span className="adx-eyebrow">{eyebrow}</span>
              <h2 className="adx-title">{title}</h2>
            </div>
            <button className="adm-detail-close" type="button" onClick={onClose}>✕</button>
          </div>
          {msg && <div className={"adm-msg adx-msg " + (msg.ok ? "ok" : "err")}>{msg.text}</div>}
          {children}
        </div>
      </div>
    </NftPortal>
  );
}

function AdxTabs({ tabs, value, onChange }) {
  return (
    <div className="adx-tabs">
      {tabs.map(function (t) {
        return (
          <button key={t[0]} type="button" className={"adx-tab" + (value === t[0] ? " is-on" : "")} onClick={function () { onChange(t[0]); }}>
            {t[1]}
          </button>
        );
      })}
    </div>
  );
}

function AdxStat({ label, value }) {
  return <div className="adx-stat"><span>{label}</span><strong>{value}</strong></div>;
}

function collectionStatus(c) {
  const now = Date.now();
  if (new Date(c.startsAt).getTime() > now) return "Upcoming";
  return c.active ? "Live" : "Ended";
}

function TemplateRow({ t, busy, onSave }) {
  const [edit, setEdit] = useState(null);
  return (
    <div className="adx-row adx-row--stack">
      <div className="adx-row-main">
        <NftArt art={t.art} rarity={t.rarity} className="adx-thumb" />
        <div className="adx-row-text">
          <span className="adx-row-name">{t.name}</span>
          <span className="adx-row-sub"><RarityPill rarity={t.rarity} /> {t.minted + " / " + t.supply + " minted"}</span>
        </div>
        <div className="adx-row-side">
          <span>{money(t.basePrice)}</span>
          <span className="adx-dim">{perHour(t.incomeHour)}</span>
        </div>
        <button type="button" className="adx-mini" onClick={function () {
          setEdit(edit ? null : { supply: String(t.supply), basePrice: String(t.basePrice), incomeHour: String(t.incomeHour) });
        }}>{edit ? "Close" : "Edit"}</button>
      </div>
      {edit && (
        <div className="adx-edit">
          <label>Supply<input className="adm-control-input" inputMode="numeric" value={edit.supply} onChange={function (e) { setEdit({ ...edit, supply: e.target.value }); }} /></label>
          <label>Base price<input className="adm-control-input" inputMode="decimal" value={edit.basePrice} onChange={function (e) { setEdit({ ...edit, basePrice: e.target.value }); }} /></label>
          <label>Income / h<input className="adm-control-input" inputMode="decimal" value={edit.incomeHour} onChange={function (e) { setEdit({ ...edit, incomeHour: e.target.value }); }} /></label>
          <button type="button" className="adm-control-btn" disabled={busy} onClick={async function () {
            const ok = await onSave({ action: "template", templateId: t.id, supply: parseInt(edit.supply, 10) || 0,
              basePrice: parseFloat(edit.basePrice) || 0, incomeHour: parseFloat(edit.incomeHour) || 0 });
            if (ok) setEdit(null);
          }}>Save</button>
        </div>
      )}
    </div>
  );
}

function PackRow({ p, busy, onSave }) {
  const [edit, setEdit] = useState(null);
  return (
    <div className="adx-row adx-row--stack">
      <div className="adx-row-main">
        <span className="adx-pack-tag">{p.kind}</span>
        <div className="adx-row-text">
          <span className="adx-row-name">{p.name}</span>
          <span className="adx-row-sub">{p.caption + " · " + p.sold + " / " + p.stock + " sold"}</span>
        </div>
        <div className="adx-row-side"><span>{money(p.price)}</span></div>
        <button type="button" className="adx-mini" onClick={function () {
          setEdit(edit ? null : { price: String(p.price), stock: String(p.stock) });
        }}>{edit ? "Close" : "Edit"}</button>
      </div>
      {edit && (
        <div className="adx-edit">
          <label>Price<input className="adm-control-input" inputMode="decimal" value={edit.price} onChange={function (e) { setEdit({ ...edit, price: e.target.value }); }} /></label>
          <label>Stock<input className="adm-control-input" inputMode="numeric" value={edit.stock} onChange={function (e) { setEdit({ ...edit, stock: e.target.value }); }} /></label>
          <button type="button" className="adm-control-btn" disabled={busy} onClick={async function () {
            const ok = await onSave({ action: "pack", packId: p.id, price: parseFloat(edit.price) || 0, stock: parseInt(edit.stock, 10) || 0 });
            if (ok) setEdit(null);
          }}>Save</button>
        </div>
      )}
    </div>
  );
}

// Глобальное управление NFT: дропы, маркет и полный сброс экономики
export function AdminNftOverlay({ onClose }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("drops");
  const [openId, setOpenId] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const { busy, msg, setMsg, run } = useAction();

  const load = useCallback(function () {
    return authFetch("/admin/nft/overview").then(setData).catch(function (err) { setMsg({ ok: false, text: err.message || "Error" }); });
  }, [setMsg]);
  useEffect(function () { load(); }, [load]);

  async function act(body, okText) {
    const res = await run(function () { return post("/admin/nft/action", body); }, okText);
    if (res) await load();
    return res;
  }

  function removeListing(l) {
    if (!window.confirm("Remove " + l.item.name + " #" + l.item.serial + " from the market? The NFT stays with " + l.seller + ".")) return;
    act({ action: "unlist", listingId: l.id }, "Listing removed");
  }

  function removeAll() {
    if (!window.confirm("Remove every player listing from the market?")) return;
    act({ action: "unlist-all" }, function (r) { return r.removed + " listings removed"; });
  }

  async function resetAll() {
    if (confirmText !== "RESET") return;
    if (!window.confirm("Last check: delete ALL NFTs of ALL players and restore every drop to its original state?")) return;
    const res = await act({ action: "reset-all", confirm: "RESET" }, function (r) {
      return "Reset done · " + r.items + " NFTs deleted · " + r.collections + " drops restored";
    });
    if (res) setConfirmText("");
  }

  const totals = data ? data.totals : null;

  return (
    <AdxSheet eyebrow="NFT Control" title="Collections & Market" onClose={onClose} msg={msg}>
      {!data && <div className="adx-empty">Loading…</div>}
      {data && (
        <>
          <div className="adx-stats">
            <AdxStat label="NFTs" value={totals.items} />
            <AdxStat label="Owners" value={totals.owners} />
            <AdxStat label="Listed" value={totals.listings} />
            <AdxStat label="Volume" value={money(totals.volume)} />
          </div>
          <AdxTabs tabs={[["drops", "Drops"], ["market", "Market · " + data.listings.length], ["reset", "Reset"]]} value={tab} onChange={setTab} />

          {tab === "drops" && (
            <div className="adx-list">
              {data.collections.length === 0 && <div className="adx-empty">No drops yet</div>}
              {data.collections.map(function (c) {
                const minted = c.templates.reduce(function (s, t) { return s + t.minted; }, 0);
                const supply = c.templates.reduce(function (s, t) { return s + t.supply; }, 0);
                const open = openId === c.id;
                const status = collectionStatus(c);
                return (
                  <div key={c.id} className={"adx-card" + (open ? " is-open" : "")}>
                    <button type="button" className="adx-card-head" onClick={function () { setOpenId(open ? null : c.id); }}>
                      <div className="adx-row-text">
                        <span className="adx-row-name">{c.name}</span>
                        <span className="adx-row-sub">{c.theme + " · " + dateText(c.startsAt) + " → " + dateText(c.endsAt)}</span>
                      </div>
                      <span className={"adx-badge is-" + status.toLowerCase()}>{status}</span>
                      <span className="adx-dim">{minted + "/" + supply}</span>
                    </button>
                    {open && (
                      <div className="adx-card-body">
                        <span className="adm-control-label">Templates</span>
                        {c.templates.map(function (t) {
                          return <TemplateRow key={t.id} t={t} busy={busy} onSave={function (b) { return act(b, t.name + " updated"); }} />;
                        })}
                        <span className="adm-control-label">Packs</span>
                        {c.packs.map(function (p) {
                          return <PackRow key={p.id} p={p} busy={busy} onSave={function (b) { return act(b, p.name + " updated"); }} />;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="adx-note">{"Next drop: " + data.nextDrop.name + " · " + dateText(data.nextDrop.startsAt)}</div>
            </div>
          )}

          {tab === "market" && (
            <div className="adx-list">
              <button type="button" className="adx-danger" disabled={busy || data.listings.length === 0} onClick={removeAll}>Remove all listings</button>
              {data.listings.length === 0 && <div className="adx-empty">Market is empty</div>}
              {data.listings.map(function (l) {
                return (
                  <div key={l.id} className="adx-row">
                    <div className="adx-row-main">
                      <NftArt art={l.item.art} rarity={l.item.rarity} className="adx-thumb" />
                      <div className="adx-row-text">
                        <span className="adx-row-name">{l.item.name + " #" + l.item.serial}</span>
                        <span className="adx-row-sub">{l.seller + (l.sellerId ? " · " + l.sellerId : "") + " · " + dateText(l.createdAt)}</span>
                      </div>
                      <div className="adx-row-side">
                        <span>{money(l.price)}</span>
                        <span className="adx-dim">{"value " + money(l.item.value)}</span>
                      </div>
                      <button type="button" className="adx-mini adx-mini--danger" disabled={busy} onClick={function () { removeListing(l); }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "reset" && (
            <div className="adx-reset">
              <span className="adx-reset-title">Full NFT reset</span>
              <ul className="adx-reset-list">
                <li>{"Deletes all " + totals.items + " NFTs, including Battle Pass and Daily Rewards drops"}</li>
                <li>Clears market listings, sales history and the xwallet showcase</li>
                <li>Wipes collected income, earnings and spending stats</li>
                <li>Restores every drop, template and pack to its original supply and stock</li>
              </ul>
              <span className="adm-control-label">Type RESET to confirm</span>
              <div className="adm-control-row">
                <input className="adm-control-input" value={confirmText} placeholder="RESET" onChange={function (e) { setConfirmText(e.target.value.toUpperCase()); }} />
                <button type="button" className="adx-danger" disabled={busy || confirmText !== "RESET"} onClick={resetAll}>Reset</button>
              </div>
            </div>
          )}
        </>
      )}
    </AdxSheet>
  );
}

// NFT конкретного игрока: выдача, удаление, снятие с маркета
export function AdminPlayerNftOverlay({ playerId, username, onClose }) {
  const [player, setPlayer] = useState(null);
  const [overview, setOverview] = useState(null);
  const [mode, setMode] = useState("rarity");
  const [rarity, setRarity] = useState(RARITIES[0]);
  const [templateId, setTemplateId] = useState("");
  const [pack, setPack] = useState("");
  const [count, setCount] = useState("1");
  const { busy, msg, setMsg, run } = useAction();

  const load = useCallback(function () {
    return authFetch("/admin/nft/player?playerId=" + encodeURIComponent(playerId)).then(setPlayer)
      .catch(function (err) { setMsg({ ok: false, text: err.message || "Error" }); });
  }, [playerId, setMsg]);
  useEffect(function () { load(); }, [load]);
  useEffect(function () {
    authFetch("/admin/nft/overview").then(setOverview).catch(function () {});
  }, []);

  const templates = useMemo(function () {
    if (!overview) return [];
    const out = [];
    overview.collections.forEach(function (c) {
      c.templates.forEach(function (t) {
        if (t.minted < t.supply) out.push({ id: t.id, label: c.name + " · " + t.name + " · " + rarityTitle(t.rarity) + " (" + t.minted + "/" + t.supply + ")" });
      });
    });
    return out;
  }, [overview]);
  const packs = overview ? overview.packDefs : [];

  async function act(body, okText) {
    const res = await run(function () { return post("/admin/nft/action", { playerId: playerId, ...body }); }, okText);
    if (res) await load();
    return res;
  }

  function grant() {
    const body = { action: "grant", count: Math.min(50, Math.max(1, parseInt(count, 10) || 1)) };
    if (mode === "template") body.templateId = templateId || (templates[0] && templates[0].id) || "";
    else if (mode === "pack") body.pack = pack || (packs[0] && packs[0].code) || "";
    else body.rarity = rarity;
    act(body, function (r) { return "Granted " + r.items.length + " NFT" + (r.items.length === 1 ? "" : "s") + (r.note ? " · " + r.note : ""); });
  }

  function remove(item) {
    if (!window.confirm("Delete " + item.name + " #" + item.serial + "? Its listing is removed too. Minted supply is not restored.")) return;
    act({ action: "delete", itemId: item.id }, "NFT deleted");
  }

  function wipe() {
    if (!window.confirm("Delete ALL NFTs of " + username + ", their listings and NFT stats?")) return;
    act({ action: "wipe-player" }, function (r) { return r.deleted + " NFTs deleted"; });
  }

  return (
    <AdxSheet eyebrow={username + " · NFT"} title="Player NFTs" onClose={onClose} msg={msg}>
      {player && (
        <div className="adx-stats">
          <AdxStat label="Owned" value={player.count} />
          <AdxStat label="Listed" value={player.listed} />
          <AdxStat label="Value" value={money(player.value)} />
          <AdxStat label="Pending" value={pendingText(player.pending)} />
        </div>
      )}

      <div className="adx-block">
        <span className="adm-control-label">Grant NFT</span>
        <AdxTabs tabs={[["rarity", "Random"], ["template", "Exact"], ["pack", "Pack"]]} value={mode} onChange={setMode} />
        <div className="adm-control-row">
          {mode === "rarity" && (
            <select className="adm-control-select" value={rarity} onChange={function (e) { setRarity(e.target.value); }}>
              {RARITIES.map(function (r) { return <option key={r} value={r}>{rarityTitle(r)}</option>; })}
            </select>
          )}
          {mode === "template" && (
            <select className="adm-control-select" value={templateId} onChange={function (e) { setTemplateId(e.target.value); }}>
              {templates.length === 0 && <option value="">No templates with supply left</option>}
              {templates.map(function (t) { return <option key={t.id} value={t.id}>{t.label}</option>; })}
            </select>
          )}
          {mode === "pack" && (
            <select className="adm-control-select" value={pack} onChange={function (e) { setPack(e.target.value); }}>
              {packs.map(function (p) { return <option key={p.code} value={p.code}>{p.name + " · " + p.caption}</option>; })}
            </select>
          )}
          <input className="adm-control-input adx-count" inputMode="numeric" value={count} onChange={function (e) { setCount(e.target.value.replace(/\D/g, "")); }} aria-label="Count" />
          <button type="button" className="adm-control-btn" disabled={busy} onClick={grant}>Grant</button>
        </div>
      </div>

      <div className="adx-block">
        <div className="adx-block-head">
          <span className="adm-control-label">{"Inventory · " + (player ? player.items.length : 0)}</span>
          <button type="button" className="adx-mini adx-mini--danger" disabled={busy || !player || player.items.length === 0} onClick={wipe}>Delete all</button>
        </div>
        {!player && <div className="adx-empty">Loading…</div>}
        {player && player.items.length === 0 && <div className="adx-empty">No NFTs</div>}
        {player && player.items.map(function (it) {
          return (
            <div key={it.id} className="adx-row">
              <div className="adx-row-main">
                <NftArt art={it.art} rarity={it.rarity} className="adx-thumb" />
                <div className="adx-row-text">
                  <span className="adx-row-name">{it.name + " #" + it.serial}</span>
                  <span className="adx-row-sub"><RarityPill rarity={it.rarity} /> {it.source}</span>
                </div>
                <div className="adx-row-side">
                  <span>{money(it.value)}</span>
                  {it.listingId ? <span className="adx-listed">{"Listed " + money(it.listPrice)}</span> : <span className="adx-dim">{perHour(it.incomeHour)}</span>}
                </div>
                <div className="adx-row-btns">
                  {it.listingId > 0 && (
                    <button type="button" className="adx-mini" disabled={busy} onClick={function () { act({ action: "unlist", listingId: it.listingId }, "Listing removed"); }}>Unlist</button>
                  )}
                  <button type="button" className="adx-mini adx-mini--danger" disabled={busy} onClick={function () { remove(it); }}>Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdxSheet>
  );
}

// Ежедневные награды и уровни Battle Pass конкретного игрока
export function AdminProgressOverlay({ playerId, username, mode, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [track, setTrack] = useState("start");
  const [target, setTarget] = useState(1);
  const { busy, msg, setMsg, run } = useAction();

  const load = useCallback(function () {
    return authFetch("/admin/progress?playerId=" + encodeURIComponent(playerId)).then(function (res) {
      setData(res);
      setTarget(res.battlepass.level);
      setTrack(res.daily.track === "pro" ? "pro" : "start");
    }).catch(function (err) { setMsg({ ok: false, text: err.message || "Error" }); });
  }, [playerId, setMsg]);
  useEffect(function () { load(); }, [load]);

  async function act(body, okText) {
    const res = await run(function () { return post("/admin/progress/action", { playerId: playerId, ...body }); }, okText);
    if (res) {
      await load();
      if (onChanged) onChanged();
    }
  }

  if (mode === "daily") {
    const d = data && data.daily;
    const ready = d && (!d.nextClaimAt || new Date(d.nextClaimAt).getTime() <= Date.now());
    const wait = d && !ready ? Math.max(1, Math.round((new Date(d.nextClaimAt).getTime() - Date.now()) / 3600000)) : 0;
    const nextText = ready ? "Ready" : wait >= 24 ? Math.round(wait / 24) + "d" : wait + "h";
    return (
      <AdxSheet eyebrow={username + " · Daily Rewards"} title="Daily Rewards" onClose={onClose} msg={msg}>
        {!d && <div className="adx-empty">Loading…</div>}
        {d && (
          <>
            <div className="adx-stats">
              <AdxStat label="Track" value={d.track === "none" ? "Finished" : rarityTitle(d.track)} />
              <AdxStat label="Start" value={(d.claims.start || 0) + "/" + d.totalDays} />
              <AdxStat label="Pro" value={(d.claims.pro || 0) + "/" + d.totalDays} />
              <AdxStat label="Next" value={nextText} />
            </div>
            <div className="adx-block">
              <span className="adm-control-label">{"Last claim · " + dateText(d.lastClaimedAt)}</span>
              <button type="button" className="adx-wide" disabled={busy || ready} onClick={function () { act({ action: "daily-ready" }, "Next reward is claimable now"); }}>Skip cooldown</button>
              {!ready && <span className="adx-note">{"Next claim · " + dateText(d.nextClaimAt)}</span>}
            </div>
            <div className="adx-block">
              <span className="adm-control-label">Reset to day 1</span>
              <div className="adm-control-row">
                <select className="adm-control-select" value={track} onChange={function (e) { setTrack(e.target.value); }}>
                  <option value="start">Start track</option>
                  <option value="pro">Pro track</option>
                </select>
                <button type="button" className="adx-danger" disabled={busy} onClick={function () {
                  if (!window.confirm("Erase all daily reward claims of " + username + " and restart the " + track + " track from day 1?")) return;
                  act({ action: "daily-reset", track: track }, "Daily rewards reset to day 1");
                }}>Reset</button>
              </div>
              <span className="adx-note">Claim history is erased and the cooldown is cleared. Rewards already received stay with the player.</span>
            </div>
          </>
        )}
      </AdxSheet>
    );
  }

  const bp = data && data.battlepass;
  const clamp = function (v) { return bp ? Math.min(bp.maxLevel, Math.max(1, v)) : 1; };
  const lost = bp ? bp.claims.filter(function (c) { return c.level > target; }).length : 0;

  function apply() {
    if (target === bp.level) return;
    if (target < bp.level) {
      const text = "Lower " + username + " from level " + bp.level + " to " + target + "?" +
        (lost ? " " + lost + " claimed rewards above level " + target + " and their unopened cases will be erased." : "");
      if (!window.confirm(text)) return;
    }
    act({ action: "bp-level", level: target }, "Battle Pass set to level " + target);
  }

  return (
    <AdxSheet eyebrow={username + " · Battle Pass"} title="Battle Pass Level" onClose={onClose} msg={msg}>
      {!bp && <div className="adx-empty">Loading…</div>}
      {bp && (
        <>
          <div className="adx-level">
            <span className="adx-level-num">{bp.level}</span>
            <span className="adx-level-of">{"/ " + bp.maxLevel}</span>
          </div>
          <div className="adx-level-bar"><span style={{ width: Math.min(100, (bp.levelXp / bp.xpPerLevel) * 100) + "%" }}></span></div>
          <div className="adx-stats">
            <AdxStat label="XP" value={bp.xp.toLocaleString("en-US")} />
            <AdxStat label="Track" value={bp.passOwned ? "Pass" : "Free"} />
            <AdxStat label="Claimed" value={bp.claims.length} />
            <AdxStat label="Cases" value={bp.pendingCases} />
          </div>
          <div className="adx-block">
            <span className="adm-control-label">{bp.season.label}</span>
            <div className="adx-stepper">
              {[-5, -1].map(function (n) {
                return <button key={n} type="button" className="adx-step" onClick={function () { setTarget(clamp(target + n)); }}>{n}</button>;
              })}
              <input className="adm-control-input adx-step-input" inputMode="numeric" value={target}
                onChange={function (e) { setTarget(clamp(parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)); }} />
              {[1, 5].map(function (n) {
                return <button key={n} type="button" className="adx-step" onClick={function () { setTarget(clamp(target + n)); }}>{"+" + n}</button>;
              })}
            </div>
            {target < bp.level && lost > 0 && (
              <span className="adx-warn">{lost + " claimed rewards above level " + target + " will be erased so they can be claimed again."}</span>
            )}
            <button type="button" className="adm-control-btn adx-wide-btn" disabled={busy || target === bp.level} onClick={apply}>
              {target === bp.level ? "Pick a level" : (target > bp.level ? "Add " + (target - bp.level) : "Remove " + (bp.level - target)) + " level" + (Math.abs(target - bp.level) === 1 ? "" : "s")}
            </button>
            <span className="adx-note">Progress inside the current level is kept. Rewards already received stay with the player.</span>
          </div>
        </>
      )}
    </AdxSheet>
  );
}
