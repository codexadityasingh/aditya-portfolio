import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function usePageMotion(pageRef, refreshKey = 0) {
  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const cleanups = [];

    const context = gsap.context(() => {
      // SCROLL REVEALS
      gsap.utils.toArray(".motion-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // 3D TILT
      gsap.utils.toArray(".motion-tilt").forEach((card) => {
        const handleMove = (event) => {
          if (window.matchMedia("(pointer: coarse)").matches) return;

          const rect = card.getBoundingClientRect();

          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 8,
            rotateX: -y * 8,
            y: -6,
            scale: 1.015,
            transformPerspective: 1000,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const handleLeave = () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
          });
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        cleanups.push(() => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
          gsap.killTweensOf(card);
        });
      });
    }, page);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [pageRef, refreshKey]);
}