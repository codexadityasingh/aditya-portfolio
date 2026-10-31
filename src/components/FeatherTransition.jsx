
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeatherTransition() {
  const overlayRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname !== "/") return;

    const hero = document.querySelector(".hero");
    const overlay = overlayRef.current;

    if (!hero || !overlay) return;

    const feather = overlay.querySelector(".falling-feather");
    const bubble = overlay.querySelector(".feather-orb");
    const waves = overlay.querySelectorAll(".bubble-wave");
    const wash = overlay.querySelector(".bubble-burst-wash");

    if (!feather || !bubble || waves.length !== 3 || !wash) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      gsap.set(overlay, { autoAlpha: 0 });
      return;
    }

    const context = gsap.context(() => {
      const mobile = window.matchMedia("(max-width: 700px)").matches;
      const height = window.innerHeight;

      const featherStart = mobile
        ? -height * 0.30
        : -height * 0.38;

      gsap.set(overlay, { autoAlpha: 1 });

      // Initial feather position
      gsap.set(feather, {
        x: 0,
        y: featherStart,
        rotation: -24,
        scale: 0.9,
        opacity: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      });

      // Initial bubble position
      gsap.set(bubble, {
        x: 0,
        y: 0,
        scale: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 0,
        transformOrigin: "center",
        force3D: true,
      });

      // Initial shockwave positions
      gsap.set(waves, {
        scale: 0.05,
        opacity: 0,
        transformOrigin: "center",
        force3D: true,
      });

      gsap.set(wash, {
        scale: 0.05,
        opacity: 0,
        transformOrigin: "center",
        force3D: true,
      });

      const animation = gsap.timeline({ paused: true });

      /*
       * 1. FEATHER FALL
       */

      animation.to(feather, {
        opacity: 1,
        duration: 0.35,
        ease: "power1.out",
      });

      animation.to(feather, {
        keyframes: [
          {
            x: mobile ? 8 : 22,
            y: featherStart * 0.55,
            rotation: -13,
            scale: 0.96,
            duration: 0.9,
          },
          {
            x: mobile ? -7 : -18,
            y: featherStart * 0.16,
            rotation: 5,
            scale: 1,
            duration: 0.9,
          },
          {
            x: mobile ? 9 : 25,
            y: height * 0.04,
            rotation: -9,
            scale: 0.98,
            duration: 0.85,
          },
          {
            x: mobile ? 0 : -8,
            y: height * 0.12,
            rotation: 3,
            scale: 0.92,
            duration: 0.65,
          },
        ],
        ease: "none",
      });

      // Feather disappears
      animation.to(feather, {
        scale: 0.08,
        rotation: 28,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });

      /*
       * 2. BUBBLE FORMATION
       */

      animation.fromTo(
        bubble,
        {
          scale: 0.72,
          scaleX: 0.82,
          scaleY: 1.12,
          rotation: -12,
          opacity: 0,
        },
        {
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
        },
        "-=0.08"
      );

      /*
       * 3. NATURAL FLOATING
       */

      animation.to(bubble, {
        keyframes: [
          {
            x: 3,
            y: -5,
            rotation: 1.5,
            scaleX: 1.015,
            scaleY: 0.99,
            duration: 0.75,
          },
          {
            x: -3,
            y: -9,
            rotation: -1,
            scaleX: 0.99,
            scaleY: 1.015,
            duration: 0.9,
          },
          {
            x: 0,
            y: -4,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.75,
          },
        ],
        ease: "sine.inOut",
      });

      /*
       * 4. BUILD BURST TENSION
       */

      animation.to(bubble, {
        scaleX: 0.91,
        scaleY: 1.08,
        rotation: -2,
        duration: 0.16,
        ease: "power3.in",
      });

      /*
       * 5. THE POP
       *
       * Bubble snaps outward and disappears.
       */

      animation.to(bubble, {
        scaleX: 1.65,
        scaleY: 1.65,
        rotation: 0,
        opacity: 0,
        duration: 0.13,
        ease: "expo.out",
      });

      /*
       * 6. FIRST SHOCKWAVE
       *
       * Bright, fast inner ring.
       */

      animation.fromTo(
        waves[0],
        {
          scale: 0.12,
          opacity: 0,
        },
        {
          scale: mobile ? 2.2 : 2.7,
          opacity: 0.42,
          duration: 0.62,
          ease: "expo.out",
        },
        "<"
      );

      /*
       * 7. SECOND SHOCKWAVE
       */

      animation.fromTo(
        waves[1],
        {
          scale: 0.12,
          opacity: 0,
        },
        {
          scale: mobile ? 2.35 : 2.85,
          opacity: 0.24,
          duration: 0.85,
          ease: "power3.out",
        },
        "<0.10"
      );

      /*
       * 8. THIRD OUTER RIPPLE
       */

      animation.fromTo(
        waves[2],
        {
          scale: 0.12,
          opacity: 0,
        },
        {
          scale: mobile ? 2.5 : 3,
          opacity: 0.13,
          duration: 1.1,
          ease: "power2.out",
        },
        "<0.12"
      );

      /*
       * 9. BURST FLASH
       */

      animation.fromTo(
        wash,
        {
          scale: 0.1,
          opacity: 0,
        },
        {
          scale: 0.75,
          opacity: mobile ? 0.24 : 0.3,
          duration: 0.09,
          ease: "power4.out",
        },
        "<"
      );

      // Flash expands and dissolves
      animation.to(
        wash,
        {
          scale: mobile ? 2.1 : 2.5,
          opacity: 0,
          duration: 0.72,
          ease: "expo.out",
        },
        "<0.08"
      );

      /*
       * 10. SHOCKWAVES DISSOLVE
       */

      animation.to(
        waves,
        {
          opacity: 0,
          duration: 0.65,
          ease: "sine.out",
          stagger: 0.08,
        },
        "-=0.25"
      );

      /*
       * 11. REVEAL THE NEXT SECTION
       */

      animation.to(
        overlay,
        {
          autoAlpha: 0,
          duration: 0.35,
          ease: "power1.out",
        },
        "-=0.2"
      );

      /*
       * SCROLL CONTROL
       */

      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: () =>
          `+=${Math.max(
            window.innerHeight * (mobile ? 1.8 : 2.5),
            mobile ? 1100 : 1800
          )}`,
        pin: hero,
        pinSpacing: true,
        scrub: mobile ? 0.5 : 0.8,
        animation,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    }, overlay);

    const refreshFrame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshFrame);
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
        contain: "layout paint",
      }}
    >
      {/* FEATHER */}
      <svg
        className="falling-feather"
        viewBox="0 0 120 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          width: "clamp(60px, 7vw, 95px)",
          height: "auto",
          zIndex: 5,
          filter: "drop-shadow(0 5px 12px rgba(255,255,255,.2))",
          willChange: "transform, opacity",
        }}
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

      {/* GLASS BUBBLE */}
      <div
        className="feather-orb"
        style={{
          position: "absolute",
          width: "clamp(110px, 12vw, 145px)",
          aspectRatio: "1",
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
            inset 0 0 35px rgba(255,255,255,.035),
            0 0 15px rgba(255,255,255,.06)
          `,
          willChange: "transform, opacity",
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
            background: "rgba(255,255,255,.55)",
            filter: "blur(3px)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>

      {/* SHOCKWAVE RINGS */}
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
                transparent 47%,
                rgba(255,255,255,.65) 48.5%,
                rgba(255,255,255,.32) 49.5%,
                rgba(255,255,255,.08) 51%,
                transparent 54%
              )
            `,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* BURST FLASH */}
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
              rgba(255,255,255,.12) 0%,
              rgba(255,255,255,.08) 15%,
              rgba(255,255,255,.035) 35%,
              transparent 65%
            )
          `,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
