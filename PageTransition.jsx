import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

function PageTransition({ children }) {
  const navigate = useNavigate();
  
  // Реф для зоны свайпа, чтобы повесить нативные слушатели
  const dragZoneRef = useRef(null);

  // Храним всю физику в рефах, чтобы не дергать рендер React лишний раз
  const startY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const offsetRef = useRef(0); 

  const [offset, setOffset] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dragZone = dragZoneRef.current;
    if (!dragZone) return;

    let dragging = false;

    const handleTouchStart = (event) => {
      if (closing) return;
      
      dragging = true;
      // Поддерживаем и мышь, и пальцы
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      
      startY.current = clientY;
      lastY.current = clientY;
      lastTime.current = performance.now();
      velocity.current = 0;
    };

    const handleTouchMove = (event) => {
      if (!dragging || closing) return;

      // КРИТИЧЕСКИ ВАЖНО: Останавливает нативный скролл браузера. 
      // Браузер больше не будет "глотать" клики после уничтожения компонента.
      event.preventDefault();

      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const now = performance.now();
      const deltaY = clientY - lastY.current;
      const deltaTime = now - lastTime.current;

      if (deltaTime > 0) {
        velocity.current = deltaY / deltaTime;
      }

      lastY.current = clientY;
      lastTime.current = now;

      const distance = clientY - startY.current;

      if (distance > 0) {
        const resistance = Math.min(distance * 0.72, 420);
        offsetRef.current = resistance;
        setOffset(resistance);
      }
    };

    const handleTouchEnd = () => {
      if (!dragging || closing) return;
      dragging = false;

      const shouldClose = offsetRef.current > 110 || velocity.current > 1.1;

      if (shouldClose) {
        setClosing(true);
        
        // Сбрасываем фокус, чтобы убить :hover и :active состояния
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        offsetRef.current = window.innerHeight;
        setOffset(window.innerHeight);

        setTimeout(() => {
          navigate(-1);
        }, 260);
        
        return;
      }

      // Возврат на место, если свайп был слишком слабым
      offsetRef.current = 0;
      setOffset(0);
    };

    // Вешаем слушатели с { passive: false }, чтобы preventDefault работал
    const options = { passive: false };
    
    // Сенсорные события (мобилки)
    dragZone.addEventListener("touchstart", handleTouchStart, options);
    dragZone.addEventListener("touchmove", handleTouchMove, options);
    dragZone.addEventListener("touchend", handleTouchEnd);
    dragZone.addEventListener("touchcancel", handleTouchEnd);
    
    // События мыши (десктоп/тесты)
    dragZone.addEventListener("mousedown", handleTouchStart, options);
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
  }, [closing, navigate]);

  return (
    <div
      className={`page-transition ${closing ? "page-transition--closing" : ""}`}
      style={{
        transform: `translateY(${offset}px)`,
        // Пропускаем клики сквозь остров во время 420мс анимации закрытия
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

      <div className="page-transition__content">
        {children}
      </div>
    </div>
  );
}

export default PageTransition;