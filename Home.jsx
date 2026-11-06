import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "./useAccount";
import { useHomeSummary } from "./useHomeSummary";
import { useHomeAccounts, accountUsd } from "./useHomeAccounts";
import { HomeAccountPager } from "./HomeAccounts";
import { HomeCardFocus } from "./HomeCardFocus";
import { RewardsPickerModal, MiniGamesModal } from "./HomePickers";

// git add .
// git commit -m "remaster crypto, action, comm."
// git push -u origin main 


// git commit -m "fix"

// git add .
// git commit --amend --no-edit
// git push --force-with-lease

// git reset --soft HEAD~1
// git add .
// git commit --amend --no-edit

function HomeIcon({ kind }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === "search" && <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></>}
      {kind === "gift" && <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9M12 8v13" /><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" /></>}
      {kind === "create" && <><path d="M12 4v16M4 12h16" /></>}
      {kind === "history" && <><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" /><path d="M9 9h6M9 13h6M9 17h3" /></>}
      {kind === "send" && <><path d="M4 12h16m-7-7 7 7-7 7" /></>}
      {kind === "single" && <><path d="m5 16-1 4 4-1L20 7l-3-3L5 16Z" /><path d="m14 7 3 3" /></>}
      {kind === "grid" && <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>}
      {kind === "games" && <><path d="M7 7h10c2 0 3 2 3.5 4l1 5c.5 3-2 4-4 2l-2-2h-7l-2 2c-2 2-4.5 1-4-2l1-5C4 9 5 7 7 7Z" /><path d="M7 10v5m-2.5-2.5h5" /><circle cx="16" cy="11" r=".7" fill="currentColor" /><circle cx="18" cy="14" r=".7" fill="currentColor" /></>}
      {kind === "referral" && <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6m3-3h-6"/></>}


    </svg>
  );
}

function ActivityArt() {
  return (
    <svg className="hxr-activity-art" viewBox="0 0 104 70" fill="none" aria-hidden="true">
      <rect x="1" y="35" width="28" height="34" rx="9" fill="#e4f2ff" />
      <path d="M10 46h8v14h-8zM18 48h3l2 3v6h-3" stroke="#429ce3" strokeWidth="2" strokeLinejoin="round" />
      <rect x="37" y="18" width="28" height="51" rx="9" fill="#def5e9" />
      <path d="m46 49 9-9 7 7-9 9a3 3 0 0 1-4 0l-3-3a3 3 0 0 1 0-4Z" fill="#43b994" /><circle cx="55" cy="46" r="1.5" fill="#def5e9" />
      <rect x="73" y="1" width="28" height="68" rx="9" fill="#ffecd9" />
      <path d="M81 43v8m3-8v8m3-8v8m-6-4h6m-3 4v10m10-18v18m0-18c-4 4-4 9 0 9" stroke="#dc963c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();
  const { account } = useAccount();
  const summary = useHomeSummary();
  const [picker, setPicker] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("xw-home-view") === "single" ? "single" : "grid");
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(() => localStorage.getItem("xw-home-account") || "wallet");
  const [focused, setFocused] = useState(false);
  const [focusCard, setFocusCard] = useState(null);
  const { accounts, canOpen } = useHomeAccounts(balanceHidden);
  const hide = value => balanceHidden ? "••••" : value;
  const cardFocused = viewMode === "single" && focused;

  function toggleView() {
    const next = viewMode === "grid" ? "single" : "grid";
    localStorage.setItem("xw-home-view", next);
    localStorage.setItem("xw-home-account", selectedAccount);
    setFocused(false);
    setFocusCard(null);
    setViewMode(next);
  }

  function openCardFocus(account, rect, clipBottom) {
    setFocused(true);
    setFocusCard({ account, rect, clipBottom: clipBottom || 0 });
  }

  function selectAccount(key) {
    localStorage.setItem("xw-home-account", key);
    setSelectedAccount(key);
  }
  const month = new Date().toLocaleDateString("en-US", { month: "long" });
  const actions = [
    { kind: "create", label: "Create", onClick: () => navigate("/balancecard?open=1") },
    { kind: "referral", label: "Referral", onClick: () => navigate("/referral") },
    { kind: "send", label: "Send", onClick: () => navigate("/send") },
    { kind: viewMode === "grid" ? "single" : "grid", label: "View", onClick: toggleView },
  ];

  return (
    <main className={"hv2-page hxr-home hxr-home--" + viewMode + (cardFocused ? " is-focused" : "") + (focusCard ? " has-focus-layer" : "")}>
     <div className="hv2-hero">
        <header className="hxr-header">
          <button type="button" className="hxr-avatar" onClick={() => navigate("/setting")} aria-label="Account settings">
            {account && account.username ? account.username[0].toUpperCase() : "X"}
            <span className="hxr-avatar-mark">x</span>
          </button>
          <button type="button" className="hxr-search" onClick={() => navigate("/services")}>
            <HomeIcon kind="search" /><span>Search</span>
          </button>
          <button type="button" className="hxr-gift" onClick={() => setPicker("rewards")} aria-label="Rewards and vouchers">
            <HomeIcon kind="gift" />
          </button>
        </header>

        <HomeAccountPager
          key={viewMode}
          accounts={accounts}
          mode={viewMode}
          initialAccount={selectedAccount}
          onSelectAccount={selectAccount}
          balanceHidden={balanceHidden}
          onToggleHidden={() => setBalanceHidden(hidden => !hidden)}
          canOpen={canOpen}
          onOpenAccount={() => navigate("/balancecard?open=1")}
          focused={cardFocused}
          sourceHidden={!!focusCard}
          onFocusCard={openCardFocus}
        />

        <div className="hxr-actions">
          {actions.map(action => (
            <button type="button" className="hxr-action" key={action.label} onClick={action.onClick}
              aria-label={action.label === "View" ? (viewMode === "grid" ? "Show single account" : "Show grouped accounts") : action.label}>
              <span className="hxr-action-circle"><HomeIcon kind={action.kind} /></span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <section className="hxr-feed" aria-label="Activity and games">
          <button type="button" className="hxr-activity" onClick={() => navigate("/history")}>
            <span className="hxr-feed-copy">
              <span className="hxr-feed-title">All transactions</span>
              <span className="hxr-feed-caption">Spent in {month} {summary ? hide(accountUsd(summary.totalExpense)) : "…"}</span>
            </span>
            <ActivityArt />
          </button>
          <button type="button" className="hxr-games" onClick={() => setPicker("games")}>
            <span className="hxr-feed-copy">
              <span className="hxr-feed-title">Mini games</span>
              <span className="hxr-feed-caption">Empire, Pixel and more</span>
            </span>
            <span className="hxr-games-art"><HomeIcon kind="games" /></span>
          </button>
        </section>
      </div>
      {focusCard && <HomeCardFocus account={focusCard.account} rect={focusCard.rect} clipBottom={focusCard.clipBottom} onExitStart={() => setFocused(false)} onDone={() => setFocusCard(null)} />}
      {picker === "rewards" && <RewardsPickerModal onClose={() => setPicker(null)} />}
      {picker === "games" && <MiniGamesModal onClose={() => setPicker(null)} />}
    
    </main>
  );
}

export default Home;
