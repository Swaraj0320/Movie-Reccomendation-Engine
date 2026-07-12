import { useEffect, useRef, useState } from "react";

function CursorGlow() {
  const glowRef = useRef(null);
  const frameRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateCapability = () => setEnabled(mediaQuery.matches);
    updateCapability();
    mediaQuery.addEventListener("change", updateCapability);
    return () => mediaQuery.removeEventListener("change", updateCapability);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const updateGlow = (event) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          const { x, y } = positionRef.current;
          glowRef.current.style.transform = `translate3d(${x - 190}px, ${y - 190}px, 0)`;
        }
        frameRef.current = null;
      });
    };

    window.addEventListener("mousemove", updateGlow, { passive: true });
    return () => {
      window.removeEventListener("mousemove", updateGlow);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={glowRef} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0 h-[380px] w-[380px] rounded-full opacity-[0.13] blur-2xl" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.16) 28%, transparent 70%)" }} />;
}

export default CursorGlow;
