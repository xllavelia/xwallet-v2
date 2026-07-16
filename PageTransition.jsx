import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";


function PageTransition({ children }) {
  const navigate = useNavigate();

  const startY = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  const handlePointerDown = (event) => {
    startY.current = event.clientY;
    lastY.current = event.clientY;
    lastTime.current = performance.now();
    velocity.current = 0;

    event.currentTarget.setPointerCapture(event.pointerId);

    setDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragging || closing) return;

    const now = performance.now();
    const deltaY = event.clientY - lastY.current;
    const deltaTime = now - lastTime.current;

    if (deltaTime > 0) {
      velocity.current = deltaY / deltaTime;
    }

    lastY.current = event.clientY;
    lastTime.current = now;

    const distance = event.clientY - startY.current;

    if (distance > 0) {
      const resistance = Math.min(distance * 0.72, 420);

      setOffset(resistance);
    }
  };

  const handlePointerUp = () => {
    if (!dragging || closing) return;

    setDragging(false);

    const shouldClose =
      offset > 110 || velocity.current > 1.1;

const fakeTap = () => {
  const element = document.elementFromPoint(1, 1);

  if (element) {
    element.click();
  }
};

    if (shouldClose) {
      setClosing(true);

      setOffset(window.innerHeight);

      setTimeout(() => {
        navigate(-1);
      }, 420);

      return;
    }

    setOffset(0);
  };

  return (
    <div
      className={`page-transition ${
        dragging ? "page-transition--dragging" : ""
      } ${closing ? "page-transition--closing" : ""}`}
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      <div
        className="page-transition__drag-zone"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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