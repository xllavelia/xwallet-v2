import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAccountMotion } from "./HomeCardFocus";
import { useHomeAccounts, accountUsd, getWalletDesign, setWalletDesign } from "./useHomeAccounts";
import { openAccount, topUpCard, withdrawFromCard, selectActiveCard, closeAccount } from "./useBankCards";
import { AccountArt, ACCOUNT_DESIGNS } from "./bankCardVisuals";

function AccountActionIcon({ kind }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "add" && <path d="M12 5v14M5 12h14" />}
    {kind === "wallet" && <><rect x="3" y="5" width="18" height="15" rx="4" /><path d="M3 9h18M17 14h4M7 5V3h10" /></>}
    {kind === "payments" && <><rect x="3" y="4" width="18" height="16" rx="4" /><path d="m8 12 3 3 5-6" /></>}
    {kind === "close" && <><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 10v6M14 10v6" /></>}
  </svg>;
}

function BalanceCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const originRef = useRef(location.state?.accountOrigin);
  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const { phase, exit } = useAccountMotion(pageRef, cardRef, originRef.current);
  const leaving = phase === "closing";
  const [params] = useSearchParams();
  const { accounts, bank, wallet, canOpen } = useHomeAccounts();
  const [panel, setPanel] = useState(params.get("open") === "1" ? "open" : "detail");
  const [name, setName] = useState("");
  const [designId, setDesignId] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [walletDesign, setWalletDesignState] = useState(getWalletDesign);
  const busyRef = useRef(false);
  const closeRef = useRef(false);

  const availableDesigns = ACCOUNT_DESIGNS;
  const chosenDesign = availableDesigns.find(design => design.id === designId) || availableDesigns[0];
  const selectedKey = params.get("open") === "1" ? null : !params.has("account") || params.get("account") === "wallet" ? "wallet" : "account-" + params.get("account");
  const visibleAccounts = bank.isLoading && originRef.current?.accounts ? originRef.current.accounts : accounts;
  const selected = visibleAccounts.find(account => account.key === selectedKey);
  const mainAccounts = visibleAccounts.filter(account => !account.key.startsWith("account-"));
  const spaceAccounts = visibleAccounts.filter(account => account.key.startsWith("account-"));
  const detailDesign = panel === "open" ? chosenDesign : ACCOUNT_DESIGNS[selected?.key === "wallet" ? walletDesign : selected?.designId ?? originRef.current?.account.designId] || ACCOUNT_DESIGNS[0];
  const cashBalance = visibleAccounts.filter(account => account.glass).reduce((sum, account) => sum + Number(account.balance || 0), 0);

  useEffect(() => {
    setPanel(params.get("open") === "1" ? "open" : "detail");
    setConfirmClose(false);
    setAmount("");
    setError("");
  }, [params]);

  async function close() {
    if (busyRef.current || closeRef.current) return;
    closeRef.current = true;
    if (await exit()) {
      navigate("/", { replace: true });
      requestAnimationFrame(() => {
        const source = [...document.querySelectorAll("[data-account-key]")].find(element => element.dataset.accountKey === originRef.current?.key);
        source?.focus({ preventScroll: true });
      });
    }
  }

  useLayoutEffect(() => { cardRef.current.focus({ preventScroll: true }); }, []);

  useLayoutEffect(() => {
    function handleKey(event) { if (event.key === "Escape") { event.preventDefault(); close(); } }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  });

  function show(next) {
    setError(""); setMessage(""); setAmount(""); setConfirmClose(false);
    setPanel(next);
  }

  async function run(action) {
    if (busyRef.current || closeRef.current) return false;
    busyRef.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); return true; }
    catch (err) { setError(err.message); return false; }
    finally { busyRef.current = false; setBusy(false); }
  }

  function submitOpening(event) {
    event.preventDefault();
    run(async () => {
      const trimmed = name.trim();
      if (!trimmed || [...trimmed].length > 32) throw new Error("Enter an account name of 1–32 characters.");
      if (!canOpen || !chosenDesign) throw new Error("You can open up to five additional accounts.");
      const account = await openAccount(trimmed, chosenDesign.id);
      await bank.refresh();
      setName(""); setDesignId(null);
      navigate("/balancecard?account=" + account.id, { replace: true });
      setMessage("Your account is ready.");
    });
  }

  function submitAmount(event) {
    event.preventDefault();
    run(async () => {
      const value = Number(amount);
      if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isFinite(value) || value <= 0) throw new Error("Enter a positive amount with up to two decimal places.");
      if (panel === "deposit") await topUpCard(selected.id, value);
      else await withdrawFromCard(selected.id, value);
      await bank.refresh();
      setAmount(""); setPanel("detail"); setMessage("Balance updated.");
    });
  }

  function activate(account) {
    run(async () => {
      await selectActiveCard(account.primary ? 0 : account.id);
      await bank.refresh(); setMessage("Payment account updated.");
    });
  }

  function chooseWalletDesign(designId) {
    setWalletDesignState(designId);
    setWalletDesign(designId);
  }

  async function submitClose() {
    const closed = await run(async () => {
      await closeAccount(selected.id);
      await bank.refresh();
    });
    if (closed) close();
  }

  function renderRow(account) {
    const isCurrent = account.key === selectedKey;
    const content = <>
      <AccountArt designId={account.designId} className="xac-thumb" compact />
      <span className="xac-row-info"><b>{account.label}</b><small>{account.sub}</small></span>
      <span className="xac-row-end"><b>{account.value}</b>{account.isActive && <small>Payment account</small>}</span>
      {!isCurrent && <span className="xac-chevron">›</span>}
    </>;
    if (isCurrent) {
      return <div className="xac-surface xac-row is-current" key={account.key} aria-current="true">{content}</div>;
    }
    return <button type="button" className="xac-surface xac-row" key={account.key} disabled={busy || phase !== "idle"}
      onClick={() => { setMessage(""); navigate(account.path, { replace: account.glass, state: account.glass ? location.state : null }); }}>{content}</button>;
  }

  return (
    <main ref={pageRef} className={"xac-page is-" + phase} aria-label={panel === "open" ? "Open an account" : (selected?.label || "Account") + " details"}
      style={{
        "--xac-accent": detailDesign.accent,
        "--xac-from": detailDesign.gradient.from,
        "--xac-to": detailDesign.gradient.to,
        "--xac-glow": detailDesign.gradient.glow,
        "--xac-deep": detailDesign.gradient.deep,
      }}>
      <div className="xac-page-bg" aria-hidden="true" />

      <div className="xac-page-scroll">
        <button ref={cardRef} type="button" className="xac-hero-card" onClick={close} disabled={busy || leaving} aria-label="Return to Home">
          <span className="xac-card-turn">
            <span className="xac-card-face"><AccountArt designId={originRef.current?.key && originRef.current.key !== selectedKey ? originRef.current.account.designId : detailDesign.id} className="xac-art" compact={originRef.current?.compact} /></span>
            <span className="xac-card-face xac-card-back"><AccountArt designId={detailDesign.id} className="xac-art" /></span>
          </span>
        </button>
        <div className="xac-body">
        {panel !== "detail" && <button type="button" className="xac-back" onClick={() => panel === "open" ? close() : show("detail")} disabled={busy || leaving}>{panel === "open" ? "Cancel" : "Account"}</button>}
        {error && <p className="xac-error" role="alert">{error}</p>}
        {message && <p className="xac-message" role="status">{message}</p>}
        {bank.isLoading && !selected && <div className="xac-loading" role="status">Loading accounts…</div>}
        {bank.error && <div className="xac-error" role="alert">{bank.error}<button type="button" onClick={bank.refresh}>Try again</button></div>}

        {!bank.isLoading && panel === "open" && <>
          {canOpen && chosenDesign ? <form className="xac-form" onSubmit={submitOpening}>
            <div className="xac-surface xac-summary">
              <span>Your new space</span>
              <strong>{name.trim() || "Unnamed account"}</strong>
              <span>USD account · No opening charge · Starts at $0.00</span>
            </div>
            <label className="xac-field">Account name<input name="accountName" value={name} onChange={event => setName(event.target.value)} placeholder="Travel, Everyday, Future…" maxLength={64} required autoComplete="off" disabled={busy} /></label>
            <fieldset className="xac-designs" disabled={busy}><legend>Choose your design<span className="xac-designs-note">Any design, any number of accounts</span></legend><div>{availableDesigns.map(design => <label className={"xac-design" + (chosenDesign.id === design.id ? " is-selected" : "")} key={design.id} style={{ "--xac-accent": design.accent }}>
              <input type="radio" name="design" value={design.id} checked={chosenDesign.id === design.id} onChange={() => setDesignId(design.id)} />
              <span className="xac-design-art"><AccountArt designId={design.id} className="xac-design-thumb" compact />{chosenDesign.id === design.id}</span>
              <span className="xac-design-name">{design.name}</span>
            </label>)}</div></fieldset>
            <button className="xac-primary" type="submit" disabled={busy || leaving || !name.trim()}>{busy ? "Opening…" : "Open account"}<span>→</span></button>
          </form> : <div className="xac-surface xac-empty">You can open up to five additional accounts.</div>}
        </>}

        {panel === "detail" && selected && <>
          <div className="xac-detail" key={selectedKey}>
            <div className="xac-surface xac-summary">
              <span>Available across cash accounts</span>
              <strong>{accountUsd(cashBalance)}</strong>
              <span>{spaceAccounts.length} / 5 additional accounts</span>
            </div>

            {selected.key === "wallet" && <button type="button" className="xac-secondary xac-wallet-payment" disabled={busy || bank.isLoading || phase !== "idle" || selected.isActive} onClick={() => activate(selected)}><AccountActionIcon kind="payments" />{selected.isActive ? "Selected for payments" : "Use for payments"}</button>}

            {selected.key === "wallet" && <div className="xac-surface xac-card-designs">
              <span className="xac-card-designs-label">Card design</span>
              <div className="xac-card-designs-row">{ACCOUNT_DESIGNS.map(design => (
                <button type="button" key={design.id} className={"xac-card-design" + (walletDesign === design.id ? " is-selected" : "")} style={{ "--xac-accent": design.accent }} disabled={busy || phase !== "idle"} aria-pressed={walletDesign === design.id} aria-label={design.name + " design"} onClick={() => chooseWalletDesign(design.id)}>
                  <AccountArt designId={design.id} className="xac-card-design-thumb" compact />
                </button>
              ))}</div>
            </div>}

            {selected.key !== "wallet" && <>
              <div className="xac-actions">
                <button type="button" className="xac-surface xac-action" disabled={busy || bank.isLoading || phase !== "idle"} onClick={() => show("deposit")}><AccountActionIcon kind="add" /><span><b>Add money</b><small>From Wallet</small></span></button>
                <button type="button" className="xac-surface xac-action" disabled={busy || bank.isLoading || phase !== "idle"} onClick={() => show("withdraw")}><AccountActionIcon kind="wallet" /><span><b>To Wallet</b><small>Move money</small></span></button>
                <button type="button" className="xac-surface xac-action" disabled={busy || bank.isLoading || phase !== "idle" || selected.isActive} onClick={() => activate(selected)}><AccountActionIcon kind="payments" /><span><b>{selected.isActive ? "Selected" : "Use for"}</b><small>Payments</small></span></button>
                <button type="button" className="xac-surface xac-action xac-action--danger" disabled={busy || bank.isLoading || phase !== "idle"} onClick={() => setConfirmClose(true)}><AccountActionIcon kind="close" /><span><b>Close</b><small>This account</small></span></button>
              </div>
              {confirmClose && <div className="xac-surface xac-close-zone">
                <p className="xac-close-note">Closing removes this account forever. Withdraw the balance first.</p>
                <div className="xac-close-row">
                  <button type="button" className="xac-secondary" disabled={busy} onClick={() => setConfirmClose(false)}>Keep it</button>
                  <button type="button" className="xac-danger" disabled={busy} onClick={submitClose}>{busy ? "Closing…" : "Close forever"}</button>
                </div>
              </div>}
            </>}

            <div className="xac-section-heading"><h2>{selected.key === "wallet" ? "Main accounts" : "Your spaces"}</h2><span>{selected.key === "wallet" ? "" : spaceAccounts.length + " / 5"}</span></div>
            <div className="xac-list">
              {(selected.key === "wallet" ? mainAccounts : spaceAccounts).map(renderRow)}
            </div>
          </div>
        </>}
        {!bank.isLoading && panel === "detail" && !selected && !bank.error && <div className="xac-surface xac-empty">This account is not available. Press the card to go back.</div>}

        {!bank.isLoading && ["deposit", "withdraw"].includes(panel) && selected && <>
          <div className="xac-surface xac-summary">
            <span>{selected.label}</span>
            <strong>{selected.value}</strong>
            <span>{selected.primary ? "Main account" : "USD account"}</span>
          </div>
          <form className="xac-form" onSubmit={submitAmount}>
            <label className="xac-field">{panel === "deposit" ? "Move from Wallet" : "Move to Wallet"}<input type="text" inputMode="decimal" name="amount" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} required disabled={busy} autoFocus /></label>
            <p className="xac-form-note">Available {accountUsd(panel === "deposit" ? wallet.balance : selected.balance)}</p>
            <button className="xac-primary" type="submit" disabled={busy || leaving || !amount}>{busy ? "Moving…" : "Move money"}<span>→</span></button>
            <button className="xac-secondary" type="button" disabled={busy} onClick={() => show("detail")}>Cancel</button>
          </form>
        </>}
        </div>
      </div>
    </main>
  );
}

export default BalanceCard;
