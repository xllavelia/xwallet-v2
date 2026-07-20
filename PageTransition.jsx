import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function PageTransition({ children }) {
const navigate = useNavigate();

const dragZoneRef = useRef(null);
const pageRef = useRef(null);

const pointerId = useRef(null);
const dragging = useRef(false);
const closingRef = useRef(false);

const startY = useRef(0);
const lastY = useRef(0);
const lastTime = useRef(0);

const velocity = useRef(0);
const offset = useRef(0);

const animationFrame = useRef(null);
const closeTimeout = useRef(null);

const [closing, setClosing] = useState(false);

const setPageOffset = (value) => {
offset.current = value;

if (pageRef.current) {
  pageRef.current.style.transform = "translate3d(0, " + value + "px, 0)";
}

};

const animateTo = (target, duration, callback) => {
if (animationFrame.current) {
cancelAnimationFrame(animationFrame.current);
}

const start = offset.current;
const distance = target - start;
const startTime = performance.now();

const animate = (currentTime) => {
  const progress = Math.min(
    (currentTime - startTime) / duration,
    1
  );

  const eased = 1 - Math.pow(1 - progress, 4);

  setPageOffset(start + distance * eased);

  if (progress < 1) {
    animationFrame.current = requestAnimationFrame(animate);
  } else if (callback) {
    callback();
  }
};

animationFrame.current = requestAnimationFrame(animate);

};

const getClientY = (event) => {
if (event.touches && event.touches.length > 0) {
return event.touches[0].clientY;
}

return event.clientY;

};

const isInteractiveElement = (target) => {
if (!(target instanceof HTMLElement)) {
return false;
}

return Boolean(
  target.closest(
    "button, a, input, textarea, select, [role='button'], [data-no-swipe]"
  )
);

};

useEffect(() => {
const dragZone = dragZoneRef.current;

if (!dragZone) {
  return undefined;
}

const handleStart = (event) => {
  if (closingRef.current) {
    return;
  }

  if (event.type === "mousedown" && event.button !== 0) {
    return;
  }

  if (isInteractiveElement(event.target)) {
    return;
  }

  const clientY = getClientY(event);

  if (typeof clientY !== "number") {
    return;
  }

  dragging.current = true;

  if (event.pointerId !== undefined) {
    pointerId.current = event.pointerId;
  }

  startY.current = clientY;
  lastY.current = clientY;
  lastTime.current = performance.now();
  velocity.current = 0;

  if (dragZone.setPointerCapture && event.pointerId !== undefined) {
    dragZone.setPointerCapture(event.pointerId);
  }
};

const handleMove = (event) => {
  if (!dragging.current || closingRef.current) {
    return;
  }

  if (
    pointerId.current !== null &&
    event.pointerId !== undefined &&
    event.pointerId !== pointerId.current
  ) {
    return;
  }

  event.preventDefault();

  const clientY = getClientY(event);

  if (typeof clientY !== "number") {
    return;
  }

  const now = performance.now();
  const deltaY = clientY - lastY.current;
  const deltaTime = now - lastTime.current;

  if (deltaTime > 0) {
    const instantVelocity = deltaY / deltaTime;

    velocity.current =
      velocity.current * 0.75 +
      instantVelocity * 0.25;
  }

  lastY.current = clientY;
  lastTime.current = now;

  const distance = clientY - startY.current;

  if (distance <= 0) {
    setPageOffset(0);
    return;
  }

  const resistance =
    distance < 160
      ? distance * 0.78
      : 124.8 + (distance - 160) * 0.35;

  setPageOffset(Math.min(resistance, 420));
};

const handleEnd = (event) => {
  if (!dragging.current || closingRef.current) {
    return;
  }

  if (
    pointerId.current !== null &&
    event.pointerId !== undefined &&
    event.pointerId !== pointerId.current
  ) {
    return;
  }

  dragging.current = false;
  pointerId.current = null;

  const currentOffset = offset.current;
  const currentVelocity = velocity.current;

  const shouldClose =
    currentOffset > 110 ||
    currentVelocity > 1.1;

  if (shouldClose) {
    closingRef.current = true;
    setClosing(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    animateTo(window.innerHeight, 290, () => {
      navigate(-1);
    });

    return;
  }

  animateTo(0, 220);
};

const handleCancel = () => {
  if (!dragging.current || closingRef.current) {
    return;
  }

  dragging.current = false;
  pointerId.current = null;

  animateTo(0, 220);
};

const options = {
  passive: false,
};

dragZone.addEventListener("pointerdown", handleStart, options);
dragZone.addEventListener("pointermove", handleMove, options);
dragZone.addEventListener("pointerup", handleEnd, options);
dragZone.addEventListener("pointercancel", handleCancel, options);

return () => {
  dragZone.removeEventListener("pointerdown", handleStart);
  dragZone.removeEventListener("pointermove", handleMove);
  dragZone.removeEventListener("pointerup", handleEnd);
  dragZone.removeEventListener("pointercancel", handleCancel);

  if (animationFrame.current) {
    cancelAnimationFrame(animationFrame.current);
  }

  if (closeTimeout.current) {
    clearTimeout(closeTimeout.current);
  }
};

}, [navigate]);

return (
<div
ref={pageRef}
className={
"page-transition" +
(closing ? " page-transition--closing" : "")
}
>
<div
ref={dragZoneRef}
className="page-transition__drag-zone"
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