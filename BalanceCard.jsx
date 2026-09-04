import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBankCards, openCard, topUpCard, selectActiveCard, closeCard } from "./useBankCards";
import { useWalletBalance } from "./useWallet";
import { TIER_COLORS, TIER_NAMES, MiniCardThumb } from "./bankCardVisuals";

function PlusIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
}
function SettingsIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
}

function HeroCard(props) {
  var tier = props.tier;
  var color = TIER_COLORS[tier] || "#5a5a5a";
  return (
    <div className={"bcx-hero-card bcx-tier-" + tier}>
      <div className="bcx-hero-glow" style={{ background: color }}></div>
      <div className="bcx-hero-top">
        <span className="bcx-hero-brand">xwallet</span>
        <span className="bcx-hero-tier">{TIER_NAMES[tier]}</span>
      </div>
      <div className="bcx-hero-chip-row">
        <div className="bcx-hero-chip"></div>
        <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 21.3c-2.8-2.6-4.5-6.4-4.5-10.6 0-4.2 1.7-8 4.5-10.6"></path><path d="M12.5 18.5c-2-1.9-3.2-4.6-3.2-7.6 0-3 1.2-5.7 3.2-7.6"></path><path d="M16 15.2c-1.1-1.1-1.8-2.6-1.8-4.3 0-1.7.7-3.2 1.8-4.3"></path></svg>
      </div>
      <span className="bcx-hero-number">{props.number ? props.number.replace(/(.{4})/g, "$1 ").trim() : "···· ···· ···· ····"}</span>
      <div className="bcx-hero-bottom">
        <div>
          <span className="bcx-hero-label">Balance</span>
      
      <span className="bcx-hero-balance">
  {"$" + Number(props.balance || 0).toFixed(2)}
</span>
     </div>
        {props.active && <span className="bcx-hero-active-tag">TRADING</span>}
      </div>
    </div>
  );
}

const BalanceCard = () => {
  const navigate = useNavigate();

  var { data, refresh } = useBankCards();
  var { wallet, refresh: refreshWallet } = useWalletBalance();

  var carouselRef = useRef(null);
  var cardRefs = useRef([]);
  var [focusedIndex, setFocusedIndex] = useState(0);

  var [catalogOpen, setCatalogOpen] = useState(false);
  var [actionSheetCard, setActionSheetCard] = useState(null);
  var [topUpOpen, setTopUpOpen] = useState(false);
  var [topUpAmount, setTopUpAmount] = useState("");
  var [statusMsg, setStatusMsg] = useState(null);
  var [statusOk, setStatusOk] = useState(true);
  var [isBusy, setIsBusy] = useState(false);
  var [closeConfirm, setCloseConfirm] = useState(false);

  useEffect(function () {
    var container = carouselRef.current;
    if (!container || !data || data.cards.length === 0) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          var idx = parseInt(entry.target.getAttribute("data-index"), 10);
          if (!isNaN(idx)) setFocusedIndex(idx);
        }
      });
    }, { root: container, threshold: [0.6] });
    cardRefs.current.forEach(function (el) { if (el) observer.observe(el); });
    return function () { observer.disconnect(); };
  }, [data]);

  if (!data) return <div className="BalanceCardContent"></div>;

  var cards = data.cards;

  function pushStatus(text, ok) {
    setStatusMsg(text);
    setStatusOk(ok);
    setTimeout(function () { setStatusMsg(null); }, 2400);
  }

  async function handleOpenTier(tierId) {
    setIsBusy(true);
    try {
      await openCard(tierId);
      pushStatus("Card opened!", true);
      setCatalogOpen(false);
      refresh();
      refreshWallet();
    } catch (err) {
      pushStatus(err.message, false);
    } finally {
      setIsBusy(false);
    }
  }

  function openActions(card) {
    setActionSheetCard(card);
    setTopUpOpen(false);
    setCloseConfirm(false);
  }
  function openActionsForFocused() {
    if (cards[focusedIndex]) openActions(cards[focusedIndex]);
  }

  async function handleSelectActive() {
    setIsBusy(true);
    try {
      await selectActiveCard(actionSheetCard.id);
      pushStatus(actionSheetCard.tier.toUpperCase() + " is now active for trading", true);
      setActionSheetCard(null);
      refresh();
    } catch (err) {
      pushStatus(err.message, false);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSendFromCard() {
    setIsBusy(true);
    try {
      if (!actionSheetCard.isActiveForTrading) {
        await selectActiveCard(actionSheetCard.id);
        refresh();
      }
      navigate("/send");
    } catch (err) {
      pushStatus(err.message, false);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTopUpSubmit() {
    var amt = parseFloat(topUpAmount);
    if (!amt || amt <= 0) { pushStatus("Enter a valid amount", false); return; }
    setIsBusy(true);
    try {
      await topUpCard(actionSheetCard.id, amt);
      pushStatus("Topped up $" + amt.toFixed(2), true);
      setTopUpOpen(false);
      setTopUpAmount("");
      setActionSheetCard(null);
      refresh();
      refreshWallet();
    } catch (err) {
      pushStatus(err.message, false);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCloseCard() {
    setIsBusy(true);
    try {
      await closeCard(actionSheetCard.id);
      pushStatus("Card closed", true);
      setActionSheetCard(null);
      refresh();
    } catch (err) {
      pushStatus(err.message, false);
    } finally {
      setIsBusy(false);
    }
  }

  var totalBalance = cards.reduce(function (acc, c) { return acc + c.balance; }, 0);
  var focusedCard = cards[focusedIndex];

  return (
    <div className="BalanceCardContent">
      <div className="Road-Home" onClick={() => navigate(-1)}></div>
      {statusMsg && <div className={"bcx-toast " + (statusOk ? "ok" : "err")}>{statusMsg}</div>}

      <div className="bcx-page">

        <div className="bcx-page-header">
          <div>
            <h1 className="bcx-title">Cards</h1>
            <span className="bcx-subtitle">Manage your cards and track cashback</span>
          </div>
          <button className="bcx-add-btn" onClick={() => setCatalogOpen(true)}><PlusIcon /></button>
        </div>

        {cards.length === 0 && (
          <div className="bcx-empty-state" onClick={() => setCatalogOpen(true)}>
            <span className="bcx-empty-title">No cards yet</span>
            <span className="bcx-empty-sub">Open your free Standard card to get started</span>
          </div>
        )}

        {cards.length > 0 && (
          <div className="bcx-carousel" ref={carouselRef}>
            {cards.map(function (card, idx) {
              return (
                <div
                  className="bcx-carousel-slide"
                  key={card.id}
                  data-index={idx}
                  ref={function (el) { cardRefs.current[idx] = el; }}
                  onClick={() => openActions(card)}
                >
                  <HeroCard tier={card.tier} number={card.cardNumber} balance={card.balance} active={card.isActiveForTrading} />
                </div>
              );
            })}
          </div>
        )}

        {cards.length > 1 && (
          <div className="bcx-dots">
            {cards.map(function (_, idx) {
              return <span key={idx} className={"bcx-dot" + (idx === focusedIndex ? " active" : "")}></span>;
            })}
          </div>
        )}

        <div className="bcx-quick-actions">
          <div className="bcx-quick-tile" onClick={() => setCatalogOpen(true)}>
            <div className="bcx-quick-icon"><PlusIcon /></div>
            <div>
              <span className="bcx-quick-title">Open New Card</span>
              <span className="bcx-quick-sub">Up to {data.maxCards} at once</span>
            </div>
          </div>
          <div className="bcx-quick-tile" onClick={openActionsForFocused}>
            <div className="bcx-quick-icon"><SettingsIcon /></div>
            <div>
              <span className="bcx-quick-title">Manage Card</span>
              <span className="bcx-quick-sub">{focusedCard ? TIER_NAMES[focusedCard.tier] : "Top up, send, close"}</span>
            </div>
          </div>
        </div>

        <div className="bcx-section-title">Overview <span className="bcx-section-sub">This Month</span></div>
        <div className="bcx-stats-grid">
          <div className="bcx-stat-cell">
            <span className="bcx-stat-label">Total Balance</span>
            <span className="bcx-stat-value">{"$" + totalBalance.toFixed(2)}</span>
          </div>
          <div className="bcx-stat-cell">
            <span className="bcx-stat-label">Cashback Earned</span>
            <span className="bcx-stat-value pos">{"+$" + data.totalCashbackThisMonth}</span>
          </div>
          <div className="bcx-stat-cell">
            <span className="bcx-stat-label">Open Cards</span>
            <span className="bcx-stat-value">{cards.length + " / " + data.maxCards}</span>
          </div>
          <div className="bcx-stat-cell">
            <span className="bcx-stat-label">Active For Trading</span>
            <span className="bcx-stat-value">{(cards.find(function (c) { return c.isActiveForTrading; }) || { tier: "none" }).tier}</span>
          </div>
        </div>

        {cards.length > 0 && (
          <>
            <div className="bcx-section-title">Your Cards</div>
            <div className="bcx-list">
              {cards.map(function (card) {
                return (
                  <div className="bcx-list-row" key={card.id} onClick={() => openActions(card)}>
                    <MiniCardThumb tier={card.tier} last4={card.cardNumber.slice(-4)} size="md" />
                    <div className="bcx-list-info">
                      <div className="bcx-list-top">
                        <span className="bcx-list-name">{TIER_NAMES[card.tier]}</span>
                        {card.isActiveForTrading && <span className="bcx-list-active-pill">Active</span>}
                      </div>
                      <span className="bcx-list-sub">{"···· " + card.cardNumber.slice(-4)}</span>
                    </div>
                    <div className="bcx-list-right">
                      <span className="bcx-list-balance">{"$" + card.balance.toFixed(2)}</span>
                      <span className="bcx-list-chevron">›</span>
                    </div>
                  </div>
                );
              })}
              <div className="bcx-list-row bcx-list-add" onClick={() => setCatalogOpen(true)}>
                <PlusIcon /><span>Open New Card</span>
              </div>
            </div>
          </>
        )}

      </div>

      {catalogOpen && (
        <div className="bcx-overlay" onClick={() => setCatalogOpen(false)}>
          <div className="bcx-sheet" onClick={function (e) { e.stopPropagation(); }}>
            <div className="bcx-sheet-handle"></div>
            <span className="bcx-sheet-title">Choose a Card</span>

            <div className="bcx-catalog-list">
              {data.catalog.map(function (t) {
                var alreadyOwned = cards.some(function (c) { return c.tier === t.id; });
                return (
                  <div className="bcx-catalog-row" key={t.id}>
                    <div className="bcx-catalog-swatch" style={{ background: TIER_COLORS[t.id] }}></div>
                    <div className="bcx-catalog-info">
                      <span className="bcx-catalog-name">{t.name}</span>
                      <span className="bcx-catalog-perks">
                        {t.id === "standard"
                          ? "No perks — free trading card"
                          : (t.cashbackPercent + "% cashback · " + (t.feeFullyWaived ? "0% fees" : ("-" + (t.feeReductionPoints / 10).toFixed(1) + "% fee")) + " · " + t.lavxPerMonth + " LAVX/mo")}
                      </span>
                    </div>
                    <button className="bcx-catalog-btn" disabled={alreadyOwned || isBusy || cards.length >= data.maxCards} onClick={() => handleOpenTier(t.id)}>
                      {alreadyOwned ? "Owned" : (t.openPriceUsd > 0 ? ("$" + t.openPriceUsd) : "Free")}
                    </button>
                  </div>
                );
              })}
            </div>
            {cards.length >= data.maxCards && <span className="bcx-limit-hint">Maximum of {data.maxCards} cards reached.</span>}
          </div>
        </div>
      )}

      {actionSheetCard && (
        <div className="bcx-overlay" onClick={() => setActionSheetCard(null)}>
          <div className="bcx-sheet" onClick={function (e) { e.stopPropagation(); }}>
            <div className="bcx-sheet-handle"></div>
            <div className="bcx-sheet-preview">
              <HeroCard tier={actionSheetCard.tier} number={actionSheetCard.cardNumber} balance={actionSheetCard.balance} active={actionSheetCard.isActiveForTrading} />
            </div>

            {!topUpOpen && !closeConfirm && (
              <div className="bcx-action-list">
                <button className="bcx-action-row" onClick={() => setTopUpOpen(true)}>Top Up</button>
                <button className="bcx-action-row" disabled={isBusy} onClick={handleSendFromCard}>Send</button>
                <button className="bcx-action-row" disabled={isBusy || actionSheetCard.isActiveForTrading} onClick={handleSelectActive}>
                  {actionSheetCard.isActiveForTrading ? "Already active for trading" : "Select for Trading"}
                </button>
                <button className="bcx-action-row danger" onClick={() => setCloseConfirm(true)}>Close Card</button>
              </div>
            )}

            {topUpOpen && (
              <div className="bcx-topup-panel">
                <div className="bcx-topup-row">
                  <span className="bcx-topup-currency">$</span>
                  <input type="number" className="bcx-topup-input" placeholder="0.00" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} autoFocus />
                </div>
                <span className="bcx-topup-hint">{"From wallet · Available $" + wallet.balance.toFixed(2)}</span>
                <div className="bcx-sheet-btn-row">
                  <button className="bcx-secondary-btn" onClick={() => setTopUpOpen(false)}>Cancel</button>
                  <button className="bcx-primary-btn" disabled={isBusy} onClick={handleTopUpSubmit}>Confirm</button>
                </div>
              </div>
            )}

            {closeConfirm && (
              <div className="bcx-close-confirm">
                <p>{"Closing this card permanently deletes its $" + actionSheetCard.balance.toFixed(2) + " balance. This cannot be undone."}</p>
                <div className="bcx-sheet-btn-row">
                  <button className="bcx-secondary-btn" onClick={() => setCloseConfirm(false)}>Cancel</button>
                  <button className="bcx-danger-btn" disabled={isBusy} onClick={handleCloseCard}>Close Forever</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;