import { useLayoutEffect, useRef, useState } from "react";

const MOTION_MS = 1280;
const EASE = "cubic-bezier(.32,.04,.18,1)";

function namespaceArtwork(root, suffix) {
  const ids = new Map([...root.querySelectorAll("[id]")].map(node => [node.id, node.id + suffix]));
  root.querySelectorAll("*").forEach(node => {
    if (node.id) node.id = ids.get(node.id);
    [...node.attributes].forEach(attribute => {
      const match = attribute.value.match(/^url\(#(.+)\)$/);
      if (match && ids.has(match[1])) node.setAttribute(attribute.name, `url(#${ids.get(match[1])})`);
    });
  });
}

function accountPose(element) {
  const art = element.querySelector(".hxr-account-art");
  const rect = art.getBoundingClientRect();
  const feature = element.closest(".hxr-feature");
  return {
    rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    angle: feature ? 90 : 0,
    clip: feature ? Math.max(0, rect.bottom - feature.getBoundingClientRect().bottom) : 0,
    edge: feature?.getBoundingClientRect().bottom,
  };
}

async function animateAccountView(home, key, change) {
  const find = () => [...home.querySelectorAll("[data-account-key]")].find(element => element.dataset.accountKey === key);
  const source = find();
  if (!source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { change(); return; }
  const from = accountPose(source);
  const front = source.querySelector(".hxr-account-art").cloneNode(true);
  let departure;
  if (!from.angle) {
    const section = home.querySelector(".hxr-accounts");
    const bounds = section.getBoundingClientRect();
    departure = document.createElement("div");
    departure.className = "hxr-grid-departure";
    departure.setAttribute("aria-hidden", "true");
    departure.inert = true;
    const grid = section.cloneNode(true);
    namespaceArtwork(grid, "-departing");
    grid.style.cssText = `position:absolute;left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;margin:0`;
    grid.querySelectorAll("[data-account-key]").forEach(element => {
      if (element.dataset.accountKey === key) element.classList.add("is-card-away");
    });
    departure.append(grid);
    home.append(departure);
    grid.querySelector(".hxr-track").scrollLeft = section.querySelector(".hxr-track").scrollLeft;
  }
  const positions = [...home.querySelectorAll(".hxr-actions, .hxr-feed")].map(element => [element, element.getBoundingClientRect().top]);
  const layer = document.createElement("div");
  layer.className = "hxr-view-flight";
  layer.setAttribute("aria-hidden", "true");
  const card = document.createElement("div");
  card.className = "hxr-view-flight-card";
  const turn = document.createElement("div");
  turn.className = "hxr-view-flight-turn";
  card.append(turn);
  layer.append(card);
  home.classList.add("is-view-moving");
  change();
  const destination = find();
  if (!destination) { departure?.remove(); home.classList.remove("is-view-moving"); return; }
  const to = accountPose(destination);
  const back = destination.querySelector(".hxr-account-art").cloneNode(true);
  [front, back].forEach((art, index) => {
    const face = document.createElement("div");
    face.className = "hxr-view-flight-face" + (index ? " is-back" : "");
    art.style.cssText = "display:block;width:100%;height:100%;visibility:visible;filter:none";
    namespaceArtwork(art, "-flight-" + index);
    face.append(art);
    turn.append(face);
  });
  destination.classList.add("is-card-away");
  document.body.append(layer);
  home.inert = true;
  const options = { duration: 1120, easing: "cubic-bezier(.32,.04,.18,1)", fill: "both" };
  const pose = ({ rect, angle }) => `translate3d(${rect.left + rect.width / 2 - 160}px,${rect.top + rect.height / 2 - 100}px,0) rotate(${angle}deg) scale(${(angle ? rect.height : rect.width) / 320})`;
  // Карта в single-виде повёрнута на 90°, поэтому переворот идёт в обратную сторону — иначе край уезжает не туда.
  const spin = from.angle ? 1 : -1;
  const animations = [
    card.animate([{ transform: pose(from) }, { transform: pose(to) }], options),
    turn.animate([
      { transform: "perspective(1100px) rotateY(0deg) rotateX(0deg)" },
      { transform: `perspective(1100px) rotateY(${95 * spin}deg) rotateX(8deg)`, offset: .5 },
      { transform: `perspective(1100px) rotateY(${180 * spin}deg) rotateX(0deg)` },
    ], options),
  ];
  const edge = from.edge ?? to.edge;
  if (edge != null) {
    layer.style.maskImage = `linear-gradient(to bottom,#000 ${edge - 72}px,rgba(0,0,0,calc(1 - .64 * var(--xac-mask-strength))) ${edge - 31.68}px,rgba(0,0,0,calc(1 - var(--xac-mask-strength))) ${edge}px)`;
    animations.push(layer.animate([
      { "--xac-mask-strength": from.angle ? "1" : "0" },
      { "--xac-mask-strength": "0" },
    ], { duration: options.duration * .3, easing: EASE, fill: "both" }));
    if (to.angle) animations.push(layer.animate([
      { "--xac-mask-strength": "0" },
      { "--xac-mask-strength": "1" },
    ], { delay: options.duration * .65, duration: options.duration * .35, easing: EASE, fill: "forwards" }));
  }
  if (departure) animations.push(departure.animate([
    { transform: "translate3d(0,0,0)" },
    { transform: "translate3d(-100vw,0,0)" },
  ], options));
  if (!to.angle) animations.push(destination.closest(".hxr-accounts").animate([
    { transform: "translate3d(-100vw,0,0)" },
    { transform: "translate3d(0,0,0)" },
  ], options));
  positions.forEach(([element, top]) => animations.push(element.animate([
    { transform: `translateY(${top - element.getBoundingClientRect().top}px)` },
    { transform: "translateY(0)" },
  ], options)));
  try { await Promise.all(animations.map(animation => animation.finished.catch(() => {}))); }
  finally {
    destination.classList.remove("is-card-away");
    home.classList.remove("is-view-moving");
    home.inert = false;
    layer.remove();
    departure?.remove();
    animations.forEach(animation => animation.cancel());
  }
}

function useAccountMotion(pageRef, cardRef, origin) {
  const animations = useRef([]);
  const mounted = useRef(false);
  const closing = useRef(false);
  const [phase, setPhase] = useState("opening");

  function animate(element, frames, options = {}) {
    const animation = element.animate(frames, { duration: MOTION_MS, easing: EASE, fill: "both", ...options });
    animations.current.push(animation);
    return animation.finished.catch(() => {});
  }

  function applySourceMask(card, clip, scale, angle) {
    if (!clip) { card.style.maskImage = "none"; return; }
    const bottom = clip / scale;
    // При повороте +90° нижнему краю экрана соответствует правый край карты.
    card.style.maskImage = `linear-gradient(to ${angle ? "left" : "top"}, rgba(0,0,0,calc(1 - var(--xac-mask-strength))) ${bottom}px, rgba(0,0,0,calc(1 - .64 * var(--xac-mask-strength))) ${bottom + 31.68 / scale}px, #000 ${bottom + 72 / scale}px)`;
  }

  useLayoutEffect(() => {
    mounted.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1 : MOTION_MS;
    const card = cardRef.current;
    const page = pageRef.current;
    const target = card.getBoundingClientRect();
    const source = origin?.rect;
    const dx = source ? source.left + source.width / 2 - target.left - target.width / 2 : 0;
    const dy = source ? source.top + source.height / 2 - target.top - target.height / 2 : 16;
    const angle = origin?.angle || 0;
    const scale = source ? (angle ? source.height : source.width) / target.width : .96;
    const tasks = [
      // Стартовая прозрачность выше нуля: Home уже уходит влево, и при opacity:0 на первые
      // кадры проступал бы чёрный фон — на мобильных это и давало вспышку.
      animate(page.querySelector(".xac-page-bg"), [{ opacity: .5 }, { opacity: 1 }], { duration: reduced ? 1 : 560 }),
      animate(card, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${angle}deg) scale(${scale})` },
        { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
      ], { duration }),
    ];
    if (!reduced) {
      // Направление переворота совпадает с источником: у карты из single-вида оно инвертировано.
      const spin = angle ? -1 : 1;
      tasks.push(animate(card.querySelector(".xac-card-turn"), [
        { transform: "perspective(1100px) rotateY(0deg) rotateX(0deg)" },
        { transform: `perspective(1100px) rotateY(${180 * spin}deg) rotateX(0deg)` },
      ], { duration }));
      applySourceMask(card, origin?.clip, scale, angle);
      // Маска пересчитывается каждый кадр, поэтому держим её активной только первые кадры.
      tasks.push(animate(card, [
        { "--xac-mask-strength": "1" },
        { "--xac-mask-strength": "0" },
      ], { duration: reduced ? 1 : 340 }));
    }
    // Доп-инфо проявляется одним слоем, когда карта уже почти долетела: без послойного полёта и просадок.
    const body = page.querySelector(".xac-body");
    if (body) {
      tasks.push(animate(body, reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { transform: "translate3d(0, 14px, 0)", opacity: 0 },
        { transform: "translate3d(0, 0, 0)", opacity: 1 },
      ], { duration: reduced ? 1 : 560, delay: reduced ? 0 : 300 }));
    }
    Promise.all(tasks).then(() => {
      if (!mounted.current || closing.current) return;
      animations.current.forEach(animation => animation.cancel());
      animations.current = [];
      // Маска нужна только на время полёта: на idle она держит лишний слой и даёт рывки.
      card.style.maskImage = "none";
      setPhase("idle");
    });
    return () => {
      mounted.current = false;
      animations.current.forEach(animation => animation.cancel());
      animations.current = [];
      if (card) card.style.maskImage = "none";
    };
  }, []);

  async function exit() {
    if (closing.current) return false;
    closing.current = true;
    setPhase("closing");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1 : MOTION_MS;
    const page = pageRef.current;
    const card = cardRef.current;
    const turn = card.querySelector(".xac-card-turn");
    const background = page.querySelector(".xac-page-bg");
    const body = page.querySelector(".xac-body");
    const elements = body ? [body] : [];
    // Закрытие может прервать поворот: начинаем с текущего кадра, а не с нулевого.
    const snapshots = [card, turn, background, ...elements].map(element => ({
      element, transform: getComputedStyle(element).transform, opacity: getComputedStyle(element).opacity,
    }));
    const maskStrength = getComputedStyle(card).getPropertyValue("--xac-mask-strength");
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    const target = card.getBoundingClientRect();
    const home = document.querySelector(".hxr-home .hv2-hero");
    const sourceElement = [...document.querySelectorAll("[data-account-key]")].find(element => element.dataset.accountKey === origin?.key);
    let source = null;
    let clip = origin?.clip || 0;
    if (sourceElement && home) {
      const rect = sourceElement.querySelector(".hxr-account-art").getBoundingClientRect();
      const transform = new DOMMatrixReadOnly(getComputedStyle(home).transform);
      source = { left: rect.left - transform.m41, top: rect.top - transform.m42, width: rect.width, height: rect.height };
      const feature = sourceElement.closest(".hxr-feature");
      clip = feature ? Math.max(0, rect.bottom - feature.getBoundingClientRect().bottom) : 0;
    }
    const dx = source ? source.left + source.width / 2 - target.left - target.width / 2 : 0;
    const dy = source ? source.top + source.height / 2 - target.top - target.height / 2 : 20;
    const angle = origin?.angle || 0;
    const scale = source ? (angle ? source.height : source.width) / target.width : .96;
    window.dispatchEvent(new Event("xw-account-return"));
    const tasks = snapshots.map(({ element, transform, opacity }) => {
      if (element === card) return animate(element, reduced ? [{ opacity }, { opacity: 0 }] : [
        { transform, opacity },
        { transform: `translate3d(${dx}px, ${dy}px,0) rotate(${angle}deg) scale(${scale})`, opacity: source ? 1 : 0 },
      ], { duration });
      if (element === turn) return animate(element, reduced ? [{ transform }, { transform }] : [
        { transform },
        { transform: "perspective(1100px) rotateY(0deg) rotateX(0deg)" },
      ], { duration });
      if (element === background) return animate(element, [{ opacity }, { opacity: 0 }], { duration });
      return animate(element, [{ transform, opacity }, { transform: reduced ? "none" : "translate3d(0, 10px, 0)", opacity: 0 }], { duration: reduced ? 1 : 300 });
    });
    if (!reduced) {
      applySourceMask(card, clip, scale, angle);
      tasks.push(animate(card, [
        { "--xac-mask-strength": maskStrength },
        { "--xac-mask-strength": "1" },
      ], { delay: duration * .65, duration: duration * .35 }));
    }
    await Promise.all(tasks);
    return mounted.current;
  }

  return { phase, exit };
}

export { useAccountMotion, accountPose, animateAccountView };
