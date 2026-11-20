import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useAuthStatus } from "./AuthStatusContext";
import { accountPose, animateAccountView } from "./HomeCardFocus";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "./useAccount";
import { usePlayerProfile } from "./usePlayerProfile";
import { ProfileAvatar } from "./ProfileShared";
import { useHomeSummary } from "./useHomeSummary";
import { useHomeAccounts, accountUsd } from "./useHomeAccounts";
import { HomeAccountPager } from "./HomeAccounts";
import { RewardsPickerModal, MiniGamesModal } from "./HomePickers";
import { Icon } from "./icons";

// git add .
// git commit -m "new animation"
// git push -u origin main 


// git commit -m "fix"

// git add .
// git commit --amend --no-edit
// git push --force-with-lease

// git reset --soft HEAD~1
// git add .
// git commit --amend --no-edit

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
  const location = useLocation();
  const { reducedMotion } = useAuthStatus();
  const { account } = useAccount();
  const { data: player } = usePlayerProfile();
  const summary = useHomeSummary();
  const [picker, setPicker] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("xw-home-view") === "single" ? "single" : "grid");
  const [balanceHidden, setBalanceHidden] = useState(() => localStorage.getItem("xw-hide-balances") === "1");
  const [selectedAccount, setSelectedAccount] = useState(() => localStorage.getItem("xw-home-account") || "wallet");
  const [returning, setReturning] = useState(false);
  const accountOpen = location.pathname === "/balancecard";
  const { accounts, canOpen } = useHomeAccounts(balanceHidden);
  const hide = value => balanceHidden ? "••••" : value;

  useEffect(() => {
    const restore = () => setReturning(true);
    window.addEventListener("xw-account-return", restore);
    return () => window.removeEventListener("xw-account-return", restore);
  }, []);

  useEffect(() => { setReturning(false); }, [location.key]);

  useEffect(() => {
    const update = () => {
      setBalanceHidden(localStorage.getItem("xw-hide-balances") === "1");
    };
    update();
    window.addEventListener("xw-preferences-changed", update);
    return () => window.removeEventListener("xw-preferences-changed", update);
  }, []);

  const homeRef = useRef(null);
  const viewBusy = useRef(false);

  async function toggleView() {
    if (viewBusy.current || accountOpen) return;
    viewBusy.current = true;
    const next = viewMode === "grid" ? "single" : "grid";
    const track = homeRef.current.querySelector(".hxr-track");
    const bounds = track.getBoundingClientRect();
    const visible = [...track.querySelectorAll("[data-account-key]")].filter(element => {
      const rect = element.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      return center >= bounds.left && center <= bounds.right;
    });
    const key = visible.find(element => element.dataset.accountKey === selectedAccount)?.dataset.accountKey || visible[0]?.dataset.accountKey || "wallet";
    localStorage.setItem("xw-home-view", next);
    localStorage.setItem("xw-home-account", key);
    try {
      await animateAccountView(homeRef.current, key, () => flushSync(() => {
        setSelectedAccount(key);
        setViewMode(next);
      }), reducedMotion);
    } finally { viewBusy.current = false; }
  }

  function openAccountDetail(account, element) {
    if (accountOpen || viewBusy.current) return;
    navigate(account.path, { state: { accountOrigin: {
      key: account.key, account, accounts, compact: viewMode === "grid", ...accountPose(element),
    } } });
  }

  function openNewAccount() {
    navigate("/balancecard?open=1");
  }

  function selectAccount(key) {
    localStorage.setItem("xw-home-account", key);
    setSelectedAccount(key);
  }
  const month = new Date().toLocaleDateString("en-US", { month: "long" });
  const actions = [
    { kind: "create", label: "Create", onClick: openNewAccount },
    { kind: "nft", label: "NFT", onClick: () => navigate("/nft") },
    { kind: "send", label: "Send", onClick: () => navigate("/send") },
    { kind: viewMode === "grid" ? "expand" : "grid", label: "View", onClick: toggleView },
  ];

  return (
    <main ref={homeRef} className={"hv2-page hxr-home hxr-home--" + viewMode + (accountOpen && !returning ? " is-account-open" : "")} inert={accountOpen} aria-hidden={accountOpen || undefined}>
     <div className="hv2-hero">
        <header className="hxr-header">
          <button type="button" className="hxr-avatar" onClick={() => navigate("/profile")} aria-label="My profile">
            <ProfileAvatar profile={player?.profile || account} />
            {/* <span className="hxr-avatar-mark">x</span> */}
          </button>
          <button type="button" className="hxr-search" onClick={() => navigate("/services")}>
            <Icon name="search" /><span>Search</span>
          </button>
          <button type="button" className="hxr-gift" onClick={() => setPicker("rewards")} aria-label="Rewards and vouchers">
            <Icon name="gift" />
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
          onOpenAccount={openNewAccount}
          onOpenDetail={openAccountDetail}
          leaving={accountOpen}
          hiddenCardKey={accountOpen ? location.state?.accountOrigin?.key : null}
        />

        <div className="hxr-actions">
          {actions.map(action => (
            <button type="button" className="hxr-action" key={action.label} onClick={action.onClick}
              aria-label={action.label === "View" ? (viewMode === "grid" ? "Show single account" : "Show grouped accounts") : action.label}>
              <span className="hxr-action-circle"><Icon name={action.kind} /></span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        <section className="hxr-feed" aria-label="Activity and games">
          <button type="button" className="hxr-activity" onClick={() => navigate("/history")}>
            <span className="hxr-feed-copy">
              <span className="hxr-feed-title">Transaction</span>
              <span className="hxr-feed-caption">Spent in {month} {summary ? hide(accountUsd(summary.totalExpense)) : "…"}</span>
            </span>
            <ActivityArt />
          </button>
          <button type="button" className="hxr-games" onClick={() => setPicker("games")}>
            <span className="hxr-feed-copy">
              <span className="hxr-feed-title">Mini games</span>
              <span className="hxr-feed-caption">Empire, Pixel and more</span>
            </span>
            <span className="hxr-games-art"><Icon name="games" /></span>
          </button>
        </section>
      </div>
      <AnimatePresence mode="wait">
        {picker === "rewards" && <RewardsPickerModal key="rewards" onClose={() => setPicker(null)} />}
        {picker === "games" && <MiniGamesModal key="games" onClose={() => setPicker(null)} />}
      </AnimatePresence>
    
    </main>
  );
}

export default Home;
