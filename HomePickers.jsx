import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Пути — сверь с App.jsx. Если роут называется иначе, поправь только здесь.
var REWARDS_ROUTES = {
  vouchers: "/bonus",
  daily: "/rewards",
  pass: "/battlepass"

};
var GAMES_ROUTES = {
  empire: "/empire",
  pixel: "/pixel",
  rocket: "/rocket",
  flip: "/flip",
  ticket: "/ticket",
  trade: "/trade",
  slots: "/slots",
  mine: "/mine",
};

// ===================== ИКОНКИ =====================

function GiftIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"></path></svg>);
}
function TicketIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2 2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"></path><path d="M14 7v10" strokeDasharray="2 3"></path></svg>);
}
function EmpireIcon() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="6" x2="9.01" y2="6"></line><line x1="15" y1="6" x2="15.01" y2="6"></line><line x1="9" y1="10" x2="9.01" y2="10"></line><line x1="15" y1="10" x2="15.01" y2="10"></line><path d="M10 22v-4h4v4"></path></svg>);
}
function SlotsIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M8 5v14"></path><path d="M16 5v14"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg>);
}
function PixelIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>);
}
function RocketIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>);
}
function FlipIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>);
}
function TradeIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>);
}
function MineIcon() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M16.001 26.473H16L4.284 12.955L9.5 6h13l5.216 6.955l-3.24 3.737l1.513 1.31l4.295-4.957L23.5 4h-15l-6.784 9.045l12.772 14.737z" /><path fill="#fff" d="m20 19l7 5l-7 5z" /></svg>);
}
function CloseIcon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
}

// ===================== ОБЩАЯ КОРЗИНА МОДАЛКИ =====================

function PickerShell(props) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(props.onClose);
  const titleId = useId();
  const subtitleId = useId();

  useLayoutEffect(() => {
    onCloseRef.current = props.onClose;
  }, [props.onClose]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const focusable = () => Array.from(dialog.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]'
    )).filter((element) => element.tabIndex >= 0 && !element.disabled &&
      !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length);

    closeRef.current.focus({ preventScroll: true });

    function trapFocus(event) {
      if (!dialog.contains(event.target)) {
        (focusable()[0] || dialog).focus({ preventScroll: true });
      }
    }

    function handleKeyDown(event) {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current?.();
      } else if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0] || dialog;
        const last = elements[elements.length - 1] || dialog;
        const current = document.activeElement;
        if (!elements.includes(current) || (event.shiftKey ? current === first : current === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus({ preventScroll: true });
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", trapFocus);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", trapFocus);
      if (previousFocus?.isConnected && typeof previousFocus.focus === "function") {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <div className={"hmp-overlay" + (props.games ? " hmp-overlay--games" : "")} onClick={props.onClose}>
      <div
        ref={dialogRef}
        className={"hmp-card" + (props.games ? " hmp-card--games" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hmp-head">
          <div className="hmp-head-text">
            <span className="hmp-title" id={titleId}>{props.title}</span>
            <span className="hmp-sub" id={subtitleId}>{props.subtitle}</span>
          </div>
          <button ref={closeRef} type="button" className="hmp-close" aria-label="Close dialog" onClick={props.onClose}><CloseIcon /></button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

function Tile(props) {
  return (
    <button type="button" className={"hmp-tile" + (props.hero ? " hero" : "") + (props.tone ? " " + props.tone : "")} onClick={props.onGo}>
      {props.hero && <span className="hmp-shine"></span>}
      <span className="hmp-tile-icon">{props.icon}</span>
      <span className="hmp-tile-name">{props.name}</span>
      <span className="hmp-tile-desc">{props.desc}</span>
      <span className="hmp-tile-cta">{props.cta || "Open"} <span className="hmp-arrow"></span></span>
    </button>
  );
}

// ===================== МОДАЛКА: НАГРАДЫ =====================

export function RewardsPickerModal(props) {
  const navigate = useNavigate();

  function go(path) {
    props.onClose();
    navigate(path);
  }

  return (
    <PickerShell
      title="Rewards"
      subtitle="Pick what to check"
      onClose={props.onClose}
    >

    

      <div className="hmp-grid two">
        <Tile
          tone="gold"
          icon={<TicketIcon />}
          name="Vouchers"
          desc="Active and expired"
          onGo={() => go(REWARDS_ROUTES.vouchers)}
        />
        <Tile
          tone="green"
          icon={<GiftIcon />}
          name="Daily Rewards"
          desc="Claim today's drop"
          onGo={() => go(REWARDS_ROUTES.daily)}
        />
      </div>
      
        <div className="hmp-grid q">
          <Tile
          tone="gold"
          icon={<TicketIcon />}
          name="Battle pass"
          desc="levels, reward and pass"
          onGo={() => go(REWARDS_ROUTES.pass)}
        />
       </div>

    </PickerShell>
  );
}

// ===================== МОДАЛКА: МИНИ-ИГРЫ =====================

export function MiniGamesModal(props) {
  const navigate = useNavigate();
  const viewportRef = useRef(null);
  const firstSlideRef = useRef(null);
  const controlsRef = useRef(null);
  const activePageRef = useRef(0);
  const [activePage, setActivePage] = useState(0);
  const [firstSlideHeight, setFirstSlideHeight] = useState(null);
  const carouselId = useId();

  useLayoutEffect(() => {
    const firstSlide = firstSlideRef.current;
    const viewport = viewportRef.current;
    function measure(entries) {
      // Высоту задаёт только первый слайд вместе с его отступами.
      const boxes = entries?.[0]?.borderBoxSize;
      const box = boxes && (boxes[0] || boxes);
      const height = Math.ceil(box?.blockSize || firstSlide.offsetHeight);
      setFirstSlideHeight((previous) => previous === height ? previous : height);
      viewport.scrollTo({ left: activePageRef.current * viewport.clientWidth, behavior: "instant" });
    }
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(firstSlide, { box: "border-box" });
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  function go(path) {
    props.onClose();
    navigate(path);
  }

  function syncPage() {
    const viewport = viewportRef.current;
    if (!viewport.clientWidth) return;
    const page = Math.max(0, Math.min(1, Math.round(viewport.scrollLeft / viewport.clientWidth)));
    if (page === activePageRef.current) return;
    // Фокус не должен оставаться на слайде, который становится недоступным.
    if (viewport.children[activePageRef.current]?.contains(document.activeElement)) {
      controlsRef.current.querySelector(`[data-page="${page}"]`).focus({ preventScroll: true });
    }
    activePageRef.current = page;
    setActivePage(page);
  }

  function showPage(page) {
    const viewport = viewportRef.current;
    const next = Math.max(0, Math.min(1, page));
    viewport.scrollTo({
      left: next * viewport.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }

  function handleCarouselKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      showPage(activePageRef.current + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  return (
    <PickerShell
      title="Mini Games"
      subtitle="Seven ways to grow the balance"
      onClose={props.onClose}
      games
    >
      <div
        className="hmp-games-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Mini games"
        onKeyDown={handleCarouselKeyDown}
        style={{ "--hmp-first-slide-height": firstSlideHeight === null ? undefined : `${firstSlideHeight}px` }}
      >
        <div className="hmp-games-viewport" id={carouselId} ref={viewportRef} onScroll={syncPage}>
          <div
            className="hmp-games-slide"
            id={`${carouselId}-0`}
            role="group"
            aria-roledescription="slide"
            aria-label="1 of 2"
            aria-hidden={activePage !== 0}
            inert={activePage !== 0}
          >
            <div className="hmp-grid hmp-games-grid" ref={firstSlideRef}>
              <Tile tone="violet" icon={<PixelIcon />} name="Pixel" desc="Tap & collect" onGo={() => go(GAMES_ROUTES.pixel)} />
              <Tile tone="orange" icon={<RocketIcon />} name="Rocket" desc="Fly & multiply" onGo={() => go(GAMES_ROUTES.rocket)} />
              <Tile tone="blue" icon={<FlipIcon />} name="Flip" desc="Coin decision" onGo={() => go(GAMES_ROUTES.flip)} />
              <Tile tone="pink" icon={<TicketIcon />} name="Ticket" desc="Draw & win" onGo={() => go(GAMES_ROUTES.ticket)} />
            </div>
          </div>
          <div
            className="hmp-games-slide"
            id={`${carouselId}-1`}
            role="group"
            aria-roledescription="slide"
            aria-label="2 of 2"
            aria-hidden={activePage !== 1}
            inert={activePage !== 1}
          >
            <div className="hmp-grid hmp-games-grid">
              <Tile tone="pink" icon={<EmpireIcon />} name="Empire" desc="Build empire" onGo={() => go(GAMES_ROUTES.empire)} />
              <Tile tone="cyan" icon={<SlotsIcon />} name="Slots" desc="Risk and money" onGo={() => go(GAMES_ROUTES.slots)} />
              <Tile tone="cyan" icon={<TradeIcon />} name="Trade" desc="Charts & orders" onGo={() => go(GAMES_ROUTES.trade)} />
              <Tile tone="cyan" icon={<MineIcon />} name="Mine" desc="Server and power" onGo={() => go(GAMES_ROUTES.mine)} />
            
            </div>
          </div>
        </div>
        <div className="hmp-games-controls" ref={controlsRef}>
        
          <div className="hmp-games-dots">
            {[0, 1].map((page) => (
              <button key={page} type="button" className="hmp-games-dot" data-page={page} aria-label={`Show games page ${page + 1} of 2`} aria-controls={`${carouselId}-${page}`} aria-current={activePage === page ? "true" : undefined} onClick={() => showPage(page)} />
            ))}
          </div>
        
          <span className="hmp-games-status" role="status" aria-live="polite" aria-atomic="true">Page {activePage + 1} of 2</span>
        </div>
      </div>
    </PickerShell>
  );
}