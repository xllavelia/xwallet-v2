import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  useBalance,
  readBalance,
  writeBalance,
} from "./useBalance";

var PRIME_TIER_KEY = "prime_tier_v1";
var PRIME_BILLING_KEY = "prime_billing_v1";

function readPrimeTier() {
  return localStorage.getItem(PRIME_TIER_KEY) || null;
}

var TIERS = [
  {
    id: "pro",
    index: "01",
    name: "Pro",
    badge: null,
    tagline:
      "A solid start for active traders who want lower fees and faster fills.",
    monthly: 9.99,
    annualMonthly: 7.99,
    features: [
      "-0.1% trading fees",
      "1 voucher refill / month",
      "Priority order execution",
      "Access up to 100x leverage",
      "Standard support",
    ],
  },
  {
    id: "prime",
    index: "02",
    name: "Prime",
    badge: "MOST POPULAR",
    tagline:
      "Our most popular plan — built for traders who want more from every trade.",
    monthly: 24.99,
    annualMonthly: 19.99,
    features: [
      "-0.25% trading fees",
      "Battle Pass Premium included",
      "3 voucher refills / month",
      "Access up to 150x leverage",
      "Exclusive Graphite card skin",
      "Priority 24h support",
    ],
  },
  {
    id: "star",
    index: "03",
    name: "Star",
    badge: "ELITE",
    tagline:
      "The full experience. Maximum leverage, zero limits, VIP treatment.",
    monthly: 49.99,
    annualMonthly: 39.99,
    features: [
      "-0.5% trading fees — max discount",
      "Battle Pass Premium + instant +2 levels",
      "Unlimited voucher refills",
      "Full 200x leverage unlocked",
      "Legendary card skin",
      "VIP support — replies under 5 min",
    ],
  },
];

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line
        x1="7"
        y1="17"
        x2="17"
        y2="7"
      ></line>

      <polyline points="8 7 17 7 17 16"></polyline>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 12.5 9.5 18 20 6"></polyline>
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8l9-4 9 4-9 4-9-4Z"></path>
      <path d="M3 8v9l9 4 9-4V8"></path>
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="21"
      ></line>
    </svg>
  );
}

const Prime = () => {
  var walletBalance = useBalance();

  var [billing, setBilling] = useState("monthly");
  var [activeIndex, setActiveIndex] = useState(1);
  var [currentTier, setCurrentTier] = useState(
    readPrimeTier()
  );
  var [toasts, setToasts] = useState([]);
  var [burstKey, setBurstKey] = useState(0);

  var carouselRef = useRef(null);
  var cardRefs = useRef([]);
  var toastIdRef = useRef(0);
  var toastTimersRef = useRef([]);

  function centerCard(index, smooth) {
    var container = carouselRef.current;
    var card = cardRefs.current[index];

    if (!container || !card) {
      return;
    }

    var targetLeft =
      card.offsetLeft -
      (container.clientWidth - card.offsetWidth) / 2;

    container.scrollTo({
      left: targetLeft,
      behavior: smooth ? "smooth" : "auto",
    });
  }

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

    var timer = setTimeout(function () {
      setToasts(function (prev) {
        return prev.filter(function (toast) {
          return toast.id !== id;
        });
      });
    }, 2200);

    toastTimersRef.current.push(timer);
  }useLayoutEffect(function () {
    var previousScrollRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    window.scrollTo(0, 0);

    requestAnimationFrame(function () {
      centerCard(1, false);
      window.scrollTo(0, 0);
    });

    return function () {
      window.history.scrollRestoration =
        previousScrollRestoration;
    };
  }, []);

  useEffect(function () {
    var container = carouselRef.current;

    if (!container) {
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.6
          ) {
            var index = parseInt(
              entry.target.getAttribute("data-index"),
              10
            );

            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6],
      }
    );

    cardRefs.current.forEach(function (card) {
      if (card) {
        observer.observe(card);
      }
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  useEffect(function () {
    return function () {
      toastTimersRef.current.forEach(function (timer) {
        clearTimeout(timer);
      });
    };
  }, []);

  var activeTier = TIERS[activeIndex];

  var displayPrice =
    billing === "annual"
      ? activeTier.annualMonthly
      : activeTier.monthly;

  var annualTotal =
    activeTier.annualMonthly * 12;

  var isOwned =
    currentTier === activeTier.id;

  var billingPillClass =
    "prm-billing-pill " + billing;

  function handleBuy() {
    if (isOwned) {
      return;
    }

    var amount =
      billing === "annual"
        ? annualTotal
        : activeTier.monthly;

    if (walletBalance < amount) {
      pushToast(
        "Insufficient balance — top up to continue"
      );

      return;
    }

    writeBalance(readBalance() - amount);
    localStorage.setItem(
      PRIME_TIER_KEY,
      activeTier.id
    );

    localStorage.setItem(
      PRIME_BILLING_KEY,
      billing
    );

    setCurrentTier(activeTier.id);

    setBurstKey(function (key) {
      return key + 1;
    });

    pushToast(
      "Welcome to " + activeTier.name + "!"
    );
  }

  return (
    <div className="PrimeContent">
      <div className="prm-toast-stack">
        {toasts.map(function (toast) {
          return (
            <div
              key={toast.id}
              className="prm-toast"
            >
              {toast.text}
            </div>
          );
        })}
      </div>

      {burstKey > 0 && (
        <div
          className="prm-burst-fx"
          key={burstKey}
        ></div>
      )}

      <div className="prm-page">
        <div className="prm-header">
          <span className="prm-eyebrow">
            Membership
          </span>

          <h1 className="prm-title">
            Unlock Prime
          </h1>

          <p className="prm-subtitle">
            Lower fees, higher leverage, and rewards
            that stack — pick the tier that fits how
            you trade.
          </p>
        </div>

        <div className="prm-launch-banner">
          <span className="prm-launch-text">
            Founder pricing is live — annual plans
            include 2 months free
          </span>
        </div>

        <div className="prm-billing-toggle">
          <div className={billingPillClass}></div>

          <button
            className={
              "prm-billing-btn " +
              (billing === "monthly"
                ? "active"
                : "")
            }
            onClick={function () {
              setBilling("monthly");
            }}
          >
            Monthly
          </button><button
            className={
              "prm-billing-btn " +
              (billing === "annual"
                ? "active"
                : "")
            }
            onClick={function () {
              setBilling("annual");
            }}
          >
            Annual{" "}

            <span className="prm-save-badge">
              Save 20%
            </span>
          </button>
        </div>

        <div
          className="prm-carousel"
          ref={carouselRef}
        >
          {TIERS.map(function (tier, index) {
            var cardClass =
              "prm-card " +
              tier.id +
              (index === activeIndex
                ? " is-active"
                : "");

            var price =
              billing === "annual"
                ? tier.annualMonthly
                : tier.monthly;

            var owned =
              currentTier === tier.id;

            var style = {
              animationDelay:
                index * 0.08 + "s",
            };

            return (
              <div
                className={cardClass}
                key={tier.id}
                data-index={index}
                style={style}
                ref={function (element) {
                  cardRefs.current[index] =
                    element;
                }}
              >
                {tier.id === "star" && (
                  <div className="prm-sparkle-layer">
                    <span className="prm-spark s1"></span>
                    <span className="prm-spark s2"></span>
                    <span className="prm-spark s3"></span>
                  </div>
                )}

                <div className="prm-card-top">
                  {tier.badge ? (
                    <span
                      className={
                        "prm-card-badge " +
                        (tier.badge ===
                        "MOST POPULAR"
                          ? "popular"
                          : "elite")
                      }
                    >
                      {tier.badge}
                    </span>
                  ) : (
                    <span className="prm-card-badge-empty"></span>
                  )}

                  <span className="prm-card-index">
                    {tier.index}
                  </span>
                </div>

                <h2 className="prm-card-name">
                  {tier.name}
                </h2>

                <div className="prm-price-row">
                  <span className="prm-price-currency">
                    $
                  </span>

                  <span className="prm-price-amount">
                    {price.toFixed(2)}
                  </span>

                  <span className="prm-price-period">
                    /mo
                  </span>
                </div>

                {billing === "annual" && (
                  <div className="prm-price-strike-row">
                    <span className="prm-price-strike">
                      {"$" +
                        tier.monthly.toFixed(2)}
                    </span>

                    <span className="prm-save-tag">
                      Save 20%
                    </span>
                  </div>
                )}

                {owned && (
                  <div className="prm-owned-tag">
                    <CheckIcon />
                    Active plan
                  </div>
                )}

                <p className="prm-card-tagline">
                  {tier.tagline}
                </p>

                <div className="prm-feature-list">
                  {tier.features.map(function (
                    feature,
                    featureIndex
                  ) {
                    return (
                      <div
                        className="prm-feature-item"
                        key={featureIndex}
                      >
                        <ArrowIcon /><span>
                          {feature}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="prm-dots">
          {TIERS.map(function (tier, index) {
            return (
              <span
                key={tier.id}
                className={
                  "prm-dot" +
                  (index === activeIndex
                    ? " active"
                    : "")
                }
                onClick={function () {
                  centerCard(index, true);
                }}
              ></span>
            );
          })}
        </div>

        <div className="prm-tie-in">
          <div className="prm-tie-in-icon">
            <GiftIcon />
          </div>

          <div className="prm-tie-in-text">
            <span className="prm-tie-in-title">
              Prime &amp; Star include Battle Pass Premium
            </span>

            <span className="prm-tie-in-sub">
              A $9.99 value, unlocked automatically
              at no extra cost.
            </span>
          </div>
        </div>

        <div className="prm-trust-row">
          <span>
            Cancel anytime
          </span>

          <span className="prm-trust-dot"></span>

          <span>
            Secure in-app payment
          </span>

          <span className="prm-trust-dot"></span>

          <span>
            Instant activation
          </span>
        </div>
      </div>

      <div className="prm-sticky-bar">
        <div className="prm-sticky-info">
          <span className="prm-sticky-tier">
            {activeTier.name}
          </span>

          <span className="prm-sticky-price">
            {"$" +
              displayPrice.toFixed(2) +
              "/mo"}

            {billing === "annual" && (
              <span className="prm-sticky-sub">
                {"billed $" +
                  annualTotal.toFixed(2) +
                  "/yr"}
              </span>
            )}
          </span>
        </div>

        <button
          className={
            "prm-buy-btn" +
            (isOwned ? " owned" : "")
          }
          disabled={isOwned}
          onClick={handleBuy}
        >
          {isOwned
            ? "Current Plan"
            : "Get " + activeTier.name}
        </button>
      </div>
    </div>
  );
};

export default Prime;