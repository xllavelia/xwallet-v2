import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWalletBalance } from "./useWallet";
import { useSlots } from "./useSlots";

// ============================================================
// ИКОНКИ СИМВОЛОВ — кошелёковая стилистика, stroke = currentColor
// ============================================================

function CoinIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 6.5v11"></path>
      <path d="M14.8 8.4c-.7-.6-1.7-.9-2.8-.9-1.6 0-2.9.8-2.9 2 0 2.7 5.9 1.4 5.9 4 0 1.3-1.4 2.1-3 2.1-1.2 0-2.3-.4-3-1"></path>
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5"></rect>
      <path d="M2.5 9.5h19"></path>
      <path d="M6 14.5h4"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18"></path>
      <path d="M5 20v-6"></path>
      <path d="M10 20v-9"></path>
      <path d="M15 20v-4"></path>
      <path d="M20 20v-11"></path>
      <path d="M5 11l5-6 5 3 5-6"></path>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5"></rect>
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"></path>
      <path d="M3 12.5h18"></path>
      <path d="M11 12.5v2h2v-2"></path>
    </svg>
  );
}

function SafeIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3"></rect>
      <circle cx="11" cy="12" r="3.6"></circle>
      <path d="M11 8.4V7.2"></path>
      <path d="M11 16.8v-1.2"></path>
      <path d="M7.4 12H6.2"></path>
      <path d="M15.8 12h-1.2"></path>
      <circle cx="17" cy="17" r="1"></circle>
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9L12 4l8.5 5"></path>
      <path d="M5 9v8"></path>
      <path d="M9.7 9v8"></path>
      <path d="M14.3 9v8"></path>
      <path d="M19 9v8"></path>
      <path d="M3 19.5h18"></path>
      <path d="M4 21.5h16"></path>
    </svg>
  );
}

function CrystalIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5L19 9l-7 12.5L5 9z"></path>
      <path d="M5 9h14"></path>
      <path d="M12 2.5L9 9l3 12.5L15 9z"></path>
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5l4.2 4L12 5l4.8 6.5L21 7.5l-1.7 10H4.7z"></path>
      <path d="M4.7 20.5h14.6"></path>
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h10L21 9l-9 11.5L3 9z"></path>
      <path d="M3 9h18"></path>
      <path d="M7 3.5L9.5 9 12 20.5 14.5 9 17 3.5"></path>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4"></circle>
      <circle cx="17" cy="20" r="1.4"></circle>
      <path d="M3 3h2.5l2.2 12h10.6l2.2-8H6"></path>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13"></path>
      <path d="M8 12h13"></path>
      <path d="M8 18h13"></path>
      <path d="M3.5 6h.01"></path>
      <path d="M3.5 12h.01"></path>
      <path d="M3.5 18h.01"></path>
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"></path>
      <path d="M11 18l-6-6 6-6"></path>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  );
}

// Реестр символов; hot — редкие, светятся акцентом
var SYMBOL_ICONS = {
  coin: CoinIcon,
  card: CardIcon,
  chart: ChartIcon,
  briefcase: BriefcaseIcon,
  safe: SafeIcon,
  bank: BankIcon,
  crystal: CrystalIcon,
  crown: CrownIcon,
  diamond: DiamondIcon
};

var HOT = { crystal: true, crown: true, diamond: true };

function SymIcon(props) {
  var C = SYMBOL_ICONS[props.id];
  if (!C) return <span />;
  return <C />;
}

// ============================================================
// КОНСТАНТЫ АНИМАЦИИ БАРАБАНОВ
// ============================================================

var SPEED = 24;                     // px/кадр при раскрутке
var DECEL = 0.92;                   // затухание при торможении
var STOP_AT = [1350, 2150, 2950];   // момент торможения каждого столбца
var ROW_STAGGER = 130;              // каскад остановки строк друг за другом

// Высота ячейки зависит от числа строк: больше линий — мельче окна.
// Обязана совпадать с CSS (.slt-machine.lines-N .slt-cell).
function cellHeight(lines) {
  if (lines >= 5) return 46;
  if (lines >= 3) return 62;
  return 84;
}

var FALLBACK_LINES = [1, 3, 5];

var EVENT_LABEL = {
  lucky_spin: "LUCKY SPIN",
  double_reward: "DOUBLE REWARD",
  bonus_round: "BONUS ROUND"
};

// ============================================================
// ХЕЛПЕРЫ
// ============================================================

// Зеркало серверной логики выигрышных позиций: точная тройка,
// иначе пара из первых двух (любое комбо "pair + any" выигрывает).
function winningPositions(reels) {
  if (!reels || reels.length < 3) return [];
  if (reels[0] === reels[1] && reels[1] === reels[2]) return [0, 1, 2];
  if (reels[0] === reels[1]) return [0, 1];
  return [];
}

function formatMoney(n) {
  if (n == null || isNaN(n)) return "$0.00";
  return "$" + n.toFixed(2);
}

function formatNum(n) {
  if (n == null || isNaN(n)) return "0";
  return String(n);
}

function formatAgo(unixSec) {
  var d = Math.floor(Date.now() / 1000) - unixSec;
  if (d < 60) return "now";
  if (d < 3600) return Math.floor(d / 60) + "m";
  if (d < 86400) return Math.floor(d / 3600) + "h";
  return Math.floor(d / 86400) + "d";
}

function eventDesc(id) {
  if (id === "lucky_spin") return "Reels reroll until you win";
  if (id === "double_reward") return "Reels reroll until you win, prize ×2";
  if (id === "bonus_round") return "+3 free spins";
  return "";
}

function spinWord(n) {
  return n === 1 ? " spin" : " spins";
}
// ============================================================
// РЫЧАГ — физика одинакового rAF-интегратора пружины.
// Палец задаёт только цель движения; дальше рукоятка живёт сама:
//   перешагнул порог -> сама добивает до упора, бьёт (спин),
//   короткая пауза на упоре -> пружиной возвращается домой с перелётом.
// До порога отпущенная -> так же сама возвращается.
// Промежуточных состояний нет, поэтому застрять на середине невозможно.
// ============================================================


var LEVER = {
  fireAt: 0.5,      // доля хода, после которой рычаг «берёт доводку на себя»
  dragK: 290,       // жёсткость следования за пальцем
  dragC: 26,        // демпфирование на ведении
  commitK: 250,     // добивка до упора: быстро, почти без перелёта
  commitC: 26,
  homeK: 130,       // возврат домой: мягко, с лёгким перелётом
  homeC: 11,
  holdMs: 120,      // пауза на упоре перед возвратом
  overshoot: 16     // px, на которые рукоятку может пустить за ноль на возврате
};

function Lever(props) {
  var trackRef = useRef(null);
  var knobRef = useRef(null);
  var fillRef = useRef(null);
  var gateRef = useRef(null);
  var rafRef = useRef(0);
  var lastTsRef = useRef(0);
  var fireRef = useRef(null);
  var [phase, setPhase] = useState("idle"); // idle | drag | commit | hold | home

  var simRef = useRef({
    mode: "idle", x: 0, v: 0, target: 0, max: 0,
    pointerX: 0, startX: 0, fired: false, holdUntil: 0
  });

  fireRef.current = props.onFire;

  // ---------- отрисовка ----------

  function draw(s) {
    if (knobRef.current) {
      knobRef.current.style.transform = "translate3d(" + s.x + "px,0,0)";
      knobRef.current.classList.toggle("armed", s.mode === "drag" && s.x >= s.max * LEVER.fireAt);
    }
    if (fillRef.current) {
      var p = s.max > 0 ? Math.max(0, Math.min(1, s.x / s.max)) : 0;
      fillRef.current.style.width = (p * 100) + "%";
    }
  }

  // ---------- физика ----------

  function integrate(s, h, now) {
    var k = LEVER.homeK, c = LEVER.homeC, target = 0;
    if (s.mode === "drag") { k = LEVER.dragK; c = LEVER.dragC; target = s.target; }
    else if (s.mode === "commit") { k = LEVER.commitK; c = LEVER.commitC; target = s.max; }

    // явная интеграция пружины: a = k*(цель - x) - c*v
    s.v += (k * (target - s.x) - c * s.v) * h;
    s.x += s.v * h;

    if (s.mode === "drag" || s.mode === "commit") {
      if (s.x > s.max) { s.x = s.max; if (s.v > 0) s.v = 0; }
      if (s.x < 0) { s.x = 0; if (s.v < 0) s.v = 0; }
    } else {
      if (s.x > 0) { s.x = 0; if (s.v < 0) s.v = 0; }
      if (s.x < -LEVER.overshoot) { s.x = -LEVER.overshoot; if (s.v < 0) s.v = 0; }
    }

    // упор достигнут — фиксируем, бьём и уходим домой
    if (s.mode === "commit" && s.x >= s.max - 0.8 && Math.abs(s.v) < 60) {
      s.x = s.max;
      s.v = 0;
      s.mode = "hold";
      s.holdUntil = now + LEVER.holdMs;
      setPhase("hold");
      if (!s.fired) {
        s.fired = true;
        if (fireRef.current) fireRef.current();
      }
    }
  }

  function step(ts) {
    var s = simRef.current;
    var dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;
    if (dt > 0.05) dt = 0.05; // защита от прыжка после фоновой вкладки
    var now = performance.now();
    for (var i = 0; i < 4; i++) integrate(s, dt / 4, now); // подшаги: пружина устойчива на любом FPS
    draw(s);

    if (s.mode === "hold" && now >= s.holdUntil) goHome();

    var settled = s.mode === "home" && Math.abs(s.x) < 0.3 && Math.abs(s.v) < 3;
    if (settled) {
      s.mode = "idle";
      s.x = 0;
      s.v = 0;
      draw(s);
      setPhase("idle");
      rafRef.current = 0;
      return;
    }
    rafRef.current = requestAnimationFrame(step);
  }

  function ensureLoop() {
    if (rafRef.current) return;
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
  }

  // ---------- переходы ----------

  function commit() {
    var s = simRef.current;
    if (s.mode === "commit" || s.mode === "hold") return;
    s.mode = "commit";
    setPhase("commit");
    ensureLoop();
  }

  function goHome() {
    var s = simRef.current;
    s.mode = "home";
    setPhase("home");
    ensureLoop();
  }

  // ---------- указатель ----------

  function measure() {
    var track = trackRef.current;
    var knob = knobRef.current;
    if (!track) return 0;
    var rect = track.getBoundingClientRect();
    var knobW = knob ? knob.offsetWidth : 48;
    return Math.max(40, rect.width - knobW - 12);
  }

  function onDown(e) {
    var s = simRef.current;
    if (props.disabled || s.mode === "commit" || s.mode === "hold") return;
    s.max = measure();
    s.pointerX = e.clientX;
    s.startX = s.x;
    s.target = s.x;
    s.fired = false;
    s.mode = "drag";
    setPhase("drag");
    if (gateRef.current) {
      gateRef.current.style.left = (6 + s.max * LEVER.fireAt + 24) + "px";
    }
    if (trackRef.current && trackRef.current.setPointerCapture) {
      try { trackRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    }
    ensureLoop();
  }

  function onMove(e) {
    var s = simRef.current;
    if (s.mode !== "drag") return;
    var dx = e.clientX - s.pointerX;
    if (dx < 0) dx = 0;
    // сопротивление с насыщением: к концу хода рукоятку ведёт всё тяжелее
    var t = dx / s.max;
    var raw = s.startX + dx * (1 - 0.3 * Math.min(t, 1));
    s.target = Math.min(raw, s.max);
    // порог пройден — дальше рычаг едет сам, палец больше не указатель
    if (s.target >= s.max * LEVER.fireAt) commit();
  }

  function onUp() {
    var s = simRef.current;
    if (s.mode !== "drag") return;
    if (s.target >= s.max * (LEVER.fireAt - 0.05) || s.x >= s.max * (LEVER.fireAt - 0.05)) commit();
    else goHome();
  }

  // Если рычаг заблокировали прямо во время захвата — аккуратно уходит домой.
  useEffect(function () {
    if (props.disabled && simRef.current.mode === "drag") goHome();
  }, [props.disabled]);

  useEffect(function () {
    return function () {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  var label = "PULL TO SPIN";
  if (phase === "commit" || phase === "hold") label = "SPIN";
  var hint = "drag right";
  if (phase === "idle" && props.cost) hint = props.cost + " spins";
  if (phase === "drag") hint = "pull to fire";
  if (phase === "commit" || phase === "hold") hint = "firing";

  return (
    <div
      ref={trackRef}
      className={"slt-lever" + (phase === "drag" ? " drag" : "") + (props.disabled ? " off" : "")}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onLostPointerCapture={onUp}
    >
      <div ref={fillRef} className="slt-lever-fill"></div>
      <div ref={gateRef} className="slt-lever-gate"></div>
      <div className="slt-lever-label">
        <span className="slt-lever-main">{label}</span>
        {/* <span className="slt-lever-hint">{hint}</span> */}
      </div>
      <div ref={knobRef} className="slt-lever-knob">
      </div>
    </div>
  );
}
// ============================================================
// МОДАЛКА МАГАЗИНА
// ============================================================

function ShopModal(props) {
  var packs = (props.state.config && props.state.config.packs) || [];
  return (
    <div className="slt-overlay" onClick={props.onClose}>
      <div className="slt-modal" onClick={function (e) { e.stopPropagation(); }}>
        <div className="slt-modal-head">
          <h3>Spin Packs</h3>
          <button className="slt-x" onClick={props.onClose}><CloseIcon /></button>
        </div>
        <p className="slt-modal-sub">Paid from your wallet balance. Every pack spin carries its own stake into the prize pool.</p>
        <div className="slt-pack-list">
          {packs.map(function (p) {
            return (
              <div className="slt-pack" key={p.id}>
                <div className="slt-pack-left">
                  <div className="slt-pack-name">{p.name}</div>
                  <div className="slt-pack-spins">{p.spins} spins</div>
                </div>
                <button className="slt-pack-buy" disabled={props.busy} onClick={function () { props.onBuy(p); }}>
                  {"$" + p.price.toFixed(2)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// МОДАЛКА ТАБЛИЦЫ ВЫПЛАТ (целиком из конфига бэкенда)
// ============================================================

function PaytableModal(props) {
  var cfg = props.state.config || {};
  var symbols = (cfg.symbols || []).slice().sort(function (a, b) { return b.mult - a.mult; });
  var combos = cfg.combos || [];
  var levels = cfg.levels || [];
  var events = cfg.events || [];
  var linesOpts = (cfg.lines && cfg.lines.length) ? cfg.lines : FALLBACK_LINES;
  var nameOf = {};
  (cfg.symbols || []).forEach(function (s) { nameOf[s.id] = s.name; });

  return (
    <div className="slt-overlay" onClick={props.onClose}>
      <div className="slt-modal" onClick={function (e) { e.stopPropagation(); }}>
        <div className="slt-modal-head">
          <h3>Paytable</h3>
          <button className="slt-x" onClick={props.onClose}><CloseIcon /></button>
        </div>
        <div className="slt-pt-group">
          <div className="slt-pt-title">Triple symbols</div>
          {symbols.map(function (s) {
            return (
              <div className={"slt-pt-row" + (HOT[s.id] ? " hot" : "")} key={s.id}>
                <span className="slt-pt-icon"><SymIcon id={s.id} /></span>
                <span className="slt-pt-name">{s.name}</span>
                <span className="slt-pt-mult">{"\u00D7" + s.mult}</span>
              </div>
            );
          })}
        </div>
        <div className="slt-pt-group">
          <div className="slt-pt-title">Special combinations</div>
          {combos.map(function (c, i) {
            return (
              <div className="slt-pt-row" key={i}>
                <span className="slt-pt-triple">
                  {c.reels.map(function (rid, j) {
                    if (rid === "") return <em key={j} className="slt-wild">any</em>;
                    return <SymIcon key={j} id={rid} />;
                  })}
                </span>
                <span className="slt-pt-name">
                  {c.reels.map(function (rid) { return rid === "" ? "ANY" : (nameOf[rid] || rid); }).join(" \u00B7 ")}
                </span>
                <span className="slt-pt-mult">{"\u00D7" + c.mult}</span>
              </div>
            );
          })}
        </div>
        <div className="slt-pt-group">
          <div className="slt-pt-title">Levels</div>
          {levels.map(function (l) {
            return (
              <div className="slt-pt-row" key={l.id}>
                <span className="slt-pt-name">{l.name}</span>
                <span className="slt-pt-note">{l.spins_cost + spinWord(l.spins_cost) + " per line \u00B7 payouts \u00D7" + l.payout_mult}</span>
              </div>
            );
          })}
        </div>
        <div className="slt-pt-group">
          <div className="slt-pt-title">Lines</div>
          {linesOpts.map(function (n) {
            return (
              <div className="slt-pt-row" key={n}>
                <span className="slt-pt-name">{n + (n === 1 ? " line" : " lines")}</span>
                <span className="slt-pt-note">{"total cost \u00D7" + n}</span>
              </div>
            );
          })}
          <div className="slt-pt-row">
            <span className="slt-pt-note">Every line spins on its own: separate symbols, separate rare event, separate prize.</span>
          </div>
        </div>
        {events.length > 0 && (
          <div className="slt-pt-group">
            <div className="slt-pt-title">Rare events</div>
            {events.map(function (ev) {
              return (
                <div className="slt-pt-row" key={ev.id}>
                  <span className="slt-pt-name">{ev.name}</span>
                  <span className="slt-pt-note">{eventDesc(ev.id)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ЯЧЕЙКА СТАТИСТИКИ
// ============================================================

function Stat(props) {
  return (
    <div className="slt-stat">
      <div className="slt-stat-v">{props.value}</div>
      <div className="slt-stat-l">{props.label}</div>
    </div>
  );
}

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================

var IDLE_SYMBOLS = ["coin", "chart", "safe", "bank", "card", "crown", "crystal", "briefcase", "diamond"];

// Ленты «до первого спина»: по одной ячейке на каждое окно машины.
function idleStrips(count) {
  var out = [];
  for (var i = 0; i < count; i++) {
    out.push([IDLE_SYMBOLS[i % IDLE_SYMBOLS.length]]);
  }
  return out;
}

const Slots = () => {
  var navigate = useNavigate();
  var { state, busy, act, refresh, setSpinsLocal } = useSlots();
  var { refresh: refreshWallet } = useWalletBalance();
  var [spinning, setSpinning] = useState(false);
  var [strips, setStrips] = useState(null);         // плоский массив лент: row*3+col
  var [lastResult, setLastResult] = useState(null); // {rows, win, winRows, event}
  var [levelId, setLevelId] = useState(null);
  var [lines, setLines] = useState(1);
  var [pendingIds, setPendingIds] = useState([]);   // id строк текущего спина
  var [modal, setModal] = useState(null);           // "shop" | "paytable" | null
  var [toast, setToast] = useState(null);
  var toastTimerRef = useRef(null);
  var stripRefs = useRef([]);
  var reelRefs = useRef([]);
  var animRef = useRef(null);

  if (!state) {
    return (
      <div className="slt-page">
        <div className="slt-loading">Loading&hellip;</div>
      </div>
    );
  }

  var cfg = state.config || {};
  var levels = cfg.levels || [];
  var stats = state.stats || {};
  var history = state.history || [];
  var linesOptions = (cfg.lines && cfg.lines.length) ? cfg.lines : FALLBACK_LINES;
  var nameOf = {};
  (cfg.symbols || []).forEach(function (s) { nameOf[s.id] = s.name; });
  var activeLevel = levels.find(function (l) { return l.id === levelId; }) || levels[0] || null;
  var spinsLeft = state.spins || 0;
  var spinCost = activeLevel ? activeLevel.spins_cost * lines : 0;
  var affordable = activeLevel ? spinsLeft >= spinCost : false;

  // Плоские индексы окон: строка row, столбец col -> row * 3 + col.
  var cellCount = lines * 3;
  var idle = idleStrips(cellCount);
  var rowIndexes = [];
  for (var ri = 0; ri < lines; ri++) rowIndexes.push(ri);
  var rowWins = [];
  for (var rw = 0; rw < lines; rw++) {
    rowWins.push(!!(lastResult && lastResult.rows[rw] && lastResult.rows[rw].win > 0));
  }

  function showToast(msg, ok) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg: msg, ok: ok });
    toastTimerRef.current = setTimeout(function () { setToast(null); }, 3200);
  }

  // ---------- подсветка выигрышных ячеек ----------

  function clearWinHighlight() {
    stripRefs.current.forEach(function (st) {
      if (!st) return;
      var cell = st.lastElementChild;
      if (cell) cell.classList.remove("slt-cell-win");
    });
  }

  // Подсветка по всем строкам сразу: выигрышные ячейки каждой линии.
  function highlightWins(recs) {
    var n = 0;
    recs.forEach(function (rec, row) {
      winningPositions(rec.reels).forEach(function (col) {
        var idx = row * 3 + col;
        var delay = 90 * n;
        n++;
        setTimeout(function () {
          var st = stripRefs.current[idx];
          if (!st) return;
          var cell = st.lastElementChild;
          if (cell) cell.classList.add("slt-cell-win");
        }, delay);
      });
    });
  }

  // ---------- движок барабанов (rAF) ----------

  function renderStrips() {
    var rs = animRef.current;
    if (!rs) return;
    rs.reels.forEach(function (r, i) {
      var st = stripRefs.current[i];
      if (st) st.style.transform = "rotateX(6deg) translate3d(0,-" + r.off + "px,0)";
    });
  }

  function runFrame() {
    var rs = animRef.current;
    if (!rs) return;
    var now = performance.now();
    var allDone = true;
    rs.reels.forEach(function (r, i) {
      if (r.done) return;
      var k = Math.min(Math.max((now - r.last) / 16.67, 0.5), 3);
      r.last = now;
      if (now < r.decelAt) {
        r.off += r.v * k;
        allDone = false;
        return;
      }
      if (!r.braking) {
        r.braking = true;
        // стартовый шаг торможения = остаток пути * (1-DECEL):
        // геометрический ряд точно «съедает» остаток до цели
        r.v = (r.target - r.off) * (1 - DECEL);
      }
      var step = r.v * k;
      if (step >= r.target - r.off - 0.5) {
        r.off = r.target;
        r.done = true;
        var el = reelRefs.current[i];
        if (el) {
          el.classList.remove("spinning");
          el.classList.add("landed");
          setTimeout(function () { el.classList.remove("landed"); }, 380);
        }
      } else {
        r.off += step;
        r.v *= Math.pow(DECEL, k);
        allDone = false;
      }
    });
    renderStrips();
    if (allDone) {
      animRef.current = null;
      if (rs.onDone) rs.onDone();
    } else {
      rs.raf = requestAnimationFrame(runFrame);
    }
  }

  // recs — по одной записи на строку; крутят все окна одновременно,
  // строки останавливаются каскадом.
  function startReels(recs, onDone) {
    var symbolIds = (cfg.symbols || []).map(function (s) { return s.id; });
    var cellH = cellHeight(recs.length);
    var t0 = performance.now();
    var cellsArr = [];
    var reels = [];
    for (var row = 0; row < recs.length; row++) {
      for (var col = 0; col < 3; col++) {
        var idx = row * 3 + col;
        // длина ленты из времени остановки столбца — торможение всегда
        // стартует на одном и том же расстоянии от цели (~380px)
        var travel = SPEED * 60 * (STOP_AT[col] / 1000) + 380;
        var len = Math.ceil(travel / cellH) + 2;
        var cells = [];
        for (var k = 0; k < len - 1; k++) {
          cells.push(symbolIds[Math.floor(Math.random() * symbolIds.length)]);
        }
        cells.push(recs[row].reels[col]); // финальный символ — последней ячейкой
        cellsArr[idx] = cells;
        reels.push({
          off: 0,
          target: (len - 1) * cellH,
          v: SPEED,
          done: false,
          braking: false,
          last: t0,
          decelAt: t0 + STOP_AT[col] + row * ROW_STAGGER
        });
      }
    }
    if (animRef.current && animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
    animRef.current = { reels: reels, raf: null, onDone: onDone };
    setStrips(cellsArr);
    reelRefs.current.forEach(function (el) { if (el) el.classList.remove("landed"); });
    stripRefs.current.forEach(function (st) {
      if (st) st.style.transform = "rotateX(6deg) translate3d(0,0,0)";
    });
    animRef.current.raf = requestAnimationFrame(runFrame);
  }

  // ---------- действия ----------

  function changeLines(n) {
    if (spinning || busy || n === lines) return;
    clearWinHighlight();
    // Ленты прошлой машины другой высоты — сбрасываем DOM-сдвиг, иначе
    // переиспользованное окно остаётся «съехавшим» от прошлого прокрута.
    stripRefs.current.forEach(function (st) {
      if (st) st.style.transform = "rotateX(6deg) translate3d(0,0,0)";
    });
    setStrips(null);
    setLastResult(null);
    setPendingIds([]);
    setLines(n);
  }

  function doSpin() {
    if (!activeLevel || spinning || busy) return;
    if (spinsLeft < spinCost) {
      showToast("Not enough spins for " + spinCost + spinWord(spinCost), false);
      return;
    }
    clearWinHighlight();
    setLastResult(null);
    setSpinning(true);
    setSpinsLocal(spinsLeft - spinCost);
    act("spin", { level_id: activeLevel.id, lines: lines })
      .then(function (data) {
        refreshWallet().catch(function () {});
        var h = (data && data.history) || [];
        // История приходит ORDER BY id DESC: самая свежая (последняя строка)
        // первой. Разворачиваем, чтобы recs[0] был верхней строкой машины.
        var n = Math.min(lines, h.length);
        var recs = [];
        var ids = [];
        for (var i = 0; i < n; i++) {
          var rec = h[n - 1 - i];
          if (!rec || !rec.reels || rec.reels.length < 3) break;
          if (ids.indexOf(rec.id) !== -1) break; // дубль = сервер не отработал линии
          recs.push(rec);
          ids.push(rec.id);
        }
        if (recs.length === 0) throw new Error("Spin failed");
        if (recs.length < lines) {
          showToast("Server returned " + recs.length + " of " + lines + " lines", false);
        }
        setPendingIds(ids);
        var total = 0;
        var winRows = 0;
        var ev = "";
        recs.forEach(function (r) {
          total += r.win || 0;
          if (r.win > 0) winRows++;
          if (!ev && r.event) ev = r.event;
        });
        startReels(recs, function () {
          setSpinning(false);
          setPendingIds([]);
          setLastResult({
            rows: recs,
            win: Math.round(total * 100) / 100,
            winRows: winRows,
            event: ev
          });
          if (total > 0) {
            highlightWins(recs);
            showToast(
              (recs.length > 1 ? winRows + (winRows === 1 ? " line " : " lines ") : "") +
              "+" + formatMoney(total),
              true
            );
          } else {
            showToast("No win", false);
          }
        });
      })
      .catch(function (err) {
        setSpinning(false);
        setPendingIds([]);
        refresh().catch(function () {});
        showToast(err.message || "Spin failed", false);
      });
  }

  function doBuy(pack) {
    if (busy) return;
    act("buy_pack", { pack_id: pack.id })
      .then(function () {
        refreshWallet().catch(function () {});
        setModal(null);
        showToast(pack.name + ": +" + pack.spins + " spins", true);
      })
      .catch(function (err) {
        showToast(err.message || "Purchase failed", false);
      });
  }

  var hasResult = !!lastResult && !spinning;
  var win = hasResult ? lastResult.win : 0;
  var rtpText = stats.rtp != null && !isNaN(stats.rtp) ? stats.rtp.toFixed(1) + "%" : "\u2014";
  var profit = stats.total_profit || 0;
  var recentSpins = history.filter(function (hItem) {
    return pendingIds.indexOf(hItem.id) === -1;
  }).slice(0, 8);

  return (
    <div className="slt-page">
      <div className="slt-topbar">
        <h1 className="slt-title">Slots</h1>
        <div className="slt-topbar-right">
          <span className="slt-spins-chip"><b>{formatNum(spinsLeft)}</b> spins</span>
        </div>
      </div>

      {state.stake_hint != null && (
        <div className="slt-subhint">Current stake {"\u2248"} {formatMoney(state.stake_hint)} per line</div>
      )}

      <div className={"slt-machine lines-" + lines}>
        <div className="slt-rows">
          {rowIndexes.map(function (row) {
            return (
              <div className="slt-row" key={row}>
                <div className={"slt-windows" + (rowWins[row] ? " rowwin" : "")}>
                  {[0, 1, 2].map(function (col) {
                    var idx = row * 3 + col;
                    var cells = (strips && strips[idx]) ? strips[idx] : idle[idx];
                    return (
                      <div className="slt-window" key={col}>
                        <div
                          className={"slt-reel" + (spinning ? " spinning" : "")}
                          ref={function (el) { reelRefs.current[idx] = el; }}
                        >
                          <div className="slt-strip" ref={function (el) { stripRefs.current[idx] = el; }}>
                            {cells.map(function (id, j) {
                              return (
                                <div key={j} className={"slt-cell" + (HOT[id] ? " hot" : "")}>
                                  <SymIcon id={id} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="slt-winline"></div>
                      </div>
                    );
                  })}
                </div>
                {rowWins[row] && !spinning && (
                  <div className="slt-rowtag">{"+" + formatMoney(lastResult.rows[row].win)}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="slt-result">
          {spinning && <span className="slt-result-spinning">Spinning&hellip;</span>}
          {!spinning && !hasResult && <span className="slt-result-idle">Pull the lever to spin</span>}
          {!spinning && hasResult && win > 0 && (
            <span className="slt-result-win">{"+" + formatMoney(win)}</span>
          )}
          {!spinning && hasResult && win > 0 && lastResult.rows.length > 1 && (
            <span className="slt-result-lines">{lastResult.winRows + " of " + lastResult.rows.length + " lines"}</span>
          )}
          {!spinning && hasResult && win <= 0 && (
            <span className="slt-result-lose">No win</span>
          )}
          {!spinning && hasResult && lastResult.event && EVENT_LABEL[lastResult.event] && (
            <span className="slt-event-chip">{EVENT_LABEL[lastResult.event]}</span>
          )}
        </div>
      </div>

      <div className="slt-levels">
        {levels.map(function (l) {
          var active = activeLevel && l.id === activeLevel.id;
          return (
            <button
              key={l.id}
              className={"slt-pill" + (active ? " active" : "")}
              disabled={spinning}
              onClick={function () { setLevelId(l.id); }}
            >
              <span className="slt-pill-name">{l.name}</span>
              <span className="slt-pill-cost">
                {(l.spins_cost * lines) + spinWord(l.spins_cost * lines) + " \u00B7 \u00D7" + l.payout_mult}
              </span>
            </button>
          );
        })}
        <button className="slt-iconbtn" onClick={function () { setModal("shop"); }}>
          <CartIcon />
          <span>Shop</span>
        </button>
        <button className="slt-iconbtn" onClick={function () { setModal("paytable"); }}>
          <ListIcon />
          <span>Odds</span>
        </button>
      </div>

      <div className="slt-lines">
        {linesOptions.map(function (n) {
          return (
            <button
              key={n}
              className={"slt-linebtn" + (n === lines ? " active" : "")}
              disabled={spinning}
              onClick={function () { changeLines(n); }}
            >
              <b>{n}</b>
              <span>{activeLevel ? (activeLevel.spins_cost * n) + spinWord(activeLevel.spins_cost * n) : ""}</span>
            </button>
          );
        })}
      </div>

      <Lever disabled={spinning || busy || !affordable} onFire={doSpin} cost={spinCost} />

      {!affordable && !spinning && activeLevel && (
        <div className="slt-nospins">
          {"Not enough spins for " + activeLevel.name + " \u00D7 " + lines +
            (lines === 1 ? " line" : " lines") + " (" + spinCost + spinWord(spinCost) + ") \u2014 grab a pack in the Shop."}
        </div>
      )}

      <div className="slt-section">
        <div className="slt-section-title">Recent spins</div>
        {history.length === 0 && <div className="slt-empty">No spins yet</div>}
        {recentSpins.map(function (h) {
          return (
            <div className={"slt-hrow" + (h.win > 0 ? " win" : "")} key={h.id}>
              <span className="slt-h-syms">
                {h.reels.map(function (rid, j) {
                  return <i key={j}>{nameOf[rid] || rid}</i>;
                })}
              </span>
              <span className="slt-h-meta">
                {(function () {
                  var lvl = levels.find(function (l) { return l.id === h.level_id; });
                  var extra = (h.lines && h.lines > 1) ? " \u00B7 " + h.lines + "L" : "";
                  return (lvl ? lvl.name : h.level_id) + extra + " \u00B7 " + formatAgo(h.t);
                })()}
              </span>
              <span className="slt-h-win">{h.win > 0 ? "+" + formatMoney(h.win) : "\u2014"}</span>
            </div>
          );
        })}
      </div>

      <div className="slt-section">
        <div className="slt-section-title">Statistics</div>
        <div className="slt-stats">
          <Stat label="Total Spins" value={formatNum(stats.total_spins)} />
          <Stat label="Total Winnings" value={formatMoney(stats.total_winnings)} />
          <Stat label="Biggest Win" value={formatMoney(stats.biggest_win)} />
          <Stat label="Current Streak" value={formatNum(stats.current_streak)} />
          <Stat label="Best Streak" value={formatNum(stats.best_streak)} />
          <Stat label="RTP" value={rtpText} />
          <Stat label="Spins Today" value={formatNum(stats.spins_today)} />
          <Stat label="Wins Today" value={formatNum(stats.wins_today)} />
          <Stat
            label="Total Profit"
            value={(profit < 0 ? "\u2212" : "") + formatMoney(Math.abs(profit))}
          />
          <Stat label="Average Win" value={formatMoney(stats.average_win)} />
          <Stat label="Total Wagered" value={formatMoney(stats.total_wagered)} />
          <Stat label="Total Wins" value={formatNum(stats.total_wins)} />
        </div>
      </div>

      {modal === "shop" && (
        <ShopModal state={state} busy={busy} onClose={function () { setModal(null); }} onBuy={doBuy} />
      )}
      {modal === "paytable" && (
        <PaytableModal state={state} onClose={function () { setModal(null); }} />
      )}

      {toast && (
        <div className={"slt-toast" + (toast.ok ? " ok" : " err")}>{toast.msg}</div>
      )}
    </div>
  );
};

export default Slots;