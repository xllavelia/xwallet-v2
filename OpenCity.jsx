import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { useWalletBalance } from "./useWallet";
import { OpenCityGame } from "./opencity/game";
import { VirtualJoystick, KeyboardInput } from "./opencity/input";
import {
  STAT_DEFS, FOOD_HEAL, ACHIEVEMENTS, itemKind,
  parseProgress, applyProgress
} from "./opencity/progress";
import { WEAPONS } from "./opencity/weapons";

function formatMoney(n) {
  if (n == null || isNaN(n)) return "—";
  return "$" + n.toFixed(2);
}

var TABS = [
  { id: "weapons", label: "Weapons" },
  { id: "ammo", label: "Ammo" },
  { id: "items", label: "Items" },
  { id: "quest", label: "Quest Items" }
];

var HERO_TABS = [
  { id: "inventory", label: "Inventory" },
  { id: "progression", label: "Progression" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" }
];

function itemTab(entry) {
  var k = itemKind(entry);
  if (k === "weapon") return "weapons";
  if (k === "ammo") return "ammo";
  if (k === "quest") return "quest";
  return "items";
}

// overlay-карта: районы, здания и POI из данных города; POI и здания
// рисуются только для открытых районов, игрок — всегда
function MapOverlay(props) {
  var data = props.data;
  if (!data) return null;
  var w = data.world.w, h = data.world.h;
  return (
    <div className="oc-overlay oc-map-overlay" onPointerDown={props.onStop} onTouchStart={props.onStop} onTouchMove={props.onStop}>
      <div className="oc-map-panel">
        <div className="oc-map-top">
          <span className="oc-map-title">City Map</span>
          <span className="oc-map-loc">{data.location}</span>
          <button className="oc-bp-close" onClick={props.onClose}>Close</button>
        </div>
     <svg className="oc-map-svg" viewBox={"0 0 " + w + " " + h} preserveAspectRatio="xMidYMid meet">
  {data.districts.map(function (d) {
    var disc = !!data.discovered[d.id];
    return (
      <g key={d.id}>
        <rect x={d.rect.x} y={d.rect.y} width={d.rect.w} height={d.rect.h} className={"oc-map-d" + (disc ? " disc" : "")} />
        <text x={d.rect.x + 40} y={d.rect.y + 90} className="oc-map-dlabel">{disc ? d.name : "???"}</text>
      </g>
    );
  })}
  {(data.water || []).map(function (wv, i) {
    return <rect key={"w" + i} x={wv.x} y={wv.y} width={wv.w} height={wv.h} className="oc-map-water" />;
  })}
  {(data.parks || []).map(function (p, i) {
    return <rect key={"p" + i} x={p.x} y={p.y} width={p.w} height={p.h} className="oc-map-park" />;
  })}
  {(data.roads || []).map(function (r, i) {
    return <rect key={"r" + i} x={r.x} y={r.y} width={r.w} height={r.h} className={"oc-map-road" + (r.kind === "avenue" ? " ave" : "")} />;
  })}
  {data.plaza && <rect x={data.plaza.x} y={data.plaza.y} width={data.plaza.w} height={data.plaza.h} className="oc-map-plaza" />}
  {data.buildings.filter(function (b) { return data.discovered[b.district]; }).map(function (b) {
    return <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} className="oc-map-b" />;
  })}
  {data.pois.filter(function (p) { return !p.requiresDistrict || data.discovered[p.requiresDistrict]; }).map(function (p) {
    return (
      <g key={p.id}>
        <circle cx={p.x} cy={p.y} r={40} className="oc-map-poi" />
        <text x={p.x} y={p.y - 56} className="oc-map-poilabel" textAnchor="middle">{p.name}</text>
      </g>
    );
  })}
  <circle cx={data.player.x} cy={data.player.y} r={46} className="oc-map-player" />
</svg>
      </div>
    </div>
  );
}

const OpenCity = () => {
  var navigate = useNavigate();
  var hostRef = useRef(null);
  var zoneRef = useRef(null);
  var gameRef = useRef(null);
  var prevLevelRef = useRef(0);
  var [doc, setDoc] = useState(null);
  var [error, setError] = useState(null);
  var [action, setAction] = useState(null);
  var [dialog, setDialog] = useState(null);
  var [building, setBuilding] = useState(null);
  var [toast, setToast] = useState(null);
  var [weaponHud, setWeaponHud] = useState(null);
  var [hp, setHp] = useState({ hp: 100, max: 100 });
  var [dead, setDead] = useState(false);
  var [inv, setInv] = useState([]);
  var [prog, setProg] = useState(null);
  var [hero, setHero] = useState(false);
  var [heroTab, setHeroTab] = useState("inventory");
  var [tab, setTab] = useState("weapons");
  var [sel, setSel] = useState(null);
  var [mapOpen, setMapOpen] = useState(false);
  var [mapData, setMapData] = useState(null);
  var { wallet } = useWalletBalance();

  var usdt = wallet && wallet.balance != null ? wallet.balance : null;

  function syncState(data) {
    if (!data) return;
    if (data.balances) setDoc(data.balances.doc);
    if (data.inventory) {
      setInv(data.inventory);
      var found = false;
      for (var i = 0; i < data.inventory.length; i++) {
        if (data.inventory[i].item_id === sel) { found = true; break; }
      }
      if (sel && !found) setSel(null);
    }
    if (data.player) {
      var p = parseProgress(data.player);
      if (prevLevelRef.current > 0 && p.level > prevLevelRef.current) {
        setToast({ text: "Level up! Level " + p.level, at: Date.now() });
      }
      prevLevelRef.current = p.level;
      setProg(p);
      if (gameRef.current) applyProgress(gameRef.current, p);
    }
  }

  function postAction(payload) {
    return authFetch("/opencity/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (fresh) { syncState(fresh); return fresh; });
  }

  function equipItem(id) {
    postAction({ action: "equip_weapon", item_id: id })
      .then(function () {
        if (gameRef.current) gameRef.current.setEquipped(id);
        var nm = id;
        for (var i = 0; i < inv.length; i++) if (inv[i].item_id === id) { nm = inv[i].name; break; }
        setToast({ text: "Equipped " + nm, at: Date.now() });
      })
      .catch(function () {});
  }

  function unequipItem() {
    postAction({ action: "equip_weapon", item_id: "" })
      .then(function () { if (gameRef.current) gameRef.current.setEquipped(""); })
      .catch(function () {});
  }

  function onRowTap(e) {
    setSel(e.item_id);
    if (itemKind(e) === "weapon" && !(prog && prog.equipped === e.item_id)) equipItem(e.item_id);
  }

  function useItem(entry) {
    var healAmt = FOOD_HEAL[entry.item_id] || 0;
    postAction({ action: "inventory", op: "remove", item_id: entry.item_id, qty: 1 })
      .then(function () { if (gameRef.current && healAmt > 0) gameRef.current.heal(healAmt); })
      .catch(function () {});
  }

  function allocate(stat) { postAction({ action: "allocate_skill", stat: stat }).catch(function () {}); }

  function openMap() {
    if (gameRef.current) setMapData(gameRef.current.getMapData());
    setMapOpen(true);
  }

  useEffect(function () {
    if (gameRef.current) gameRef.current.setUIBlocked(!!(dialog || building || dead || hero || mapOpen));
  }, [dialog, building, dead, hero, mapOpen]);

  useEffect(function () {
    if (!toast) return;
    var t = setTimeout(function () { setToast(null); }, 2500);
    return function () { clearTimeout(t); };
  }, [toast]);

  useEffect(function () {
    var cancelled = false;
    var game = null;
    var joy = null;
    var kb = null;

    function refreshMap() {
      if (gameRef.current) setMapData(gameRef.current.getMapData());
    }

    function createGame(data, dict) {
      kb = new KeyboardInput();
      kb.attach();
      joy = new VirtualJoystick(zoneRef.current, hostRef.current);

      game = new OpenCityGame(hostRef.current, {
        initialPosition: data && data.position ? data.position : null,
        joystick: joy,
        keyboard: kb,
        dict: dict,
        onActionChange: function (a) { setAction(a); },
        onWeaponUpdate: function (w) { setWeaponHud(w); },
        onPlayerHP: function (h) { setHp(h); },
        onPlayerDeath: function () { setDead(true); },
        onKill: function (k) {
          setToast({ text: k.name + " down", at: Date.now() });
          var kind = k.id.split(".")[0];
          postAction({ action: "gain_xp", source: "kill." + kind }).catch(function () {});
        },
        onDialog: function (p) { setDialog({ name: p.name, lines: p.lines, index: 0 }); },
        onBuilding: function (p) { setBuilding({ name: p.name, text: p.text }); },
        onToast: function (text) { setToast({ text: text, at: Date.now() }); },
        onPickUp: function (it) {
          postAction({ action: "inventory", op: "add", item_id: it.id, qty: it.qty || 1 }).catch(function () {});
        },
        onSavePosition: function (x, y, location) {
          postAction({ action: "move", location: location, x: x, y: y }).catch(function () {});
        },
        onLocationChange: function () { refreshMap(); }
      });
      gameRef.current = game;

      var p = parseProgress(data && data.player);
      prevLevelRef.current = p.level;
      applyProgress(game, p);
      refreshMap();
    }

    authFetch("/opencity/state")
      .then(function (data) {
        if (cancelled) return;
        syncState(data);
        authFetch("/opencity/dict")
          .then(function (d) { if (!cancelled) createGame(data, d && d.dict ? d.dict : {}); })
          .catch(function () { if (!cancelled) createGame(data, {}); });
      })
      .catch(function (err) { if (!cancelled) setError(err && err.message ? err.message : "Load failed"); });

    return function () {
      cancelled = true;
      gameRef.current = null;
      if (game) game.destroy();
      if (joy) joy.destroy();
      if (kb) kb.detach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function advanceDialog() {
    setDialog(function (d) {
      if (!d) return d;
      if (d.index + 1 >= d.lines.length) return null;
      return { name: d.name, lines: d.lines, index: d.index + 1 };
    });
  }

  function onFabClick() {
    if (!gameRef.current || !action) return;
    if (action.mode === "fire") gameRef.current.fire();
    else gameRef.current.interact();
  }

  function stopTouch(e) { e.stopPropagation(); }

  var hpPct = hp && hp.max > 0 ? Math.max(0, Math.min(100, Math.round(100 * hp.hp / hp.max))) : 100;

  var selEntry = null;
  for (var i = 0; i < inv.length; i++) if (inv[i].item_id === sel) { selEntry = inv[i]; break; }

  var equippedName = null;
  if (prog && prog.equipped) {
    for (i = 0; i < inv.length; i++) if (inv[i].item_id === prog.equipped) { equippedName = inv[i].name; break; }
    if (!equippedName) equippedName = prog.equipped;
  }

  var xpPct = prog && prog.xpNext > 0 ? Math.max(0, Math.min(100, Math.round(100 * prog.xp / prog.xpNext))) : 0;

  function statTotal(id) {
    if (!prog) return "";
    var t = prog.totals;
    if (id === "max_hp") return String(t.max_hp);
    if (id === "damage") return "+" + t.damage;
    if (id === "defense") return t.defense + "%";
    if (id === "speed") return t.speed + "%";
    if (id === "accuracy") return t.accuracy + "%";
    return "";
  }

  var statCards = prog ? [
    { label: "HP", value: hp.hp + " / " + hp.max },
    { label: "Damage", value: "+" + prog.totals.damage },
    { label: "Defense", value: prog.totals.defense + "%" },
    { label: "Speed", value: prog.totals.speed + "%" },
    { label: "Accuracy", value: prog.totals.accuracy + "%" }
  ] : [];

  var tabEntries = inv.filter(function (e) { return itemTab(e) === tab; });

  return (
    <div className="oc-page">
      <div className="oc-topbar">
        <button className="oc-back" onClick={function () { navigate(-1); }}>&#8592;</button>
        <h1 className="oc-title">Open City</h1>
        <button className="oc-hero-btn" onClick={function () { setHeroTab("inventory"); setHero(true); }}>
          {prog ? prog.level : 1}
        </button>
        <span className="oc-chip oc-chip-doc"><b>{doc == null ? "—" : doc.toFixed(2)}</b> DOC</span>
        <span className="oc-chip">{formatMoney(usdt)}</span>
      </div>

      <div className="oc-hpbar">
        <div className={"oc-hpbar-fill" + (hpPct <= 30 ? " low" : "")} style={{ width: hpPct + "%" }}></div>
      </div>

      <div className="oc-quickbar">
        <button className="oc-iconbtn" onClick={openMap}>Map</button>
      </div>

      <div className="oc-stage" ref={hostRef}>
        <div className="oc-joy-zone" ref={zoneRef}></div>

        <button
          className={"oc-action-fab" + (action ? " active" : "") + (action && action.mode === "fire" ? " fire" : "")}
          disabled={!action}
          onPointerDown={stopTouch}
          onClick={onFabClick}
        >
          <span className="oc-fab-verb">{action ? action.verb : "Action"}</span>
          {action && <span className="oc-fab-name">{action.name}</span>}
        </button>

        {toast && <div className="oc-toast">{toast.text}</div>}
        {error && <div className="oc-error">{error}</div>}
      </div>

      <div className="oc-bottombar">
        <button
          className={"oc-weapon-btn" + (weaponHud ? " active" : "")}
          onClick={function () { if (gameRef.current) gameRef.current.toggleWeapon(); }}
        >
          <span className="oc-weapon-name">{weaponHud ? weaponHud.name : (equippedName || "Hands")}</span>
          {weaponHud && (
            <span className="oc-weapon-ammo">
              {weaponHud.state === "reloading" ? "Reloading…" : weaponHud.mag + " / " + weaponHud.reserve}
            </span>
          )}
        </button>
        <div className="oc-joy-anchor"></div>
      </div>

      {mapOpen && <MapOverlay data={mapData} onClose={function () { setMapOpen(false); }} onStop={stopTouch} />}

      {hero && prog && (
        <div className="oc-overlay oc-hero-overlay" onPointerDown={stopTouch} onTouchStart={stopTouch} onTouchMove={stopTouch}>
          <div className="oc-hero">
            <div className="oc-hero-top">
              <div className="oc-hero-avatar">{prog.level}</div>
              <div className="oc-hero-id">
                <div className="oc-hero-name">Player</div>
                <div className="oc-hero-lvline">{"Level " + prog.level}</div>
                <div className="oc-hpbar oc-hero-xpbar">
                  <div className="oc-hpbar-fill" style={{ width: xpPct + "%" }}></div>
                </div>
                <div className="oc-hero-xp">{prog.xp + " / " + prog.xpNext + " XP"}</div>
              </div>
              <button className="oc-bp-close" onClick={function () { setHero(false); }}>Close</button>
            </div>
            <div className="oc-hero-stats">
              {statCards.map(function (c) {
                return (
                  <div key={c.label} className="oc-hero-stat">
                    <span className="oc-hero-stat-label">{c.label}</span>
                    <span className="oc-hero-stat-value">{c.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="oc-hero-tabs">
              {HERO_TABS.map(function (t) {
                return (
                  <button key={t.id} className={"oc-hero-tab" + (heroTab === t.id ? " active" : "")} onClick={function () { setHeroTab(t.id); }}>
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="oc-hero-body">
              {heroTab === "inventory" && (
                <div className="oc-hero-inv">
                  <div className="oc-hero-eq">
                    <span className="oc-hero-eq-label">Equipped</span>
                    <span className="oc-hero-eq-name">{equippedName || "None"}</span>
                    {weaponHud && (
                      <span className="oc-hero-eq-ammo">
                        {weaponHud.state === "reloading" ? "Reloading…" : weaponHud.mag + " / " + weaponHud.reserve}
                      </span>
                    )}
                  </div>
                  <div className="oc-bp-tabs">
                    {TABS.map(function (t) {
                      return (
                        <button key={t.id} className={"oc-bp-tab" + (tab === t.id ? " active" : "")} onClick={function () { setTab(t.id); setSel(null); }}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="oc-hero-list">
                    {tabEntries.map(function (e) {
                      var isEq = prog.equipped === e.item_id;
                      return (
                        <button key={e.item_id} className={"oc-bp-row" + (sel === e.item_id ? " selected" : "")} onClick={function () { onRowTap(e); }}>
                          <span className="oc-bp-name">{e.name}</span>
                          {isEq && <span className="oc-hero-badge">Equipped</span>}
                          <span className="oc-bp-qty">{"x" + e.qty}</span>
                        </button>
                      );
                    })}
                    {tabEntries.length === 0 && <div className="oc-bp-empty">Empty</div>}
                  </div>
                  {selEntry && (
                    <div className="oc-bp-detail">
                      <div className="oc-bp-detailname">{selEntry.name}</div>
                      {WEAPONS[selEntry.item_id] && (
                        <div className="oc-bp-stats">
                          {"Damage " + WEAPONS[selEntry.item_id].damage + " · Range " + WEAPONS[selEntry.item_id].range + " · Mag " + WEAPONS[selEntry.item_id].magSize}
                        </div>
                      )}
                      {itemKind(selEntry) === "weapon" && (
                        prog.equipped === selEntry.item_id ? (
                          <button className="oc-bp-btn" onClick={unequipItem}>Unequip</button>
                        ) : (
                          <button className="oc-bp-btn accent" onClick={function () { equipItem(selEntry.item_id); }}>Equip</button>
                        )
                      )}
                      {itemKind(selEntry) === "food" && FOOD_HEAL[selEntry.item_id] != null && (
                        <button className="oc-bp-btn accent" onClick={function () { useItem(selEntry); }}>
                          {"Use (+" + FOOD_HEAL[selEntry.item_id] + " HP)"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              {heroTab === "progression" && (
                <div className="oc-hero-prog">
                  <div className="oc-sk-level"><span>{"Level " + prog.level}</span><span className="oc-sk-points">{prog.skillPoints + " pts"}</span></div>
                  <div className="oc-hpbar oc-sk-xpbar"><div className="oc-hpbar-fill" style={{ width: xpPct + "%" }}></div></div>
                  <div className="oc-sk-xp">{prog.xp + " / " + prog.xpNext + " XP"}</div>
                  <div className="oc-sk-list">
                    {STAT_DEFS.map(function (s) {
                      return (
                        <div key={s.id} className="oc-sk-row">
                          <span className="oc-sk-name">{s.name}</span>
                          <span className="oc-sk-val">{statTotal(s.id)}</span>
                          <span className="oc-sk-pts">{"+" + prog.allocated[s.id]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {heroTab === "skills" && (
                <div className="oc-hero-prog">
                  <div className="oc-sk-level"><span>Skill points</span><span className="oc-sk-points">{prog.skillPoints + " pts"}</span></div>
                  <div className="oc-sk-list">
                    {STAT_DEFS.map(function (s) {
                      return (
                        <div key={s.id} className="oc-sk-row">
                          <span className="oc-sk-name">{s.name}</span>
                          <span className="oc-sk-val">{statTotal(s.id)}</span>
                          <span className="oc-sk-pts">{"+" + prog.allocated[s.id]}</span>
                          <button className="oc-sk-plus" disabled={prog.skillPoints < 1} onClick={function () { allocate(s.id); }}>+</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {heroTab === "achievements" && (
                <div className="oc-hero-prog">
                  {ACHIEVEMENTS.length === 0 && <div className="oc-bp-empty">No achievements yet</div>}
                  <div className="oc-sk-list">
                    {ACHIEVEMENTS.map(function (a) {
                      return (
                        <div key={a.id} className="oc-sk-row">
                          <span className="oc-sk-name">{a.name}</span>
                          <span className="oc-sk-val">{a.done ? "Done" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(dialog || building) && (
        <div className="oc-overlay" onPointerDown={stopTouch} onTouchStart={stopTouch} onTouchMove={stopTouch}>
          {dialog && (
            <div className="oc-sheet">
              <div className="oc-sheet-name">{dialog.name}</div>
              <div className="oc-sheet-text">{dialog.lines[dialog.index]}</div>
              <button className="oc-sheet-btn" onClick={advanceDialog}>
                {dialog.index + 1 < dialog.lines.length ? "Continue" : "Close"}
              </button>
            </div>
          )}
          {building && (
            <div className="oc-sheet">
              <div className="oc-sheet-name">{building.name}</div>
              <div className="oc-sheet-text">{building.text}</div>
              <button className="oc-sheet-btn" onClick={function () { setBuilding(null); }}>Close</button>
            </div>
          )}
        </div>
      )}

      {dead && (
        <div className="oc-overlay oc-death" onPointerDown={stopTouch} onTouchStart={stopTouch} onTouchMove={stopTouch}>
          <div className="oc-death-title">You died</div>
          <button className="oc-death-btn" onClick={function () { if (gameRef.current) gameRef.current.respawn(); setDead(false); }}>
            Respawn
          </button>
        </div>
      )}
    </div>
  );
};

export default OpenCity;