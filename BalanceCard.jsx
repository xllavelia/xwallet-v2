import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAccountMotion } from "./HomeCardFocus";
import { useHomeAccounts, accountUsd, setMainDesign } from "./useHomeAccounts";
import { openAccount, setCardDesign, chargeCustomDesign, topUpCard, withdrawFromCard, selectActiveCard, closeAccount } from "./useBankCards";
import { usePlayerProfile } from "./usePlayerProfile";
import { useVouchers } from "./useVouchers";
import { AccountArt, BASE_DESIGNS, cardPalette } from "./bankCardVisuals";
import { DesignSheet, CustomSheet } from "./CardDesigner";

function AccountActionIcon({ kind }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "add" && <path d="M12 5v14M5 12h14" />}
    {kind === "wallet" && <><rect x="3" y="5" width="18" height="15" rx="4" /><path d="M3 9h18M17 14h4M7 5V3h10" /></>}
    {kind === "payments" && <><rect x="3" y="4" width="18" height="16" rx="4" /><path d="m8 12 3 3 5-6" /></>}
    {kind === "close" && <><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 10v6M14 10v6" /></>}
    {kind === "palette" && <><path d="M12 3.5a8.5 8.5 0 1 0 0 17h1.6a1.8 1.8 0 0 0 0-3.6h-.8a1.9 1.9 0 0 1 0-3.8H17c3.4 0 3.9-9.6-5-9.6Z" /><circle cx="8" cy="9" r=".8" /><circle cx="11" cy="6.5" r=".8" /><circle cx="14.5" cy="7.5" r=".8" /></>}
  </svg>;
}

function designOf(account) {
  return { designId: account?.designId || 0, designKey: account?.designKey || "", custom: account?.custom || null };
}

// Один выбор перекрывает предыдущий: базовый дизайн, ключ каталога или кастом.
function mainChoice(design) {
  if (design.custom !== undefined) return { designId: 0, designKey: "", custom: design.custom };
  if (design.designKey) return { designId: 0, designKey: design.designKey, custom: null };
  return { designId: Number(design.designId) || 0, designKey: "", custom: null };
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
  const profile = usePlayerProfile();
  const { vouchers, refresh: refreshVouchers } = useVouchers();
  const [panel, setPanel] = useState(params.get("open") === "1" ? "open" : "detail");
  const [name, setName] = useState("");
  const [choice, setChoice] = useState({ designId: 0 });
  const [sheet, setSheet] = useState(null);
  const [buyingId, setBuyingId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [designAccountKey, setDesignAccountKey] = useState(null);
  const busyRef = useRef(false);
  const closeRef = useRef(false);

  const catalog = (profile.data?.catalog || []).filter((item) => item.kind === "card" && (!item.adminOnly || profile.data?.profile?.isAdmin));
  const isAdmin = Boolean(profile.data?.profile?.isAdmin);
  const owner = profile.data?.profile?.username || "xlavelia";
  const lavxBalance = Number(profile.data?.lavxBalance || 0);

  const selectedKey = params.get("open") === "1" ? null : !params.has("account") || params.get("account") === "wallet" ? "wallet" : "account-" + params.get("account");
  const visibleAccounts = bank.isLoading && originRef.current?.accounts ? originRef.current.accounts : accounts;
  const selected = visibleAccounts.find((account) => account.key === selectedKey);
  const mainAccounts = visibleAccounts.filter((account) => !account.key.startsWith("account-"));
  const spaceAccounts = visibleAccounts.filter((account) => account.key.startsWith("account-"));
  const detailDesign = panel === "open" ? choice : designOf(selected || originRef.current?.account);
  const designAccount = visibleAccounts.find(account => account.key === designAccountKey) || selected;
  const editingMain = Boolean(designAccount && !designAccount.key.startsWith("account-"));
  const sheetDesign = panel === "open" ? choice : designOf(designAccount || originRef.current?.account);
  const detailPalette = cardPalette(detailDesign);
  const cashBalance = visibleAccounts.filter((account) => account.glass).reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const isBankCard = Boolean(selected && selected.key.startsWith("account-"));
  const detailName = detailDesign.custom ? "Custom card" : detailDesign.designKey ? (catalog.find((item) => item.id === detailDesign.designKey)?.name || "Card design") : BASE_DESIGNS[detailDesign.designId]?.name || "Cloud";

  useEffect(() => {
    setPanel(params.get("open") === "1" ? "open" : "detail");
    setConfirmClose(false);
    setAmount("");
    setError("");
    setSheet(null);
    setDesignAccountKey(null);
    if (params.get("open") === "1") setChoice({ designId: 0 });
  }, [params]);

  async function close() {
    if (busyRef.current || closeRef.current) return;
    closeRef.current = true;
    if (await exit()) {
      navigate("/", { replace: true });
      requestAnimationFrame(() => {
        const source = [...document.querySelectorAll("[data-account-key]")].find((element) => element.dataset.accountKey === originRef.current?.key);
        source?.focus({ preventScroll: true });
      });
    }
  }

  useLayoutEffect(() => { cardRef.current.focus({ preventScroll: true }); }, []);

  useLayoutEffect(() => {
    function handleKey(event) {
      if (event.key !== "Escape") return;
      if (sheet) { setSheet(null); return; }
      event.preventDefault();
      close();
    }
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
      if (!canOpen) throw new Error("You can open up to five additional accounts.");
      const account = await openAccount(trimmed, choice);
      await bank.refresh();
      profile.refresh();
      setName(""); setChoice({ designId: 0 });
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

  async function submitClose() {
    const closed = await run(async () => {
      await closeAccount(selected.id);
      await bank.refresh();
    });
    if (closed) close();
  }

  // Выбор дизайна: при открытии счёта копим выбор, у существующей карты сразу сохраняем.
  async function applyChoice(next) {
    if (panel === "open") {
      setChoice((prev) => ({ ...prev, ...next }));
      setSheet(null);
      return;
    }
    if (editingMain) {
      setMainDesign(designAccount.key, mainChoice(next));
      setSheet(null);
      setMessage("Card design updated.");
      return;
    }
    await setCardDesign(designAccount.id, next);
    await bank.refresh();
    setSheet(null);
    setMessage("Card design updated.");
  }

  function pickDesign(next) {
    if (panel === "open" || editingMain) { applyChoice(next); return; }
    run(() => applyChoice(next));
  }

  function buyDesign(item) {
    setBuyingId(item.id);
    run(async () => {
      await profile.mutate("/profile/purchase", { cosmeticId: item.id });
      await applyChoice({ designKey: item.id });
      setMessage(item.name + " unlocked.");
    }).finally(() => setBuyingId(""));
  }

  function applyCustom(result) {
    if (panel === "open") {
      setChoice({ custom: result.custom, voucherId: result.voucherId });
      setSheet(null);
      return;
    }
    if (editingMain) {
      run(async () => {
        // У Main нет карточки на сервере: оплачиваем кастом отдельно, оформление храним локально.
        if (!isAdmin || result.voucherId > 0) await chargeCustomDesign(result.voucherId);
        setMainDesign(designAccount.key, mainChoice({ custom: result.custom }));
        await profile.refresh();
        refreshVouchers();
        setSheet(null);
        setMessage("Card design updated.");
      });
      return;
    }
    run(async () => {
      await setCardDesign(designAccount.id, { custom: result.custom, voucherId: result.voucherId });
      await bank.refresh();
      await profile.refresh();
      refreshVouchers();
      setSheet(null);
      setMessage("Card design updated.");
    });
  }

  function showDesign(account = selected) {
    setDesignAccountKey(account?.key || null);
    setSheet("design");
  }

  function renderRow(account) {
    const isCurrent = account.key === selectedKey;
    const art = <AccountArt designId={account.designId} designKey={account.designKey} custom={account.custom} opened={account.opened || account.openedAt} className="xac-thumb" compact />;
    const content = <>
      <span className="xac-row-info"><b>{account.label}</b><small>{account.sub}</small></span>
      <span className="xac-row-end"><b>{account.value}</b>{account.isActive && <small>Payment account</small>}</span>
      {!isCurrent && <span className="xac-chevron">›</span>}
    </>;
    const navigateToAccount = () => { setMessage(""); navigate(account.path, { replace: account.glass, state: account.glass ? location.state : null }); };
    if (selectedKey === "wallet") {
      return <div className={"xac-surface xac-row" + (isCurrent ? " is-current" : "")} key={account.key} aria-current={isCurrent ? "true" : undefined}>
        <button type="button" className="xac-main-design" disabled={busy || phase !== "idle"} onClick={() => showDesign(account)} aria-label={"Customize " + account.label + " card"}>
          {art}<AccountActionIcon kind="palette" />
        </button>
        {isCurrent ? <div className="xac-main-open">{content}</div> : <button type="button" className="xac-main-open" disabled={busy || phase !== "idle"} onClick={navigateToAccount}>{content}</button>}
      </div>;
    }
    if (isCurrent) {
      return <div className="xac-surface xac-row is-current" key={account.key} aria-current="true">{art}{content}</div>;
    }
    return <button type="button" className="xac-surface xac-row" key={account.key} disabled={busy || phase !== "idle"} onClick={navigateToAccount}>{art}{content}</button>;
  }

  return (
    <main ref={pageRef} className={"xac-page is-" + phase} aria-label={panel === "open" ? "Open an account" : (selected?.label || "Account") + " details"}
      style={{ "--xac-accent": detailPalette.left, "--xac-ink": detailPalette.ink }}>
      <div className="xac-page-bg" aria-hidden="true" />

      <div className="xac-page-scroll">
        <button ref={cardRef} type="button" className="xac-hero-card" onClick={close} disabled={busy || leaving} aria-label="Return to Home">
          <span className="xac-card-turn">
            <span className="xac-card-face">
              <AccountArt
                designId={originRef.current?.key && originRef.current.key !== selectedKey ? originRef.current.account.designId : detailDesign.designId}
                designKey={originRef.current?.key && originRef.current.key !== selectedKey ? originRef.current.account.designKey : detailDesign.designKey}
                custom={originRef.current?.key && originRef.current.key !== selectedKey ? originRef.current.account.custom : detailDesign.custom}
                opened={originRef.current?.key && originRef.current.key !== selectedKey ? originRef.current.account.opened || originRef.current.account.openedAt : panel === "open" ? new Date().toISOString() : selected?.opened || selected?.openedAt}
                owner={owner}
                className="xac-art"
                compact={originRef.current?.compact}
              />
            </span>
            <span className="xac-card-face xac-card-back">
              <AccountArt designId={detailDesign.designId} designKey={detailDesign.designKey} custom={detailDesign.custom}
                opened={panel === "open" ? new Date().toISOString() : selected?.opened || selected?.openedAt} owner={owner} className="xac-art" />
            </span>
          </span>
        </button>
        <div className="xac-body">
        {panel !== "detail" && <button type="button" className="xac-back" onClick={() => panel === "open" ? close() : show("detail")} disabled={busy || leaving}>{panel === "open" ? "Cancel" : "Account"}</button>}
        {error && <p className="xac-error" role="alert">{error}</p>}
        {message && <p className="xac-message" role="status">{message}</p>}
        {bank.isLoading && !selected && <div className="xac-loading" role="status">Loading accounts…</div>}
        {bank.error && <div className="xac-error" role="alert">{bank.error}<button type="button" onClick={bank.refresh}>Try again</button></div>}

        {!bank.isLoading && panel === "open" && <>
          {canOpen ? <form className="xac-form" onSubmit={submitOpening}>
            <div className="xac-surface xac-summary">
              <span>Your new space</span>
              <strong>{name.trim() || "Unnamed account"}</strong>
              <span>USD account · No opening charge · Starts at $0.00</span>
            </div>
            <label className="xac-field">Account name<input name="accountName" value={name} onChange={(event) => setName(event.target.value)} placeholder="Travel, Everyday, Future…" maxLength={64} required autoComplete="off" disabled={busy} /></label>

            <div className="xac-surface xac-design-pick">
              <span className="xac-card-designs-label">Card design</span>
              <button type="button" className="xac-design-row" onClick={() => showDesign()} disabled={busy}>
                <span className="xac-design-row-art"><AccountArt designId={choice.designId} designKey={choice.designKey} custom={choice.custom} compact /></span>
                <span className="xac-design-row-copy"><b>{choice.custom ? "Custom card" : choice.designKey ? (catalog.find((item) => item.id === choice.designKey)?.name || "Card design") : BASE_DESIGNS[choice.designId]?.name || "Cloud"}</b><small>Change</small></span>
                <span className="xac-chevron">›</span>
              </button>
            </div>

            <button className="xac-primary" type="submit" disabled={busy || leaving || !name.trim()}>{busy ? "Opening…" : "Open account"}<span></span></button>
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

            {(isBankCard || selected.key === "wallet") && <button type="button" className="xac-surface xac-design-pick" onClick={() => showDesign()} disabled={busy || phase !== "idle"}>
              <span className="xac-design-row-art"><AccountArt designId={detailDesign.designId} designKey={detailDesign.designKey} custom={detailDesign.custom} compact /></span>
              <span className="xac-design-row-copy"><b>{detailName}</b><small>Basic, Battle Pass, cases or your own</small></span>
              <span className="xac-chevron">›</span>
            </button>}

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
            <label className="xac-field">{panel === "deposit" ? "Move from Wallet" : "Move to Wallet"}<input type="text" inputMode="decimal" name="amount" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required disabled={busy} autoFocus /></label>
            <p className="xac-form-note">Available {accountUsd(panel === "deposit" ? wallet.balance : selected.balance)}</p>
            <button className="xac-primary" type="submit" disabled={busy || leaving || !amount}>{busy ? "Moving…" : "Move money"}<span></span></button>
            <button className="xac-secondary" type="button" disabled={busy} onClick={() => show("detail")}>Cancel</button>
          </form>
        </>}
        </div>
      </div>

      {sheet === "design" ? (
        <DesignSheet
          catalog={catalog}
          lavxBalance={lavxBalance}
          isAdmin={isAdmin}
          value={sheetDesign}
          busyId={buyingId}
          onClose={() => setSheet(null)}
          onPick={pickDesign}
          onBuy={buyDesign}
          onCustom={() => setSheet("custom")}
          onNavigate={(path) => navigate(path)}
        />
      ) : null}

      {sheet === "custom" ? (
        <CustomSheet
          initial={sheetDesign}
          isAdmin={isAdmin}
          lavxBalance={lavxBalance}
          vouchers={vouchers}
          busy={busy}
          error={error}
          onClose={() => setSheet(null)}
          onApply={applyCustom}
        />
      ) : null}
    </main>
  );
}

export default BalanceCard;
