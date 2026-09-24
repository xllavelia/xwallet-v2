import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { useWalletBalance } from "./useWallet";
import { useCardFunding } from "./useCardFunding";

var BARCODE = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2];
// var TORN_BOTTOM_CLIP = "polygon(0% 0%, 100% 0%, 100% 90%, 96% 100%, 92% 92%, 88% 100%, 84% 91%, 80% 100%, 76% 92%, 72% 100%, 68% 91%, 64% 100%, 60% 92%, 56% 100%, 52% 91%, 48% 100%, 44% 92%, 40% 100%, 36% 91%, 32% 100%, 28% 92%, 24% 100%, 20% 91%, 16% 100%, 12% 92%, 8% 100%, 4% 91%, 0% 100%)";
// var TORN_TOP_CLIP = "polygon(0% 10%, 4% 0%, 8% 8%, 12% 0%, 16% 9%, 20% 0%, 24% 8%, 28% 0%, 32% 9%, 36% 0%, 40% 8%, 44% 0%, 48% 9%, 52% 0%, 56% 8%, 60% 0%, 64% 9%, 68% 0%, 72% 8%, 76% 0%, 80% 9%, 84% 0%, 88% 8%, 92% 0%, 96% 9%, 100% 0%, 100% 100%, 0% 100%)";
var TORN_BOTTOM_CLIP = "";
var TORN_TOP_CLIP = "";

function ChevronLeft() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
}
function ChevronRight() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
}
function WalletChipIcon() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><path d="M16 12h.01"></path></svg>);
}
function pad(num, len) {
  var s = String(num);
  while (s.length < len) s = "0" + s;
  return s;
}
function money(v) {
  return "$" + Number(v).toFixed(2);
}

const Ticket = () => {
  const navigate = useNavigate();
  var { wallet, refresh: refreshWallet } = useWalletBalance();
  var { activeCard } = useCardFunding();
  var displayBalance = activeCard ? activeCard.balance : wallet.balance;
  var [serverState, setServerState] = useState(null);
  var [screen, setScreen] = useState("game");
  var [selected, setSelected] = useState(null);
  var [phase, setPhase] = useState("idle");
  var [display, setDisplay] = useState(null);
  var [opened, setOpened] = useState(null);
  var [notice, setNotice] = useState(null);
  var [buying, setBuying] = useState(null);
  var dragRef = useRef({ active: false, startY: 0, startX: 0, dy: 0, dx: 0, fired: false });
  var topRef = useRef(null);
  var resultRef = useRef(null);
  var openBusyRef = useRef(false);
  var phaseRef = useRef("idle");
  var noticeTimerRef = useRef(null);

  var packs = serverState ? serverState.packs : [];
  var selPack = null;
  for (var i = 0; i < packs.length; i++) {
    if (packs[i].rarity === selected) selPack = packs[i];
  }

  function setPhaseBoth(p) {
    phaseRef.current = p;
    setPhase(p);
  }

  function showNotice(kind, text) {
    setNotice({ kind: kind, text: text });
  }

  function loadState() {
    return authFetch("/ticket/state").then(function (data) {
      setServerState(data);
    }).catch(function () {});
  }

  useEffect(function () { loadState(); }, []);

  useEffect(function () {
    if (!notice) return;
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(function () { setNotice(null); }, 5000);
    return function () { if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current); };
  }, [notice]);

  useEffect(function () {
    if (phase !== "idle") return;
    if (!selPack || selPack.unopened <= 0) {
      setDisplay(null);
      return;
    }
    setDisplay({
      id: selPack.nextTicket,
      pack: selPack.nextPack,
      index: selPack.nextIndex,
      total: selPack.ticketCount,
      name: selPack.displayName,
      rarity: selPack.rarity
    });
  }, [phase, selected, selPack ? selPack.nextTicket : 0]);

  useEffect(function () {
    if (phase === "idle" && topRef.current) {
      topRef.current.style.clipPath = "";
      topRef.current.style.transition = "";
      topRef.current.style.transform = "";
      topRef.current.style.opacity = "";
    }
  }, [phase]);

  function handleSelect(rarity) {
    if (phase === "tearing" || phase === "switching") return;
    setSelected(rarity);
    setPhaseBoth("idle");
    setOpened(null);
    resultRef.current = null;
  }

  async function handleBuy(pack) {
    if (buying) return;
    setBuying(pack.rarity);
    try {
      await authFetch("/ticket/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rarity: pack.rarity })
      });
      refreshWallet();
      if (!selected) setSelected(pack.rarity);
      showNotice("ok", pack.displayName + " pack — " + pack.ticketCount + " tickets added");
      await loadState();
    } catch (err) {
      showNotice("err", err.message);
    } finally {
      setBuying(null);
    }
  }

  function fireOpen() {
    if (openBusyRef.current || !selected) return;
    openBusyRef.current = true;
    authFetch("/ticket/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rarity: selected })
    }).then(function (res) {
      resultRef.current = res;
      refreshWallet();
    }).catch(function (err) {
      resultRef.current = { error: true, message: err.message };
    }).finally(function () {
      openBusyRef.current = false;
    });
  }

  function onPointerDown(e) {
    if (phaseRef.current !== "idle" || !display) return;
    dragRef.current = { active: true, startY: e.clientY, startX: e.clientX, dy: 0, dx: 0, fired: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    var d = dragRef.current;
    if (!d.active || phaseRef.current !== "idle") return;
    d.dy = e.clientY - d.startY;
    d.dx = e.clientX - d.startX;
    var el = topRef.current;
    if (el) {
      el.style.transform = "translate(" + (d.dx * 0.3) + "px, " + d.dy + "px) rotate(" + (d.dx * 0.05) + "deg)";
    }
    if (!d.fired && Math.abs(d.dy) > 70) {
      d.fired = true;
      fireOpen();
    }
  }

  function onPointerUp() {
    var d = dragRef.current;
    d.active = false;
    if (phaseRef.current !== "idle") return;
    var el = topRef.current;
    if (d.fired || Math.abs(d.dy) > 70) {
      startTear(d.dy, d.dx);
    } else if (el) {
      el.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.3, 1.1)";
      el.style.transform = "translate(0px, 0px) rotate(0deg)";
      setTimeout(function () {
        if (topRef.current) topRef.current.style.transition = "";
      }, 260);
    }
  }

  function startTear(dy, dx) {
    setPhaseBoth("tearing");
    var el = topRef.current;
    if (el) {
      var dir = dy >= 0 ? 1 : -1;
      el.style.clipPath = TORN_BOTTOM_CLIP;
      el.style.transition = "transform 0.42s cubic-bezier(0.3, 0.05, 0.35, 1), opacity 0.4s ease-in";
      el.style.transform = "translate(" + (dx * 2.2) + "px, " + (dir * Math.max(260, Math.abs(dy) * 3)) + "px) rotate(" + (dir * (8 + Math.abs(dx) * 0.08)) + "deg)";
      el.style.opacity = "0";
    }
    setTimeout(function () { finishTear(0); }, 430);
  }

  function finishTear(attempt) {
    var res = resultRef.current;
    if (!res) {
      if (attempt < 30) {
        setTimeout(function () { finishTear(attempt + 1); }, 60);
        return;
      }
      showNotice("err", "could not open ticket");
      setPhaseBoth("idle");
      loadState();
      return;
    }
    if (res.error) {
      showNotice("err", res.message);
      setPhaseBoth("idle");
      loadState();
      return;
    }
    setOpened(res);
    setPhaseBoth("revealed");
    loadState();
  }

  function advance() {
    if (phaseRef.current !== "revealed") return;
    setPhaseBoth("switching");
    setTimeout(function () {
      setOpened(null);
      resultRef.current = null;
      setPhaseBoth("idle");
    }, 250);
  }

  function backToGame() {
    setScreen("game");
    loadState();
  }

  var us = serverState ? serverState.myStats : { packsOpened: 0, ticketsOpened: 0, totalSpent: 0, totalWon: 0, bestTicket: 0, netProfit: 0 };
  var gs = serverState ? serverState.globalStats : { totalPacks: 0, totalTickets: 0, biggestTicket: 0 };

  if (screen === "shop") {
    return (
      <div className="tk-page">
        <div className="tk-topbar">
          <button className="tk-icon-btn" onClick={backToGame}><ChevronLeft /></button>
          <span className="tk-title">Ticket shop</span>
          <div className="tk-balance-chip">
            <WalletChipIcon />
            <span>{"$" + displayBalance.toFixed(2)}</span>
          </div>
        </div>
        {notice && <div className={"tk-notice " + notice.kind}>{notice.text}</div>}
        <div className="tk-shop-list">
          {packs.map(function (pack) {
            return (
              <button key={pack.rarity} className="tk-pack" disabled={buying !== null} onClick={function () { handleBuy(pack); }}>
                <span className="tk-pack-name">{pack.displayName}</span>
                <span className="tk-pack-count">{pack.ticketCount + " tickets"}</span>
                <span className="tk-pack-price">{"$" + pack.price.toFixed(0)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!serverState) {
    return <div className="tk-page"></div>;
  }

  var activeTicket = null;
  if (selPack && (selPack.unopened > 0 || phase !== "idle")) {
    activeTicket = selPack;
  }
  var emptyText = !selected
    ? "Select a rarity below or visit the shop"
    : "Out of tickets — grab a pack in the shop";

  return (
    <div className="tk-page">
      <div className="tk-topbar">
        <span className="tk-title">Ticket</span>
        <div className="tk-balance-chip">
          <WalletChipIcon />
          <span>{"$" + displayBalance.toFixed(2)}</span>
        </div>
      </div>
      {notice && <div className={"tk-notice " + notice.kind}>{notice.text}</div>}
      <div className="tk-active">
        {activeTicket && display ? (
          <div className={"tk-card" + (phase === "switching" ? " switching" : "")} onClick={advance}>
            <div className="tk-under" style={{ clipPath: TORN_TOP_CLIP }}>
              {opened ? (
                <div className="tk-under-inner">
                  <span className="tk-under-line"></span>
                  <span className="tk-prize">{money(opened.value)}</span>
                  
                </div>
              ) : null}
            </div>
            {(phase === "idle" || phase === "tearing") ? (
              <div
                key={display.id}
                ref={topRef}
                className="tk-top"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div className="tk-top-half">
                  <span className="tk-rarity">{display.name}</span>
                  <span className="tk-number">{"No. " + pad(display.id, 6)}</span>
                  <span className="tk-packline">{"PACK " + pad(display.pack, 4) + " · " + display.index + " / " + display.total}</span>
                </div>
                <div className="tk-perf"><span className="tk-perf-x">xwallet</span></div>
                <div className="tk-top-half tk-top-half-b">
                  <div className="tk-barcode">
                    {BARCODE.map(function (w, bi) { return <span key={bi} style={{ width: w + "px" }}></span>; })}
                  </div>
                  <span className="tk-micro">Lavx official game card</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="tk-card tk-empty"><span className="tk-empty-text">{emptyText}</span></div>
        )}
        <span className="tk-hint">{phase === "revealed" ? "Tap for the next ticket" : "Swipe the ticket to tear it"}</span>
      </div>
      <div className="tk-select">
        {packs.map(function (pack) {
          var isActive = selected === pack.rarity;
          return (
            <div key={pack.rarity} className={"tk-slot" + (isActive ? " active" : "")}>
              <div className="tk-slot-info">
                <span className="tk-slot-name">{pack.displayName}</span>
                <span className="tk-slot-count">{pack.unopened + (pack.unopened === 1 ? " ticket" : " tickets")}</span>
              </div>
              <button className="tk-slot-btn" onClick={function () { handleSelect(pack.rarity); }}>
                {isActive ? "Active" : "Select"}
              </button>
            </div>
          );
        })}
      </div>
      <button className="tk-shop-btn" onClick={function () { setScreen("shop"); }}>
        <span className="tk-shop-label">Ticket shop</span>
        <ChevronRight />
      </button>
      <div className="tk-stats">
        <div className="tk-stats-row">
          <div className="tk-stat">
            <span className="tk-stat-label">Packs opened</span>
            <span className="tk-stat-value">{String(us.packsOpened)}</span>
          </div>
          <div className="tk-stat">
            <span className="tk-stat-label">Tickets opened</span>
            <span className="tk-stat-value">{us.ticketsOpened.toLocaleString("en-US")}</span>
          </div>
          <div className="tk-stat">
            <span className="tk-stat-label">Best ticket</span>
            <span className="tk-stat-value">{money(us.bestTicket)}</span>
          </div>
        </div>
        <div className="tk-stats-row">
          <div className="tk-stat">
            <span className="tk-stat-label">Total won</span>
            <span className="tk-stat-value">{money(us.totalWon)}</span>
          </div>
          <div className="tk-stat">
            <span className="tk-stat-label">Total spent</span>
            <span className="tk-stat-value">{money(us.totalSpent)}</span>
          </div>
          <div className="tk-stat">
            <span className="tk-stat-label">Net</span>
            <span className={"tk-stat-value " + (us.netProfit >= 0 ? "pos" : "neg")}>
              {(us.netProfit >= 0 ? "+" : "-") + "$" + Math.abs(us.netProfit).toFixed(2)}
            </span>
          </div>
        </div>
        <span className="tk-stats-global">{gs.totalTickets.toLocaleString("en-US") + " tickets torn worldwide · biggest " + money(gs.biggestTicket)}</span>
      </div>
    </div>
  );
};

export default Ticket;