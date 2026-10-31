
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
        gsap.set(container, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        container,
        {
          opacity: 0,
          y: 18,
          filter: "blur(5px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
          ease: "power3.out",
          clearProps: "opacity,transform,filter",
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
