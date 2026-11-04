import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHomeAccounts, accountUsd } from "./useHomeAccounts";
import { openAccount, topUpCard, withdrawFromCard, selectActiveCard, closeAccount } from "./useBankCards";
import { AccountArt, ACCOUNT_DESIGNS } from "./bankCardVisuals";

function BalanceCard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { accounts, extras, bank, wallet, canOpen } = useHomeAccounts();
  const [panel, setPanel] = useState(params.get("open") === "1" ? "open" : params.has("account") ? "detail" : "list");
  const [selectedKey, setSelectedKey] = useState(params.get("account") === "wallet" ? "wallet" : "account-" + params.get("account"));
  const [name, setName] = useState("");
  const [designId, setDesignId] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const dialogRef = useRef(null);
  const busyRef = useRef(false);
  const availableDesigns = ACCOUNT_DESIGNS.slice(5).filter(design => !extras.some(account => account.designId === design.id));
  const chosenDesign = availableDesigns.find(design => design.id === designId) || availableDesigns[0];
  const selected = accounts.find(account => account.key === selectedKey);
  const cashBalance = Number(wallet.balance || 0) + extras.reduce((sum, account) => sum + account.balance, 0);

  function close() { if (!busyRef.current) navigate("/", { replace: true }); }

  useEffect(() => {
    const previous = document.activeElement;
    const home = document.querySelector(".hxr-home");
    const oldOverflow = home?.style.overflow;
    const wasInert = home?.inert;
    if (home) { home.style.overflow = "hidden"; home.inert = true; }
    dialogRef.current.focus();
    function handleKey(event) {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "Tab") {
        const elements = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter(element => element.getClientRects().length);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); dialogRef.current.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (home) { home.style.overflow = oldOverflow; home.inert = wasInert; }
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [navigate]);

  function show(next, account) {
    setError(""); setMessage(""); setAmount(""); setConfirmClose(false);
    if (account) setSelectedKey(account.key);
    setPanel(next);
  }

  async function run(action) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); }
    catch (err) { setError(err.message); }
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
      setName(""); setDesignId(null); setSelectedKey("account-" + account.id); setPanel("detail");
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

  function submitClose() {
    run(async () => {
      await closeAccount(selected.id);
      await bank.refresh();
      setConfirmClose(false);
      setPanel("list");
      setMessage("Account closed.");
    });
  }

  return createPortal(
    <div className="xac-overlay" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="xac-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="xac-title">
        <header className="xac-header">
          <div><span className="xac-eyebrow">YOUR MONEY, YOUR SPACE</span><h1 id="xac-title">{panel === "open" ? "Open an account" : "Accounts"}</h1></div>
          <button type="button" className="xac-close" onClick={close} disabled={busy} aria-label="Close accounts">×</button>
        </header>
        {panel !== "list" && <button type="button" className="xac-back" onClick={() => show("list")} disabled={busy}>All accounts</button>}
        {error && <p className="xac-error" role="alert">{error}</p>}
        {message && <p className="xac-message" role="status">{message}</p>}
        {bank.isLoading && <div className="xac-loading" role="status">Loading accounts…</div>}
        {bank.error && <div className="xac-error" role="alert">{bank.error}<button type="button" onClick={bank.refresh}>Try again</button></div>}

        {!bank.isLoading && panel === "list" && <>
          <div className="xac-summary"><span>Available across cash accounts</span><strong>{accountUsd(cashBalance)}</strong><span>{extras.length} / 5 additional accounts</span></div>
          <div className="xac-section-heading"><h2>Main accounts</h2><span>Always with you</span></div>
          <div className="xac-list">
            {accounts.slice(0, 5).map(account => <button type="button" className="xac-row" key={account.key} onClick={() => account.primary ? show("detail", account) : navigate(account.path, { replace: true })}>
              <AccountArt designId={account.designId} className="xac-thumb" /><span className="xac-row-info"><b>{account.label}</b><small>{account.sub}</small></span><span className="xac-row-end"><b>{account.value}</b>{account.isActive && <small>Payment account</small>}</span><span className="xac-chevron">›</span>
            </button>)}
          </div>
          <div className="xac-section-heading"><h2>Your spaces</h2><span>{extras.length} / 5</span></div>
          <div className="xac-list">
            {accounts.slice(5).map(account => <button type="button" className="xac-row" key={account.key} onClick={() => show("detail", account)}>
              <AccountArt designId={account.designId} className="xac-thumb" /><span className="xac-row-info"><b>{account.label}</b><small>{account.sub}</small></span><span className="xac-row-end"><b>{account.value}</b>{account.isActive && <small>Payment account</small>}</span><span className="xac-chevron">›</span>
            </button>)}
            {!extras.length && <p className="xac-empty">A separate space for travel, plans or everyday spending.</p>}
          </div>
          <button type="button" className="xac-open-tile" disabled={!canOpen} onClick={() => show("open")}><span>+</span><div><b>{canOpen ? "Open a new account" : "All five spaces are open"}</b><small>{canOpen ? "A name, a design. That is all." : "Your accounts are ready to use."}</small></div></button>
        </>}

        {!bank.isLoading && panel === "open" && <>
          {canOpen && chosenDesign ? <form className="xac-form" onSubmit={submitOpening}>
            <div className="xac-preview"><AccountArt designId={chosenDesign.id} className="xac-art" /><div className="xac-preview-copy"><span>{name.trim() || "Your next account"}</span><strong>$0.00</strong></div></div>
            <label className="xac-field">Account name<input name="accountName" value={name} onChange={event => setName(event.target.value)} placeholder="Travel, Everyday, Future…" maxLength={64} required autoComplete="off" disabled={busy} /></label>
            <fieldset className="xac-designs" disabled={busy}><legend>Choose your design</legend><div>{availableDesigns.map(design => <label className={"xac-design" + (chosenDesign.id === design.id ? " is-selected" : "")} key={design.id}>
              <input type="radio" name="design" value={design.id} checked={chosenDesign.id === design.id} onChange={() => setDesignId(design.id)} /><AccountArt designId={design.id} className="xac-design-thumb" /><span>{design.name}</span>
            </label>)}</div></fieldset>
            <div className="xac-form-note"><span>USD account · No opening charge</span><span>Starts at $0.00. Move money from Wallet whenever you need.</span></div>
            <button className="xac-primary" type="submit" disabled={busy || !name.trim()}>{busy ? "Opening…" : "Open account"}<span></span></button>
          </form> : <div className="xac-empty">You can open up to five additional accounts.</div>}
        </>}

        {!bank.isLoading && ["detail", "deposit", "withdraw"].includes(panel) && selected && <>
          <div className="xac-preview"><AccountArt designId={selected.designId} className="xac-art" /><div className="xac-preview-copy"><span>{selected.label}</span><strong>{selected.value}</strong></div></div>
          <div className="xac-detail-meta"><span>{selected.primary ? "Main account" : "USD account"}</span>{selected.number && <span>{selected.number.replace(/(.{4})/g, "$1 ").trim()}</span>}{selected.isActive && <span className="xac-active">Payment account</span>}</div>
          {panel === "detail" ? <>
            {!selected.primary && <div className="xac-actions"><button type="button" disabled={busy} onClick={() => show("deposit")}> Add money</button><button type="button" disabled={busy} onClick={() => show("withdraw")}> To Wallet</button></div>}
            <button type="button" className="xac-primary" disabled={busy} onClick={() => run(async () => { await selectActiveCard(selected.primary ? 0 : selected.id); navigate("/send", { replace: true }); })}>Send money<span></span></button>
            <button type="button" className="xac-secondary" disabled={busy || selected.isActive} onClick={() => activate(selected)}>{selected.isActive ? "Selected for payments" : "Use for payments"}</button>
            {!selected.primary && <div className="xac-close-zone">
              {confirmClose ? <>
                <p className="xac-close-note">Closing removes this account forever. Withdraw the balance first.</p>
                <div className="xac-close-row">
                  <button type="button" className="xac-secondary" disabled={busy} onClick={() => setConfirmClose(false)}>Keep it</button>
                  <button type="button" className="xac-danger" disabled={busy} onClick={submitClose}>{busy ? "Closing…" : "Close forever"}</button>
                </div>
              </> : <button type="button" className="xac-close-link" disabled={busy} onClick={() => setConfirmClose(true)}>Close account</button>}
            </div>}
          </> : <form className="xac-form" onSubmit={submitAmount}>
            <label className="xac-field">{panel === "deposit" ? "Move from Wallet" : "Move to Wallet"}<input type="text" inputMode="decimal" name="amount" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} required disabled={busy} autoFocus /></label>
            <p className="xac-form-note">Available {accountUsd(panel === "deposit" ? wallet.balance : selected.balance)}</p>
            <button className="xac-primary" type="submit" disabled={busy || !amount}>{busy ? "Moving…" : "Move money"}<span></span></button>
            <button className="xac-secondary" type="button" disabled={busy} onClick={() => show("detail")}>Cancel</button>
          </form>}
        </>}
        {!bank.isLoading && panel === "detail" && !selected && !bank.error && <div className="xac-empty">This account is not available. Choose an account from the list.</div>}
      </section>
    </div>, document.body
  );
}

export default BalanceCard;
