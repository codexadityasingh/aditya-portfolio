
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeatherTransition() {
  const overlayRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") return;

    const hero = document.querySelector(".hero");
    const overlay = overlayRef.current;

    if (!hero || !overlay) {
      console.warn("FeatherTransition: Hero or overlay not found.");
      return;
    }

    const feather = overlay.querySelector(".falling-feather");
    const bubble = overlay.querySelector(".feather-orb");
    const waves = overlay.querySelectorAll(".bubble-wave");
    const burstWash = overlay.querySelector(".bubble-burst-wash");

    if (!feather || !bubble || waves.length === 0 || !burstWash) {
      console.warn("FeatherTransition: Animation elements missing.");
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      gsap.set(overlay, { autoAlpha: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.set(overlay, { autoAlpha: 1 });

      gsap.set(feather, {
        x: 0,
        y: -window.innerHeight * 0.38,
        rotation: -35,
        scale: 1,
        opacity: 0,
        transformOrigin: "50% 50%",
      });

      gsap.set(bubble, {
        x: 0,
        y: 0,
        scale: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 0,
        transformOrigin: "center",
      });

      gsap.set(waves, {
        scale: 0.02,
        opacity: 0,
        transformOrigin: "center",
      });

      gsap.set(burstWash, {
        scale: 0.02,
        opacity: 0,
        transformOrigin: "center",
      });

      const animation = gsap.timeline({ paused: true });

      // 1. Feather falls into view.
      animation.to(feather, {
        y: -15,
        x: 35,
        rotation: -8,
        opacity: 1,
        duration: 1.1,
        ease: "power1.out",
      });

      // 2. Feather drifts down.
      animation.to(feather, {
        y: 100,
        x: -15,
        rotation: 28,
        duration: 1.3,
        ease: "sine.inOut",
      });

      // 3. Feather contracts.
      animation.to(feather, {
        scale: 0.04,
        rotation: 100,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });

      // 4. Clear bubble forms.
      animation.fromTo(
        bubble,
        { scale: 0.05, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.12"
      );

      // 5. Bubble floats.
      animation.to(bubble, {
        x: 10,
        y: -8,
        rotation: 4,
        duration: 0.65,
        ease: "sine.inOut",
      });

      animation.to(bubble, {
        x: -7,
        y: 5,
        rotation: -3,
        duration: 0.65,
        ease: "sine.inOut",
      });

      // 6. Bubble stretches before bursting.
      animation.to(bubble, {
        scaleX: 1.14,
        scaleY: 0.88,
        duration: 0.18,
        ease: "power2.in",
      });

      // 7. Bubble pops and waves expand.
      animation.to(
        bubble,
        {
          scale: 1.4,
          opacity: 0,
          duration: 0.16,
          ease: "power2.out",
        },
        "<"
      );

      animation.to(
        waves,
        {
          scale: 2.5,
          opacity: (index) => [0.34, 0.23, 0.13][index],
          duration: 1.35,
          stagger: 0.12,
          ease: "power2.out",
        },
        "<"
      );

      animation.to(
        burstWash,
        {
          scale: 2.3,
          opacity: 0.2,
          duration: 1.35,
          ease: "power2.out",
        },
        "<"
      );

      // 8. Waves disappear.
      animation.to(
        waves,
        {
          opacity: 0,
          duration: 0.75,
          ease: "power1.out",
        },
        "-=0.35"
      );

      animation.to(
        burstWash,
        {
          opacity: 0,
          duration: 0.75,
          ease: "power1.out",
        },
        "<"
      );

      // 9. Reveal the next section.
      animation.to(
        overlay,
        {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power1.out",
        },
        "-=0.3"
      );

      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 2.5, 1800)}`,
        pin: hero,
        pinSpacing: true,
        scrub: 0.8,
        animation,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    }, overlay);

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    return () => {
      window.clearTimeout(refreshTimer);
      context.revert();
    };
  }, [location.pathname]);

  return (
    <div
      ref={overlayRef}
      className="feather-transition"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        visibility: "hidden",
      }}
    >
      {/* Feather */}
      <svg
        className="falling-feather"
        viewBox="0 0 120 220"
        style={{
          position: "absolute",
          width: 95,
          height: 145,
          zIndex: 5,
          filter: "drop-shadow(0 5px 15px rgba(255,255,255,.3))",
        }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M60 208C58 166 62 125 65 84C68 43 85 13 107 10C116 9 119 17 113 29C103 50 85 68 65 84"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M65 84C48 67 27 53 13 35C4 24 8 13 18 13C36 13 54 43 65 84Z"
          fill="url(#featherGradient)"
          fillOpacity=".8"
        />
        <path
          d="M65 84C83 62 96 37 113 29C119 26 120 18 113 15C99 9 77 42 65 84Z"
          fill="url(#featherGradient)"
          fillOpacity=".6"
        />
        <path
          d="M60 208C61 159 63 117 65 84"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M65 84L28 43M65 84L43 28M65 84L86 49M65 84L102 35"
          stroke="rgba(255,255,255,.65)"
          strokeWidth="1"
        />
        <defs>
          <linearGradient
            id="featherGradient"
            x1="10"
            y1="10"
            x2="110"
            y2="100"
          >
            <stop stopColor="white" stopOpacity=".9" />
            <stop offset="1" stopColor="#777" stopOpacity=".08" />
          </linearGradient>
        </defs>
      </svg>

      {/* Clear soap bubble */}
      <div
        className="feather-orb"
        style={{
          position: "absolute",
          width: 145,
          height: 145,
          borderRadius: "50%",
          zIndex: 4,
          border: "1px solid rgba(255,255,255,.48)",
          background: `
            radial-gradient(
              ellipse at 30% 22%,
              rgba(255,255,255,.2),
              transparent 35%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(255,255,255,.012),
              transparent 72%
            )
          `,
          boxShadow: `
            inset 0 0 18px rgba(255,255,255,.13),
            inset 0 0 45px rgba(255,255,255,.035),
            0 0 18px rgba(255,255,255,.07)
          `,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 5,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.13)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "13%",
            left: "20%",
            width: "26%",
            height: "9%",
            borderRadius: "50%",
            background: "rgba(255,255,255,.6)",
            filter: "blur(5px)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>

      {/* Expanding transparent waves */}
      {[0, 1, 2].map((index) => (
        <div
          className="bubble-wave"
          key={index}
          style={{
            position: "absolute",
            width: "100vmax",
            height: "100vmax",
            borderRadius: "50%",
            zIndex: 3,
            background: `
              radial-gradient(
                circle,
                transparent 48.5%,
                rgba(255,255,255,.36) 49.2%,
                rgba(255,255,255,.16) 50%,
                rgba(255,255,255,.055) 51.5%,
                transparent 54%
              )
            `,
            filter: "blur(4px)",
          }}
        />
      ))}

      {/* Broad transparent burst wash */}
      <div
        className="bubble-burst-wash"
        style={{
          position: "absolute",
          width: "100vmax",
          height: "100vmax",
          borderRadius: "50%",
          zIndex: 2,
          background: `
            radial-gradient(
              circle,
              transparent 35%,
              rgba(255,255,255,.045) 49%,
              rgba(255,255,255,.10) 50%,
              rgba(255,255,255,.035) 56%,
              transparent 70%
            )
          `,
          filter: "blur(12px)",
        }}
      />
    </div>
  );
}
