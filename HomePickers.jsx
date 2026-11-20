import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStatus } from "./AuthStatusContext";
import { Icon } from "./icons";

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
  mine: "/mining",
};

// ===================== ОБЩАЯ КОРЗИНА МОДАЛКИ =====================

function PickerShell(props) {
  const { reducedMotion } = useAuthStatus();
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
    <motion.div className={"hmp-overlay" + (props.games ? " hmp-overlay--games" : "")} onClick={props.onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.24 }}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.975 }}
        transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
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
          <button ref={closeRef} type="button" className="hmp-close" aria-label="Close dialog" onClick={props.onClose}><Icon name="close" size={16} /></button>
        </div>
        {props.children}
      </motion.div>
    </motion.div>
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
          icon={<Icon name="ticket" size={20} />}
          name="Vouchers"
          desc="Active and expired"
          onGo={() => go(REWARDS_ROUTES.vouchers)}
        />
        <Tile
          tone="green"
          icon={<Icon name="gift" size={20} />}
          name="Daily Rewards"
          desc="Claim today's drop"
          onGo={() => go(REWARDS_ROUTES.daily)}
        />
      </div>
      
        <div className="hmp-grid q">
          <Tile
          tone="gold"
          icon={<Icon name="ticket" size={20} />}
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
  const { reducedMotion } = useAuthStatus();
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
      behavior: reducedMotion ? "instant" : "smooth"
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
              <Tile tone="violet" icon={<Icon name="pixel" size={20} />} name="Pixel" desc="Tap & collect" onGo={() => go(GAMES_ROUTES.pixel)} />
              <Tile tone="orange" icon={<Icon name="rocket" size={20} />} name="Rocket" desc="Fly & multiply" onGo={() => go(GAMES_ROUTES.rocket)} />
              <Tile tone="blue" icon={<Icon name="flip" size={20} />} name="Flip" desc="Coin decision" onGo={() => go(GAMES_ROUTES.flip)} />
              <Tile tone="pink" icon={<Icon name="ticket" size={20} />} name="Ticket" desc="Draw & win" onGo={() => go(GAMES_ROUTES.ticket)} />
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
              <Tile tone="pink" icon={<Icon name="empire" size={22} />} name="Empire" desc="Build empire" onGo={() => go(GAMES_ROUTES.empire)} />
              <Tile tone="cyan" icon={<Icon name="slots" size={20} />} name="Slots" desc="Risk and money" onGo={() => go(GAMES_ROUTES.slots)} />
              <Tile tone="cyan" icon={<Icon name="trade" size={20} />} name="Trade" desc="Charts & orders" onGo={() => go(GAMES_ROUTES.trade)} />
              <Tile tone="cyan" icon={<Icon name="mine" size={20} />} name="Mine" desc="Server and power" onGo={() => go(GAMES_ROUTES.mine)} />
            
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