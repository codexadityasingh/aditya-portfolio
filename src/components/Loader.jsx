
import { useEffect, useState } from "react";
import gsap from "gsap";

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const counter = { value: 0 };

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        setProgress(100);
        gsap.set(".loader-content", { opacity: 0 });
        gsap.set(".loader-screen", { yPercent: -100 });
        onComplete?.();
        return;
      }

      const timeline = gsap.timeline({
        onComplete: () => onComplete?.(),
      });

      timeline.to(counter, {
        value: 100,
        duration: 2.4,
        ease: "power2.inOut",
        onUpdate: () => setProgress(Math.round(counter.value)),
      });

      timeline.to(".loader-content", {
        y: -35,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      });

      timeline.to(".loader-screen", {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
      });
    });

    return () => context.revert();
  }, [onComplete]);

  return (
    <div className="loader-screen">
      <div className="loader-content">

        {/* NEXVSN Brand */}
        <div className="loader-brand">
          <img
            src="/images/logo/nexvsn-mark.png"
            alt=""
            className="loader-brand-logo"
          />

          <span className="loader-brand-divider" />

          <span className="loader-brand-name">
            NEXVSN<span>.</span>
          </span>
        </div>

        {/* Central Orbital Animation */}
        <div className="loader-center">
          <div className="loader-orbit">
            <div className="loader-orbit-inner">
              <img
                src="/images/logo/nexvsn-mark.png"
                alt=""
                className="loader-orbit-logo"
              />
            </div>

            <div className="loader-dot" />
          </div>

          <p>CREATING DIGITAL EXPERIENCES</p>
        </div>

        {/* Loading Progress */}
        <div className="loader-bottom">
          <span>NEXVSN / DIGITAL STUDIO</span>

          <div
            className="loader-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <div
              className="loader-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span>{String(progress).padStart(2, "0")}%</span>
        </div>

      </div>
    </div>
  );
}
