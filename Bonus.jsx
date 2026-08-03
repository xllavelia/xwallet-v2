import React, { useState, useEffect, useRef } from "react";
import { useVouchers, activateVoucher, deleteVoucher, devGrantVoucher, devResetVouchers } from "./useVouchers";

var TOTAL_SLOTS = 5;

function GemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9Z"></path>
      <path d="M2 9h20"></path>
      <path d="M9 3 8 9l4 12 4-12-1-6"></path>
    </svg>
  );
}

function computeFeeTiming(voucher, nowTick) {
  if (voucher.status !== "active" || !voucher.activatedAt || !voucher.durationSeconds) {
    return { isExpired: false, left: voucher.durationSeconds || 0 };
  }
  var activatedMs = new Date(voucher.activatedAt).getTime();
  var elapsed = Math.floor((nowTick - activatedMs) / 1000);
  var left = Math.max(0, voucher.durationSeconds - elapsed);
  return { isExpired: left === 0, left: left };
}

function formatCountdown(totalSeconds) {
  var d = Math.floor(totalSeconds / 86400);
  var h = Math.floor((totalSeconds % 86400) / 3600);
  var m = Math.floor((totalSeconds % 3600) / 60);
  var s = totalSeconds % 60;
  return d + "d " + h + "h " + m + "m " + s + "s";
}

const Bonus = () => {
  var { vouchers, refresh } = useVouchers();

  var [nowTick, setNowTick] = useState(Date.now());
  var [continuousIndex, setContinuousIndex] = useState(0);
  var [toasts, setToasts] = useState([]);
  var [burstKey, setBurstKey] = useState(0);
  var [deletingId, setDeletingId] = useState(null);
  var [busyId, setBusyId] = useState(null);

  var carouselRef = useRef(null);
  var rafPending = useRef(false);
  var toastIdRef = useRef(0);

  useEffect(function () {
    var iv = setInterval(function () { setNowTick(Date.now()); }, 1000);
    return function () { clearInterval(iv); };
  }, []);

  function pushToast(text) {
    var id = toastIdRef.current++;
    setToasts(function (prev) { return prev.concat([{ id: id, text: text }]); });
    setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
    }, 2200);
  }

  function handleScroll() {
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(function () {
      rafPending.current = false;
      var el = carouselRef.current;
      if (!el || el.clientWidth === 0) return;
      setContinuousIndex(el.scrollLeft / el.clientWidth);
    });
  }

  function scrollToIndex(idx) {
    var el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  function resetScroll() {
    setTimeout(function () { scrollToIndex(0); }, 50);
  }

  async function handleActivate(voucher) {
    if (busyId) return;
    setBusyId(voucher.id);
    try {
      var result = await activateVoucher(voucher.id);
      if (result.voucherType === "fee_discount") {
        pushToast("Voucher activated!");
      } else if (result.voucherType === "usdt_credit") {
        pushToast("+ $" + result.creditAmount.toFixed(2) + " credited");
      } else {
        pushToast("+ " + result.creditAmount.toFixed(2) + " LAVX credited");
      }
      setBurstKey(function (k) { return k + 1; });
      await refresh();
      if (result.voucherType !== "fee_discount") resetScroll();
    } catch (err) {
      pushToast(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(voucher) {
    if (deletingId) return;
    setDeletingId(voucher.id);
    try {
      await deleteVoucher(voucher.id);
      setTimeout(async function () {
        await refresh();
        resetScroll();
        setDeletingId(null);
      }, 380);
    } catch (err) {
      pushToast(err.message);
      setDeletingId(null);
    }
  }

  async function handleDevGrant(type, amount) {
    try {
      await devGrantVoucher(type, amount);
      pushToast("Dev: granted " + type);
      await refresh();
    } catch (err) {
      pushToast(err.message);
    }
  }

  async function handleDevReset() {
    await devResetVouchers();
    pushToast("All vouchers reset");
    await refresh();
    resetScroll();
  }

  var slots = [];
  for (var i = 0; i < TOTAL_SLOTS; i++) {
    slots.push(vouchers[i] || null);
  }
  var activeIndex = Math.round(continuousIndex);

  return (
    <div className="BonusContent">
      <div className="vch-toast-stack">
        {toasts.map(function (t) { return <div key={t.id} className="vch-toast">{t.text}</div>; })}
      </div>
      {burstKey > 0 && <div className="vch-burst-fx" key={burstKey}></div>}

      <div className="vch-page">

        {vouchers.length === 0 && (
          <div className="vch-empty-state">
            <span className="vch-empty-title">No vouchers yet</span>
            <span className="vch-empty-text">Vouchers unlock trading perks, credits, and LAVX. Get them from:</span>
            <div className="vch-empty-sources">
              <div className="vch-empty-source">
                <span className="vch-empty-source-title">Battle Pass</span>
                <span className="vch-empty-source-sub">Claim tier rewards as you level up</span>
              </div>
              <div className="vch-empty-source">
                <span className="vch-empty-source-title">Promo Codes</span>
                <span className="vch-empty-source-sub">Redeem codes for bonus vouchers</span>
              </div>
            </div>
          </div>
        )}

        {vouchers.length > 0 && (
          <>
            <div className="vch-carousel" ref={carouselRef} onScroll={handleScroll}>
              {slots.map(function (voucher, idx) {
                if (!voucher) {
                  return (
                    <div className="vch-slide" key={"empty-" + idx}>
                      <div className="vch-empty-slot">
                        <span className="vch-empty-slot-plus">+</span>
                        <span className="vch-empty-slot-text">Empty Slot</span>
                        <span className="vch-empty-slot-hint">Battle Pass · Promo Codes</span>
                      </div>
                    </div>
                  );
                }

                var isCredit = voucher.voucherType !== "fee_discount";
                var timing = !isCredit ? computeFeeTiming(voucher, nowTick) : null;
                var slideClass = "vch-slide" + (deletingId === voucher.id ? " vch-deleting" : "");

                return (
                  <div className={slideClass} key={voucher.id}>
                    <div className="ticket-wrapper">
                      <div className="ticket-main">

                        {!isCredit && (
                          <div className="tm-header">
                            <div className="tm-block border-left">
                              <span className="tm-label">DURATION</span>
                              <span className="tm-value">{Math.floor(voucher.durationSeconds / 86400) + "d"}</span>
                            </div>
                            <div className="tm-block border-left">
                              <span className="tm-label">STATUS</span>
                              <span className={"tm-value " + (timing.isExpired ? "expired-badge" : (voucher.status === "active" ? "active-badge" : "inactive-badge"))}>
                                {timing.isExpired ? "EXPIRED" : (voucher.status === "active" ? "ACTIVE" : "INACTIVE")}
                              </span>
                            </div>
                          </div>
                        )}

                        {isCredit && (
                          <div className="tm-header">
                            <div className="tm-block border-left">
                              <span className="tm-label">TYPE</span>
                              <span className="tm-value">{voucher.voucherType === "lavx_credit" ? "LAVX" : "CREDIT"}</span>
                            </div>
                            <div className="tm-block border-left">
                              <span className="tm-label">STATUS</span>
                              <span className="tm-value inactive-badge">READY</span>
                            </div>
                          </div>
                        )}

                        <div className="tm-hero">
                          <div className="tm-title-wrapper">
                            {!isCredit && (<><h2>COMMISSION</h2><h2>DISCOUNT VOUCHER</h2></>)}
                            {voucher.voucherType === "usdt_credit" && (<><h2>USDT</h2><h2>BONUS CREDIT</h2></>)}
                            {voucher.voucherType === "lavx_credit" && (<><h2>LAVX</h2><h2>BONUS CREDIT <GemIcon /></h2></>)}
                          </div>
                          <div className="tm-amount">
                            <span className="digits">
                              {!isCredit ? ("$" + voucher.limitAmount) : (voucher.voucherType === "usdt_credit" ? ("$" + voucher.creditAmount) : (voucher.creditAmount + " ◈"))}
                            </span>
                          </div>
                        </div>

                        {!isCredit && (
                          <div className="tm-stats-section">
                            <div className="tm-stats-row">
                              <div className="stat-box">
                                <span className="stat-lbl">REDEEMED</span>
                                <span className="stat-val">{"$" + voucher.usedAmount.toFixed(2)}</span>
                              </div>
                              <div className="stat-box right-align">
                                <span className="stat-lbl">REMAINING</span>
                                <span className="stat-val highlight">{"$" + (voucher.limitAmount - voucher.usedAmount).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isCredit && (
                          <div className="tm-stats-section">
                            <div className="tm-stats-row">
                              <div className="stat-box">
                                <span className="stat-lbl">ONE-TIME</span>
                                <span className="stat-val">Single use</span>
                              </div>
                              <div className="stat-box right-align">
                                <span className="stat-lbl">SOURCE</span>
                                <span className="stat-val highlight">{voucher.source.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      <div className="ticket-rip">
                        <div className="hole hole-top"></div>
                        <div className="rip-line"></div>
                        <div className="hole hole-bottom"></div>
                      </div>

                      <div className="ticket-stub">
                        <div className="ts-top">
                          <div className="ts-serial">{"NO. " + voucher.id.toString().padStart(6, "0")}</div>
                          <div className="ts-barcode-v"></div>
                        </div>
                        <div className="ts-bottom"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="vch-dots">
              {slots.map(function (_, idx) {
                return (
                  <span
                    key={idx}
                    className={"vch-dot" + (idx === activeIndex ? " active" : "")}
                    onClick={() => scrollToIndex(idx)}
                  ></span>
                );
              })}
            </div>

            <div className="vch-info-stack">
              {slots.map(function (voucher, idx) {
                if (!voucher) return null;
                var opacity = Math.max(0, 1 - Math.abs(continuousIndex - idx));
                var isNear = idx === activeIndex;
                var isCredit = voucher.voucherType !== "fee_discount";
                var timing = !isCredit ? computeFeeTiming(voucher, nowTick) : null;
                var panelStyle = {
                  opacity: opacity,
                  transform: "translateY(" + ((1 - opacity) * 10) + "px)",
                  pointerEvents: isNear ? "auto" : "none",
                  zIndex: isNear ? 2 : 1
                };
                var isBusy = busyId === voucher.id;

                return (
                  <div className="vch-info-panel" style={panelStyle} key={voucher.id}>
                    <div className="voucher-container">
                      <div className="details-section">

                        {!isCredit && (
                          <>
                            <div className="details-group">
                              <h3 className="group-title">USAGE STATISTICS</h3>
                              <div className="stats-list">
                                <div className="stats-item">
                                  <span className="s-label">Limit</span>
                                  <span className="s-dots"></span>
                                  <span className="s-value">{"$" + voucher.limitAmount.toFixed(2)}</span>
                                </div>
                                <div className="stats-item">
                                  <span className="s-label">Redeemed</span>
                                  <span className="s-dots"></span>
                                  <span className="s-value">{"$" + voucher.usedAmount.toFixed(2)}</span>
                                </div>
                                <div className="stats-item">
                                  <span className="s-label">Available limit</span>
                                  <span className="s-dots"></span>
                                  <span className="s-value">{"$" + (voucher.limitAmount - voucher.usedAmount).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="details-group">
                              <h3 className="group-title">TIME REMAINING</h3>
                              <div className="live-counter">
                                <span className={"pulse-dot " + (timing.isExpired ? "expired" : (voucher.status === "active" ? "" : "inactive"))}></span>
                                <span className="time-string">
                                  {voucher.status === "active" && !timing.isExpired ? formatCountdown(timing.left) : (timing.isExpired ? "EXPIRED" : "Not activated")}
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {isCredit && (
                          <div className="details-group">
                            <h3 className="group-title">VOUCHER DETAILS</h3>
                            <div className="stats-list">
                              <div className="stats-item">
                                <span className="s-label">Credit amount</span>
                                <span className="s-dots"></span>
                                <span className="s-value">
                                  {voucher.voucherType === "usdt_credit" ? ("$" + voucher.creditAmount.toFixed(2)) : (voucher.creditAmount + " LAVX")}
                                </span>
                              </div>
                              <div className="stats-item">
                                <span className="s-label">Granted via</span>
                                <span className="s-dots"></span>
                                <span className="s-value">{voucher.source.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="details-group">
                          <h3 className="group-title">DOCUMENTATION</h3>
                          <div className="doc-links">
                            <div className="doc-item">
                              <span className="d-id">{"ID: VCH-" + voucher.id}</span>
                              <span className="d-tag">{voucher.voucherType.toUpperCase()}</span>
                            </div>
                            <p className="doc-text">
                              {!isCredit
                                ? "This voucher reduces trading commission. Applied automatically to all pairs while active."
                                : "One-time credit voucher. Claiming it instantly adds the amount to your balance and removes this ticket."}
                            </p>
                          </div>
                        </div>

                        {!isCredit && voucher.status === "inactive" && (
                          <button className="voucher-activate-btn" disabled={isBusy} onClick={() => handleActivate(voucher)}>
                            {isBusy ? "ACTIVATING..." : "ACTIVATE VOUCHER"}
                          </button>
                        )}

                        {!isCredit && timing.isExpired && (
                          <>
                            <div className="voucher-expired-banner">This voucher has expired and can no longer be used.</div>
                            <button className="vch-delete-btn" onClick={() => handleDelete(voucher)}>Remove Ticket</button>
                          </>
                        )}

                        {isCredit && (
                          <button className="voucher-activate-btn vch-claim-btn" disabled={isBusy} onClick={() => handleActivate(voucher)}>
                            {isBusy ? "CLAIMING..." : ("CLAIM " + (voucher.voucherType === "usdt_credit" ? ("$" + voucher.creditAmount) : (voucher.creditAmount + " LAVX")))}
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* <div className="vch-dev-tools">
          <span className="vch-dev-label">DEV</span>
          <button onClick={() => handleDevGrant("usdt_credit", 25)}>+$25</button>
          <button onClick={() => handleDevGrant("usdt_credit", 50)}>+$50</button>
          <button onClick={() => handleDevGrant("usdt_credit", 100)}>+$100</button>
          <button onClick={() => handleDevGrant("lavx_credit", 25)}>+LAVX</button>
          <button onClick={() => handleDevGrant("fee_discount", 100)}>+Fee</button>
          <button onClick={handleDevReset}>Reset</button>
        </div> */}

      </div>
    </div>
  );
};

export default Bonus;