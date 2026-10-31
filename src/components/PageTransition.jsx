
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

export default function PageTransition({ children }) {
  const containerRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(container, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        container,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          clearProps: "opacity",
        }
      );
    }, container);

    return () => context.revert();
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="page-shell">
      {children}
    </div>
  );
}
