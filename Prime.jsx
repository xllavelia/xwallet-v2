import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { usePrime, purchasePrime } from "./usePrime";
import { useBattlePass } from "./useBattlePass";
import XDrop from "./XDrop";

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="8 7 17 7 17 16"></polyline>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12.5 9.5 18 20 6"></polyline>
    </svg>
  );
}
function GemIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9Z"></path>
      <path d="M2 9h20"></path>
      <path d="M9 3 8 9l4 12 4-12-1-6"></path>
    </svg>
  );
}

function buildFeatures(tier) {
  var features = [];
  features.push("Battle Pass — " + tier.name + " Track");
  if (tier.feeFree) {
    features.push({ text: "0% trading fee — completely free", italic: true });
  } else {
    features.push(tier.feeRatePercent + "% trading fee");
  }
  var bundleParts = ["$" + tier.usdVoucherAmount + " USDT"];
  if (tier.feeVoucherLimit > 0) {
    bundleParts.push("$" + tier.feeVoucherLimit + " fee-free (" + tier.feeVoucherDays + "d)");
  }
  bundleParts.push("+" + tier.refXpVoucher + " Referral XP");
  features.push("Monthly bundle: " + bundleParts.join(" + "));
  features.push(tier.id === "star" ? "Direct line to the CEO" : "Priority support");
  features.push(tier.id === "star" ? "Star-only elite club (Telegram)" : "Members club access (Telegram)");
  if (tier.maxVoucherSlots > 5) {
    features.push(tier.maxVoucherSlots + " voucher slots while subscribed");
  }
  return features;
}

var TAGLINES = {
  pro: "A solid start for traders who want lower fees and their own Battle Pass track.",
  prime: "Our most popular plan — built for traders who want more from every trade.",
  star: "The full experience. Zero fees, maximum rewards, direct access."
};

const Prime = () => {
  var { status, refresh } = usePrime();
var { data: bpData, refresh: refreshBp } = useBattlePass();
  var [billing, setBilling] = useState("monthly");
  var [activeIndex, setActiveIndex] = useState(1);
  var [toasts, setToasts] = useState([]);
  var [burstKey, setBurstKey] = useState(0);
  var [isPurchasing, setIsPurchasing] = useState(false);

  var carouselRef = useRef(null);
  var cardRefs = useRef([]);
  var toastIdRef = useRef(0);
  var toastTimersRef = useRef([]);

  function centerCard(index, smooth) {
    var container = carouselRef.current;
    var card = cardRefs.current[index];
    if (!container || !card) return;
    var targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: smooth ? "smooth" : "auto" });
  }

  function pushToast(text) {
    var id = toastIdRef.current++;
    setToasts(function (prev) { return prev.concat([{ id: id, text: text }]); });
    var timer = setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
    }, 2400);
    toastTimersRef.current.push(timer);
  }

  useLayoutEffect(function () {
    var previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    requestAnimationFrame(function () {
      centerCard(1, false);
      window.scrollTo(0, 0);
    });
    return function () { window.history.scrollRestoration = previous; };
  }, [status]);

  useEffect(function () {
    var container = carouselRef.current;
    if (!container) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          var index = parseInt(entry.target.getAttribute("data-index"), 10);
          if (!isNaN(index)) setActiveIndex(index);
        }
      });
    }, { root: container, threshold: [0.6] });
    cardRefs.current.forEach(function (card) { if (card) observer.observe(card); });
    return function () { observer.disconnect(); };
  }, [status]);

  useEffect(function () {
    return function () {
      toastTimersRef.current.forEach(function (timer) { clearTimeout(timer); });
    };
  }, []);

  if (!status) {
    return <div className="PrimeContent"></div>;
  }

  var tiers = status.tiers;
  var activeTierCfg = tiers[activeIndex];
  var isOwned = status.activeTier === activeTierCfg.id;
  var displayPrice = billing === "annual" ? activeTierCfg.annualPriceLavx : activeTierCfg.monthlyPriceLavx;
  var annualTotal = activeTierCfg.annualPriceLavx * 12;
  var billingPillClass = "prm-billing-pill " + billing;

  async function handleBuy() {
    if (isOwned || isPurchasing) return;
    var cost = billing === "annual" ? annualTotal : activeTierCfg.monthlyPriceLavx;
    if (status.lavxBalance < cost) {
      pushToast("Insufficient LAVX — you need " + cost + " LAVX");
      return;
    }
    setIsPurchasing(true);
    try {
      await purchasePrime(activeTierCfg.id, billing);
      setBurstKey(function (k) { return k + 1; });
      pushToast("Welcome to " + activeTierCfg.name + "!");
      await refresh();
    } catch (err) {
      pushToast(err.message);
    } finally {
      setIsPurchasing(false);
    }
  }

  var expiresLabel = "";
  if (status.activeTier) {
    var d = new Date(status.expiresAt);
    expiresLabel = "Active until " + d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="PrimeContent">
      <div className="prm-toast-stack">
        {toasts.map(function (t) {
          return <div key={t.id} className="prm-toast">{t.text}</div>;
        })}
      </div>
      {burstKey > 0 && <div className="prm-burst-fx" key={burstKey}></div>}

      <div className="prm-page">
        <div className="prm-header">
          <span className="prm-eyebrow">Membership</span>
          <h1 className="prm-title">Unlock Prime</h1>
          <p className="prm-subtitle">Lower fees, higher leverage, and rewards that stack — pick the tier that fits how you trade.</p>
        </div>

        <div className="prm-lavx-bar">
          <div className="prm-lavx-icon"><GemIcon /></div>
          <div className="prm-lavx-info">
            <span className="prm-lavx-label">Your LAVX Balance</span>
            <span className="prm-lavx-value">{status.lavxBalance.toLocaleString("en-US") + " LAVX"}</span>
          </div>
          {status.activeTier && (
            <span className="prm-lavx-active-badge">{expiresLabel}</span>
          )}
        </div>

        {/* <p className="prm-lavx-hint">LAVX is a premium currency credited manually — it can't be earned in-app yet.</p> */}

        <div className="prm-billing-toggle">
          <div className={billingPillClass}></div>
          <button className={"prm-billing-btn " + (billing === "monthly" ? "active" : "")} onClick={() => setBilling("monthly")}>Monthly</button>
          <button className={"prm-billing-btn " + (billing === "annual" ? "active" : "")} onClick={() => setBilling("annual")}>
            Annual <span className="prm-save-badge">Save more</span>
          </button>
        </div>

        <div className="prm-carousel" ref={carouselRef}>
          {tiers.map(function (tier, index) {
            var cardClass = "prm-card " + tier.id + (index === activeIndex ? " is-active" : "");
            var price = billing === "annual" ? tier.annualPriceLavx : tier.monthlyPriceLavx;
            var owned = status.activeTier === tier.id;
            var style = { animationDelay: index * 0.08 + "s" };
            var features = buildFeatures(tier);
            var badge = tier.id === "prime" ? "MOST POPULAR" : (tier.id === "star" ? "ELITE" : null);

            return (
              <div className={cardClass} key={tier.id} data-index={index} style={style} ref={function (el) { cardRefs.current[index] = el; }}>
                {tier.id === "star" && (
                  <div className="prm-sparkle-layer">
                    <span className="prm-spark s1"></span>
                    <span className="prm-spark s2"></span>
                    <span className="prm-spark s3"></span>
                  </div>
                )}

                <div className="prm-card-top">
                  {badge ? (
                    <span className={"prm-card-badge " + (badge === "MOST POPULAR" ? "popular" : "elite")}>{badge}</span>
                  ) : <span className="prm-card-badge-empty"></span>}
                  <span className="prm-card-index">{(index + 1).toString().padStart(2, "0")}</span>
                </div>

                <h2 className="prm-card-name">{tier.name}</h2>

                <div className="prm-price-row">
                  <GemIcon />
                  <span className="prm-price-amount">{price}</span>
                  <span className="prm-price-period">LAVX/mo</span>
                </div>

                {billing === "annual" && (
                  <div className="prm-price-strike-row">
                    <span className="prm-price-strike">{tier.monthlyPriceLavx + " LAVX"}</span>
                    <span className="prm-save-tag">{"Save " + Math.round((1 - tier.annualPriceLavx / tier.monthlyPriceLavx) * 100) + "%"}</span>
                  </div>
                )}

                {owned && (
                  <div className="prm-owned-tag"><CheckIcon /> Active plan</div>
                )}

                <p className="prm-card-tagline">{TAGLINES[tier.id]}</p>

                <div className="prm-feature-list">
                  {features.map(function (feature, fi) {
                    var isObj = typeof feature === "object";
                    return (
                      <div className={"prm-feature-item" + (isObj && feature.italic ? " prm-feature-italic" : "")} key={fi}>
                        <ArrowIcon />
                        <span>{isObj ? feature.text : feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="prm-dots">
          {tiers.map(function (tier, index) {
            return (
              <span key={tier.id} className={"prm-dot" + (index === activeIndex ? " active" : "")} onClick={() => centerCard(index, true)}></span>
            );
          })}
        </div>

        <div className="prm-trust-row">
          <span>Cancel anytime</span>
          <span className="prm-trust-dot"></span>
          <span>Paid in LAVX</span>
          <span className="prm-trust-dot"></span>
          <span>Instant activation</span>
        </div>

        {bpData && (
  <XDrop
    counts={{ classicoCases: bpData.classicoCases, elysiumCases: bpData.elysiumCases, legendaryCases: bpData.legendaryCases }}
    onOpened={refreshBp}
  />
)}
      </div>

      <div className="prm-sticky-bar">
        <div className="prm-sticky-info">
          <span className="prm-sticky-tier">{activeTierCfg.name}</span>
          <span className="prm-sticky-price">
            {displayPrice + " LAVX/mo"}
            {billing === "annual" && (
              <span className="prm-sticky-sub">{ annualTotal + " LAVX"}</span>
            )}
          </span>
        </div>
        <button className={"prm-buy-btn" + (isOwned ? " owned" : "")} disabled={isOwned || isPurchasing} onClick={handleBuy}>
          {isOwned ? "Current Plan" : (isPurchasing ? "Processing..." : "" + activeTierCfg.name)}
        </button>
      </div>
    </div>
  );
};

export default Prime;