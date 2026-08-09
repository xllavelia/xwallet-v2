import React, { useState, useEffect, useRef } from "react";
import {
  useVouchers,
  activateVoucher,
  deleteVoucher,
  devGrantVoucher,
  devResetVouchers,
} from "./useVouchers";
import { useWalletBalance } from "./useWallet";

function GemIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12l4 6-10 12L2 9Z" />
      <path d="M2 9h20" />
      <path d="M9 3 8 9l4 12 4-12-1-6" />
    </svg>
  );
}

function isTimedVoucher(voucher) {
  return (
    voucher &&
    (
      voucher.voucherType === "fee_discount" ||
      voucher.voucherType === "xp_boost" ||
      voucher.voucherType === "fee_boost"
    )
  );
}

function computeFeeTiming(voucher, nowTick) {
  if (
    !voucher ||
    !isTimedVoucher(voucher) ||
    voucher.status !== "active" ||
    !voucher.activatedAt ||
    !voucher.durationSeconds
  ) {
    return {
      isExpired: false,
      left: voucher?.durationSeconds || 0,
    };
  }

  var activatedMs = new Date(voucher.activatedAt).getTime();

  if (Number.isNaN(activatedMs)) {
    return {
      isExpired: false,
      left: voucher.durationSeconds || 0,
    };
  }

  var elapsed = Math.floor((nowTick - activatedMs) / 1000);
  var left = Math.max(0, voucher.durationSeconds - elapsed);

  return {
    isExpired: left === 0,
    left: left,
  };
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
  var { wallet } = useWalletBalance();

  var TOTAL_SLOTS =
    wallet && Number.isFinite(wallet.maxVoucherSlots)
      ? wallet.maxVoucherSlots
      : 10;

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
    var iv = setInterval(function () {
      setNowTick(Date.now());
    }, 1000);

    return function () {
      clearInterval(iv);
    };
  }, []);

  function pushToast(text) {
    var id = toastIdRef.current++;

    setToasts(function (prev) {
      return prev.concat([
        {
          id: id,
          text: text,
        },
      ]);
    });

    setTimeout(function () {
      setToasts(function (prev) {
        return prev.filter(function (t) {
          return t.id !== id;
        });
      });
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

    if (!el || el.clientWidth === 0) return;

    var maxIndex = Math.max(0, TOTAL_SLOTS - 1);
    var safeIndex = Math.max(0, Math.min(idx, maxIndex));

    el.scrollTo({
      left: safeIndex * el.clientWidth,
      behavior: "smooth",
    });
  }

  async function handleActivate(voucher) {
    if (!voucher || busyId || deletingId) return;

    setBusyId(voucher.id);

    try {
      var result = await activateVoucher(voucher.id);

      if (result.voucherType === "fee_discount") {
        pushToast("Voucher activated!");
      } else if (result.voucherType === "usdt_credit") {
        pushToast(
          "+ $" + Number(result.creditAmount || 0).toFixed(2) + " credited"
        );
      } else if (result.voucherType === "lavx_credit") {
        pushToast(
          "+ " + Number(result.creditAmount || 0).toFixed(2) + " LAVX credited"
        );
      } else if (result.voucherType === "ref_xp_credit") {
        pushToast(
          "+ " + Number(result.creditAmount || 0).toFixed(2) + " Referral XP"
        );
      } else {
        pushToast("Voucher activated!");
      }

      setBurstKey(function (k) {
        return k + 1;
      });

      await refresh();
    } catch (err) {
      pushToast(err?.message || "Failed to activate voucher");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(voucher) {
    if (!voucher || deletingId || busyId) return;

    setDeletingId(voucher.id);

    try {
      await deleteVoucher(voucher.id);

      setTimeout(async function () {
        try {
          await refresh();
        } finally {
          setDeletingId(null);
        }
      }, 380);
    } catch (err) {
      pushToast(err?.message || "Failed to remove voucher");
      setDeletingId(null);
    }
  }

  async function handleDevGrant(type, amount) {
    try {
      await devGrantVoucher(type, amount);

      pushToast("Dev: granted " + type);

      await refresh();
    } catch (err) {
      pushToast(err?.message || "Dev grant failed");
    }
  }

  async function handleDevReset() {
    try {
      await devResetVouchers();

      pushToast("All vouchers reset");

      await refresh();
    } catch (err) {
      pushToast(err?.message || "Failed to reset vouchers");
    }
  }

  var slots = [];

  for (var i = 0; i < TOTAL_SLOTS; i++) {
    slots.push(vouchers[i] || null);
  }

  var activeIndex = Math.max(
    0,
    Math.min(
      TOTAL_SLOTS - 1,
      Math.round(continuousIndex)
    )
  );

  return (
    <div className="BonusContent">
      <div className="vch-toast-stack">
        {toasts.map(function (t) {
          return (
            <div key={t.id} className="vch-toast">
              {t.text}
            </div>
          );
        })}
      </div>

      {burstKey > 0 && (
        <div className="vch-burst-fx" key={burstKey}></div>
      )}

      <div className="vch-page">
        {vouchers.length === 0 && (
          <div className="vch-empty-state">
            <span className="vch-empty-title">No vouchers yet</span>

            <span className="vch-empty-text">
              Vouchers unlock trading perks, credits, and LAVX. Get them from:
            </span>

            <div className="vch-empty-sources">
              <div className="vch-empty-source">
                <span className="vch-empty-source-title">
                  Battle Pass
                </span>

                <span className="vch-empty-source-sub">
                  Claim tier rewards as you level up
                </span>
              </div>

              <div className="vch-empty-source">
                <span className="vch-empty-source-title">
                  Promo Codes
                </span>

                <span className="vch-empty-source-sub">
                  Redeem codes for bonus vouchers
                </span>
              </div>
            </div>
          </div>
        )}

        {vouchers.length > 0 && (
          <>
            <div
              className="vch-carousel"
              ref={carouselRef}
              onScroll={handleScroll}
            >
              {slots.map(function (voucher, idx) {
                if (!voucher) {
                  return (
                    <div
                      className="vch-slide"
                      key={"empty-" + idx}
                    >
                      <div className="vch-empty-slot">
                        <span className="vch-empty-slot-plus">+</span>

                        <span className="vch-empty-slot-text">
                          Empty Slot
                        </span>

                        <span className="vch-empty-slot-hint">
                          Battle Pass · Promo Codes
                        </span>
                      </div>
                    </div>
                  );
                }

                var isTimed = isTimedVoucher(voucher);
                var isCredit = !isTimed;

                var timing = computeFeeTiming(
                  voucher,
                  nowTick
                );

                var slideClass =
                  "vch-slide" +
                  (deletingId === voucher.id
                    ? " vch-deleting"
                    : "");

                return (
                  <div
                    className={slideClass}
                    key={voucher.id}
                  >
                    <div className="ticket-wrapper">
                      <div className="ticket-main">
                        {isTimed && (
                          <div className="tm-header">
                            <div className="tm-block border-left">
                              <span className="tm-label">
                                DURATION
                              </span>

                              <span className="tm-value">
                                {Math.floor(
                                  (voucher.durationSeconds || 0) /
                                    86400
                                ) + "d"}
                              </span>
                            </div>

                            <div className="tm-block border-left">
                              <span className="tm-label">
                                STATUS
                              </span>

                              <span
                                className={
                                  "tm-value " +
                                  (timing.isExpired
                                    ? "expired-badge"
                                    : voucher.status === "active"
                                      ? "active-badge"
                                      : "inactive-badge")
                                }
                              >
                                {timing.isExpired
                                  ? "EXPIRED"
                                  : voucher.status === "active"
                                    ? "ACTIVE"
                                    : "INACTIVE"}
                              </span>
                            </div>
                          </div>
                        )}

                        {isCredit && (
                          <div className="tm-header">
                            <div className="tm-block border-left">
                              <span className="tm-label">
                                TYPE
                              </span>

                              <span className="tm-value">
                                {voucher.voucherType ===
                                "lavx_credit"
                                  ? "LAVX"
                                  : voucher.voucherType ===
                                      "ref_xp_credit"
                                    ? "REF XP"
                                    : "CREDIT"}
                              </span>
                            </div>

                            <div className="tm-block border-left">
                              <span className="tm-label">
                                STATUS
                              </span>

                              <span className="tm-value inactive-badge">
                                READY
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="tm-hero">
                          <div className="tm-title-wrapper">
                            {voucher.voucherType ===
                              "fee_discount" && (
                              <>
                                <h2>COMMISSION</h2>
                                <h2>DISCOUNT VOUCHER</h2>
                              </>
                            )}

                            {voucher.voucherType ===
                              "xp_boost" && (
                              <>
                                <h2>BATTLE PASS</h2>
                                <h2>XP BOOSTER</h2>
                              </>
                            )}

                            {voucher.voucherType ===
                              "fee_boost" && (
                              <>
                                <h2>PERMANENT</h2>
                                <h2>FEE REDUCTION</h2>
                              </>
                            )}

                            {voucher.voucherType ===
                              "usdt_credit" && (
                              <>
                                <h2>USDT</h2>
                                <h2>BONUS CREDIT</h2>
                              </>
                            )}

                            {voucher.voucherType ===
                              "lavx_credit" && (
                              <>
                                <h2>LAVX</h2>
                                <h2>
                                  BONUS CREDIT <GemIcon />
                                </h2>
                              </>
                            )}

                            {voucher.voucherType ===
                              "ref_xp_credit" && (
                              <>
                                <h2>REFERRAL</h2>
                                <h2>XP BOOST</h2>
                              </>
                            )}
                          </div>

                          <div className="tm-amount">
                            <span className="digits">
                              {isTimed
                                ? "$" +
                                  Number(
                                    voucher.limitAmount || 0
                                  ).toFixed(2)
                                : voucher.voucherType ===
                                  "usdt_credit"
                                  ? "$" +
                                    Number(
                                      voucher.creditAmount || 0
                                    ).toFixed(2)
                                  : voucher.voucherType ===
                                    "lavx_credit"
                                    ? Number(
                                        voucher.creditAmount || 0
                                      ) + "#"
                                    : Number(
                                        voucher.creditAmount || 0
                                      ) + " XP"}
                            </span>
                          </div>
                        </div>

                        {isTimed && (
                          <div className="tm-stats-section">
                            <div className="tm-stats-row">
                              <div className="stat-box">
                                <span className="stat-lbl">
                                  REDEEMED
                                </span>

                                <span className="stat-val">
                                  $
                                  {Number(
                                    voucher.usedAmount || 0
                                  ).toFixed(2)}
                                </span>
                              </div>

                              <div className="stat-box right-align">
                                <span className="stat-lbl">
                                  REMAINING
                                </span>

                                <span className="stat-val highlight">
                                  $
                                  {(
                                    Number(
                                      voucher.limitAmount || 0
                                    ) -
                                    Number(
                                      voucher.usedAmount || 0
                                    )
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isCredit && (
                          <div className="tm-stats-section">
                            <div className="tm-stats-row">
                              <div className="stat-box">
                                <span className="stat-lbl">
                                  ONE-TIME
                                </span>

                                <span className="stat-val">
                                  Single use
                                </span>
                              </div>

                              <div className="stat-box right-align">
                                <span className="stat-lbl">
                                  SOURCE
                                </span>

                                <span className="stat-val highlight">
                                  {String(
                                    voucher.source || "unknown"
                                  ).toUpperCase()}
                                </span>
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
                          <div className="ts-serial">
                            {"NO. " +
                              String(voucher.id).padStart(6, "0")}
                          </div>

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
                    className={
                      "vch-dot" +
                      (idx === activeIndex ? " active" : "")
                    }
                    onClick={() => scrollToIndex(idx)}
                  ></span>
                );
              })}
            </div>

            <div className="vch-info-stack">
              {slots.map(function (voucher, idx) {
                if (!voucher) return null;

                // IMPORTANT:
                // isTimed must be calculated for every voucher
                // before timing/panel logic is used.
                var isTimed = isTimedVoucher(voucher);
                var isCredit = !isTimed;

                var timing = isTimed
                  ? computeFeeTiming(voucher, nowTick)
                  : null;

                var opacity = Math.max(
                  0,
                  1 - Math.abs(continuousIndex - idx)
                );

                var isNear = idx === activeIndex;

                var panelStyle = {
                  opacity: opacity,
                  transform:
                    "translateY(" +
                    (1 - opacity) * 10 +
                    "px)",
                  pointerEvents: isNear ? "auto" : "none",
                  zIndex: isNear ? 2 : 1,
                };

                var isBusy = busyId === voucher.id;
                var isDeleting = deletingId === voucher.id;

                return (
                  <div
                    className="vch-info-panel"
                    style={panelStyle}
                    key={voucher.id}
                  >
                    <div className="voucher-container">
                      <div className="details-section">
                        {isTimed && (
                          <>
                            <div className="details-group">
                              <h3 className="group-title">
                                USAGE STATISTICS
                              </h3>

                              <div className="stats-list">
                                <div className="stats-item">
                                  <span className="s-label">
                                    Limit
                                  </span>

                                  <span className="s-dots"></span>

                                  <span className="s-value">
                                    $
                                    {Number(
                                      voucher.limitAmount || 0
                                    ).toFixed(2)}
                                  </span>
                                </div>

                                <div className="stats-item">
                                  <span className="s-label">
                                    Redeemed
                                  </span>

                                  <span className="s-dots"></span>

                                  <span className="s-value">
                                    $
                                    {Number(
                                      voucher.usedAmount || 0
                                    ).toFixed(2)}
                                  </span>
                                </div>

                                <div className="stats-item">
                                  <span className="s-label">
                                    Available limit
                                  </span>

                                  <span className="s-dots"></span>

                                  <span className="s-value">
                                    $
                                    {(
                                      Number(
                                        voucher.limitAmount || 0
                                      ) -
                                      Number(
                                        voucher.usedAmount || 0
                                      )
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="details-group">
                              <h3 className="group-title">
                                TIME REMAINING
                              </h3>

                              <div className="live-counter">
                                <span
                                  className={
                                    "pulse-dot " +
                                    (timing.isExpired
                                      ? "expired"
                                      : voucher.status === "active"
                                        ? ""
                                        : "inactive")
                                  }
                                ></span>

                                <span className="time-string">
                                  {voucher.status === "active" &&
                                  !timing.isExpired
                                    ? formatCountdown(
                                        timing.left
                                      )
                                    : timing.isExpired
                                      ? "EXPIRED"
                                      : "Not activated"}
                                </span>
                              </div>
                            </div>
                          </>
                        )}

                        {isCredit && (
                          <div className="details-group">
                            <h3 className="group-title">
                              VOUCHER DETAILS
                            </h3>

                            <div className="stats-list">
                              <div className="stats-item">
                                <span className="s-label">
                                  Credit amount
                                </span>

                                <span className="s-dots"></span>

                                <span className="s-value">
                                  {voucher.voucherType ===
                                  "usdt_credit"
                                    ? "$" +
                                      Number(
                                        voucher.creditAmount ||
                                          0
                                      ).toFixed(2)
                                    : voucher.voucherType ===
                                        "ref_xp_credit"
                                      ? Number(
                                          voucher.creditAmount ||
                                            0
                                        ) + " Referral XP"
                                      : Number(
                                          voucher.creditAmount ||
                                            0
                                        ) + " LAVX"}
                                </span>
                              </div>

                              <div className="stats-item">
                                <span className="s-label">
                                  Granted via
                                </span>

                                <span className="s-dots"></span>

                                <span className="s-value">
                                  {String(
                                    voucher.source || "unknown"
                                  ).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="details-group">
                          <h3 className="group-title">
                            DOCUMENTATION
                          </h3>

                          <div className="doc-links">
                            <div className="doc-item">
                              <span className="d-id">
                                {"ID: VCH-" + voucher.id}
                              </span>

                              <span className="d-tag">
                                {String(
                                  voucher.voucherType || ""
                                ).toUpperCase()}
                              </span>
                            </div>

                            <p className="doc-text">
                              {isTimed
                                ? "This voucher reduces trading commission. Applied automatically to all pairs while active."
                                : "One-time credit voucher. Claiming it instantly adds the amount to your balance and removes this ticket."}
                            </p>
                          </div>
                        </div>

                        {isTimed &&
                          voucher.status === "inactive" && (
                            <div className="vch-inactive-actions">
                              <button
                                className="voucher-activate-btn"
                                disabled={isBusy || isDeleting}
                                onClick={() =>
                                  handleActivate(voucher)
                                }
                              >
                                {isBusy
                                  ? "ACTIVATING..."
                                  : "ACTIVATE VOUCHER"}
                              </button>

                              <button
                                className="voucher-activate-btn"
                                disabled={
                                  isBusy || isDeleting
                                }
                                onClick={() =>
                                  handleDelete(voucher)
                                }
                              >
                                {isDeleting
                                  ? "REMOVING..."
                                  : "Remove Ticket"}
                              </button>
                            </div>
                          )}

                        {isTimed && timing.isExpired && (
                          <button
                            className="vch-delete-btn"
                            disabled={isDeleting || isBusy}
                            onClick={() =>
                              handleDelete(voucher)
                            }
                          >
                            {isDeleting
                              ? "REMOVING..."
                              : "Remove Ticket"}
                          </button>
                        )}

                        {isCredit && (
                          <button
                            className="voucher-activate-btn vch-claim-btn"
                            disabled={isBusy || isDeleting}
                            onClick={() =>
                              handleActivate(voucher)
                            }
                          >
                            {isBusy
                              ? "CLAIMING..."
                              : "CLAIM " +
                                (
                                  voucher.voucherType ===
                                  "usdt_credit"
                                    ? "$" +
                                      Number(
                                        voucher.creditAmount ||
                                          0
                                      ).toFixed(2)
                                    : voucher.voucherType ===
                                        "lavx_credit"
                                      ? Number(
                                          voucher.creditAmount ||
                                            0
                                        ) + " LAVX"
                                      : Number(
                                          voucher.creditAmount ||
                                            0
                                        ) + " Referral XP"
                                )}
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

        {/*
        <div className="vch-dev-tools">
          <span className="vch-dev-label">DEV</span>

          <button onClick={() => handleDevGrant("usdt_credit", 25)}>
            +$25
          </button>

          <button onClick={() => handleDevGrant("usdt_credit", 50)}>
            +$50
          </button>

          <button onClick={() => handleDevGrant("usdt_credit", 100)}>
            +$100
          </button>

          <button onClick={() => handleDevGrant("lavx_credit", 25)}>
            +LAVX
          </button>

          <button onClick={() => handleDevGrant("ref_xp_credit", 50)}>
            +50 RefXP
          </button>

          <button onClick={() => handleDevGrant("fee_discount", 100)}>
            +Fee
          </button>

          <button onClick={handleDevReset}>
            Reset
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default Bonus;
