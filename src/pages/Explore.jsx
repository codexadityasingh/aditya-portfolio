
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LiquidLink from "../components/LiquidLink";

const experiments = [
  {
    number: "001",
    title: "LIQUID FORM",
    description: "Glass, light and fluid movement.",
  },
  {
    number: "002",
    title: "MOTION STUDY",
    description: "Exploring movement through interaction.",
  },
  {
    number: "003",
    title: "DIGITAL OBJECTS",
    description: "Simple forms with a little personality.",
  },
];

export default function Explore() {
  const pageRef = useRef(null);
  const orbRef = useRef(null);
  const [activeExperiment, setActiveExperiment] = useState(0);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".explore-page .reveal", {
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".explore-orb", {
        scale: 0.2,
        opacity: 0,
        rotation: -90,
        duration: 1.4,
        ease: "power3.out",
      });

      gsap.to(".explore-orb", {
        y: -18,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".explore-orbit-one", {
        rotation: 360,
        duration: 25,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".explore-orbit-two", {
        rotation: -360,
        duration: 35,
        repeat: -1,
        ease: "none",
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  const handlePointerMove = (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const element = orbRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(element, {
      rotateY: x * 24,
      rotateX: -y * 24,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const resetPointer = () => {
    if (!orbRef.current) return;

    gsap.to(orbRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <main className="inner-page explore-page" ref={pageRef}>

      {/* INTRO */}
      <section className="page-hero">
        <p className="eyebrow reveal">
          03 / EXPERIMENTAL SPACE
        </p>

        <h1 className="page-title reveal">
          PLAY.
          <br />
          <em>EXPLORE.</em>
          <br />
          REPEAT.
        </h1>

        <p className="page-lead reveal">
          A little corner for motion, interactions,
          visual experiments and ideas that don't
          fit into a normal project card.
        </p>
      </section>

      {/* INTERACTIVE ARTWORK */}
      <section className="section explore-lab">

        <div className="section-top reveal">
          <span>INTERACTIVE STUDY / 001</span>
          <span>FORM IN MOTION</span>
        </div>

        <div className="explore-stage">

          <div
            className="explore-object"
            ref={orbRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={resetPointer}
          >
            <div className="explore-orbit-one" />
            <div className="explore-orbit-two" />

            <div className="explore-orb">
              <div className="explore-orb-shine" />
              <span>ADI</span>
            </div>
          </div>

          <div className="explore-stage-caption">
            <span>LIQUID FORM / 001</span>
            <span>MOVE YOUR CURSOR TO INTERACT</span>
          </div>

        </div>

        {/* EXPERIMENT SELECTOR */}
        <div className="section-top reveal">
          <span>EXPERIMENT INDEX</span>
          <span>SELECT A STUDY</span>
        </div>

        <div className="experiment-list">
          {experiments.map((experiment, index) => (
            <button
              type="button"
              key={experiment.number}
              className={
                activeExperiment === index
                  ? "experiment-item active"
                  : "experiment-item"
              }
              onClick={() => setActiveExperiment(index)}
            >
              <span>{experiment.number}</span>

              <div>
                <h3>{experiment.title}</h3>
                <p>{experiment.description}</p>
              </div>

              <b>{activeExperiment === index ? "●" : "↗"}</b>
            </button>
          ))}
        </div>

        <div className="explore-note reveal">
          <h2 className="display-heading">
            THE WEB CAN
            <br />
            <em>FEEL ALIVE.</em>
          </h2>

          <p>
            This space will keep growing with experiments
            in interaction design, animation, typography,
            3D and creative coding.
          </p>

          <LiquidLink to="/contact">
            HAVE AN IDEA? ↗
          </LiquidLink>
        </div>

      </section>

    </main>
  );
}
