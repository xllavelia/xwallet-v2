import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect, useCallback } from "react";

// Длительность анимации закрытия — держим в одном месте,
// чтобы JS (setTimeout перед navigate) и CSS (transition) никогда не рассинхронились
const CLOSE_DURATION_MS = 500;

// Порог свайпа для закрытия
const CLOSE_DISTANCE_THRESHOLD = 110;
// Порог скорости (px/ms) — жест засчитывается как "флик"
const CLOSE_VELOCITY_THRESHOLD = 0.5;
// Сопротивление драгу (0..1) — чем меньше, тем "тяжелее" тянется лист
const DRAG_RESISTANCE = 0.72;
const MAX_DRAG_OFFSET = 420;

function PageTransition({ children }) {
  const navigate = useNavigate();

  const dragZoneRef = useRef(null);

  // Вся физика жеста живёт в рефах — не дёргаем рендер на каждый touchmove
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const closingRef = useRef(false);
  const closeTimeoutRef = useRef(null);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  // Чистим отложенный navigate(-1), если компонент размонтируется раньше времени
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = useCallback((event) => {
    if (closingRef.current) return;

    draggingRef.current = true;
    setDragging(true);

    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    startY.current = clientY;
    lastY.current = clientY;
    lastTime.current = performance.now();
    velocity.current = 0;
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (!draggingRef.current || closingRef.current) return;

    // Останавливает нативный скролл/pull-to-refresh браузера во время драга
    event.preventDefault();

    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const now = performance.now();
    const deltaY = clientY - lastY.current;
    const deltaTime = now - lastTime.current;

    // Сглаживаем скорость (экспоненциальное скользящее среднее),
    // чтобы один дрожащий фрейм не решал, закрывать лист или нет
    if (deltaTime > 0) {
      const instantVelocity = deltaY / deltaTime;
      velocity.current = velocity.current * 0.7 + instantVelocity * 0.3;
    }

    lastY.current = clientY;
    lastTime.current = now;

    const distance = clientY - startY.current;

    // Тянуть можно только вниз; на движение вверх лист не реагирует
    const resistedOffset =
      distance > 0 ? Math.min(distance * DRAG_RESISTANCE, MAX_DRAG_OFFSET) : 0;

    offsetRef.current = resistedOffset;
    setOffset(resistedOffset);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current || closingRef.current) return;

    draggingRef.current = false;
    setDragging(false);

    const shouldClose =
      offsetRef.current > CLOSE_DISTANCE_THRESHOLD ||
      velocity.current > CLOSE_VELOCITY_THRESHOLD;

    if (shouldClose) {
      closingRef.current = true;
      setClosing(true);

      // Сбрасываем фокус, чтобы убить :hover/:active до анимации
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      offsetRef.current = window.innerHeight;
      setOffset(window.innerHeight);

      // Таймер совпадает с CLOSE_DURATION_MS в CSS — никакого рывка в конце
      closeTimeoutRef.current = setTimeout(() => {
        navigate(-1);
      }, CLOSE_DURATION_MS);

      return;
    }

    // Свайп был слишком слабым — плавно возвращаем на место
    offsetRef.current = 0;
    setOffset(0);
  }, [navigate]);

  useEffect(() => {
    const dragZone = dragZoneRef.current;
    if (!dragZone) return;

    const options = { passive: false };

    dragZone.addEventListener("touchstart", handleTouchStart, options);
    dragZone.addEventListener("touchmove", handleTouchMove, options);
    dragZone.addEventListener("touchend", handleTouchEnd);
    dragZone.addEventListener("touchcancel", handleTouchEnd);

    dragZone.addEventListener("mousedown", handleTouchStart);
    window.addEventListener("mousemove", handleTouchMove, options);
    window.addEventListener("mouseup", handleTouchEnd);

    return () => {
      dragZone.removeEventListener("touchstart", handleTouchStart);
      dragZone.removeEventListener("touchmove", handleTouchMove);
      dragZone.removeEventListener("touchend", handleTouchEnd);
      dragZone.removeEventListener("touchcancel", handleTouchEnd);

      dragZone.removeEventListener("mousedown", handleTouchStart);
      window.removeEventListener("mousemove", handleTouchMove);
      window.removeEventListener("mouseup", handleTouchEnd);
    };
    // handleTouchStart/Move/End стабильны за счёт useCallback,
    // так что слушатели вешаются один раз и не пересоздаются на каждый рендер
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      className={[
        "page-transition",
        dragging && "page-transition--dragging",
        closing && "page-transition--closing",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        transform: `translateY(${offset}px)`,
        // Пропускаем клики сквозь лист во время анимации закрытия
        pointerEvents: closing ? "none" : undefined,
      }}
    >
      <div
        className="page-transition__drag-zone"
        ref={dragZoneRef}
        style={{ touchAction: "none" }}
      >
        <div className="page-transition__handle" />
      </div>

      <div className="page-transition__content">{children}</div>
    </div>
  );
}

export default PageTransition;