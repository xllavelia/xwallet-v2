import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountArt } from "./bankCardVisuals";

function HomeAccountPager({ accounts, mode, initialAccount, onSelectAccount, balanceHidden, onToggleHidden, canOpen, onOpenAccount, onOpenDetail, leaving, hiddenCardKey }) {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const single = mode === "single";
  const entries = [...accounts, ...(canOpen ? [{ key: "add", label: "Open account" }] : [])];
  const pages = single ? entries.map(account => [account]) : Array.from({ length: Math.ceil(entries.length / 4) }, (_, i) => entries.slice(i * 4, i * 4 + 4));
  const accountIndex = Math.max(0, entries.findIndex(account => account.key === initialAccount));
  const initialIndex = single ? accountIndex : Math.floor(accountIndex / 4);
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);

  useLayoutEffect(() => {
    const track = trackRef.current;
    indexRef.current = initialIndex;
    setIndex(initialIndex);
    track.scrollLeft = initialIndex * track.clientWidth;
    const observer = new ResizeObserver(() => { track.scrollLeft = indexRef.current * track.clientWidth; });
    observer.observe(track);
    return () => observer.disconnect();
  }, [entries.length]);

  function handleScroll() {
    const track = trackRef.current;
    if (!track.clientWidth) return;
    const next = Math.max(0, Math.min(pages.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    indexRef.current = next;
    setIndex(next);
    if (single && entries[next].key !== "add") onSelectAccount(entries[next].key);
  }

  function openAccount(account, element) {
    if (leaving) return;
    if (account.glass) onOpenDetail(account, element);
    else navigate(account.path);
  }

  const pagination = (
    <div className="hxr-pagination">
      <button type="button" className="hxr-visibility" onClick={onToggleHidden} aria-label={balanceHidden ? "Show balances" : "Hide balances"}>
        {balanceHidden ? "Show" : "Hide"}
      </button>
      <div className="hxr-dots" aria-label={single ? "Accounts" : "Account pages"}>
        {pages.map((_, i) => <button type="button" key={i} className={"hxr-dot" + (index === i ? " is-active" : "")} aria-label={"Account page " + (i + 1)} aria-current={index === i ? "true" : undefined}
          onClick={() => trackRef.current.scrollTo({ left: i * trackRef.current.clientWidth, behavior: "smooth" })} />)}
      </div>
      <span />
    </div>
  );

  return (
    <section className={"hxr-accounts hxr-accounts--" + mode} aria-label="Accounts">
      {single && pagination}
      <div className="hxr-track" ref={trackRef} onScroll={handleScroll}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className={single ? "hxr-single-page" : "hxr-group-page"}>
            {page.map(account => account.key === "add" ? (
              <button type="button" key="add" className={single ? "hxr-feature hxr-feature--add" : "hxr-account hxr-account--add"} onClick={onOpenAccount}>
                <span className="hxr-add-symbol">+</span><span className="hxr-account-label">Open account</span><span className="hxr-add-caption">Make room for a new goal</span>
              </button>
            ) : single ? (
              <button type="button" key={account.key} data-account-key={account.key} className={"hxr-feature" + (hiddenCardKey === account.key ? " is-card-away" : "")} onClick={event => openAccount(account, event.currentTarget)}>
                <div className="hxr-feature-balance">
                  <span className="hxr-feature-balance-inner">
                    {account.badge && <span className="hxr-feature-badge">{account.badge}</span>}
                    <span className="hxr-feature-value">{account.value}</span><span className="hxr-feature-label">{account.label} · {account.sub}</span>
                  </span>
                </div>
                <span className="hxr-feature-card" aria-hidden="true"><AccountArt designId={account.designId} /></span>
              </button>
            ) : (
              <button type="button" key={account.key} data-account-key={account.key} className={"hxr-account" + (hiddenCardKey === account.key ? " is-card-away" : "")} onClick={event => openAccount(account, event.currentTarget)}>
                <span className="hxr-account-top"><AccountArt designId={account.designId} compact />{account.badge && <span className="hxr-account-badge">{account.badge}</span>}</span>
                <span className="hxr-account-value">{account.value}</span><span className="hxr-account-label">{account.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {!single && pagination}
    </section>
  );
}

export { HomeAccountPager };
