
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    number: "01",
    title: "STAY CURIOUS.",
    description:
      "Keep asking questions. Understand how things work and never stop exploring.",
  },
  {
    number: "02",
    title: "BUILD TO LEARN.",
    description:
      "Turn ideas into working things. Experiment, make mistakes and improve.",
  },
  {
    number: "03",
    title: "CARE ABOUT DETAILS.",
    description:
      "Good functionality matters. So does the experience of using it.",
  },
];

const interests = [
  "WEB DEVELOPMENT",
  "CREATIVE CODING",
  "PHOTOGRAPHY",
  "VIDEOGRAPHY",
  "UI / UX DESIGN",
  "MOTION DESIGN",
];

export default function About() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 45,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 87%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.to(".about-orbit", {
        rotation: 360,
        duration: 40,
        repeat: -1,
        ease: "none",
      });
    });

    return () => context.revert();
  }, []);

  return (
    <main className="inner-page about-page">

      {/* PAGE INTRO */}
      <section className="page-hero">
        <p className="eyebrow reveal">01 / A LITTLE ABOUT ME</p>

        <h1 className="page-title reveal">
          A MIND THAT
          <br />
          <em>KEEPS BUILDING.</em>
        </h1>

        <p className="page-lead reveal">
          Developer in progress. Curious by nature.
          Interested in making useful things feel
          considered, intuitive and memorable.
        </p>

        <div className="about-hero-index">
          <span>ADITYA SINGH</span>
          <span>COMPUTER SCIENCE / CREATIVE TECHNOLOGY</span>
        </div>
      </section>

      {/* PERSONAL INTRODUCTION */}
      <section className="section about-detail">
        <div className="section-top reveal">
          <span>THE PERSON BEHIND THE SCREEN</span>
          <span>INDIA / 2026</span>
        </div>

        <div className="about-detail-grid">
          <div className="about-identity reveal">
            <div className="about-identity-art">
              <div className="about-orbit" />
              <div className="about-identity-core">
                A<span>.</span>
              </div>
              <span className="identity-caption">
                THINK / CREATE / REPEAT
              </span>
            </div>
          </div>

          <div className="about-copy reveal">
            <p className="eyebrow">HELLO, I'M ADITYA.</p>

            <h2 className="display-heading">
              CURIOUS
              <br />
              ABOUT HOW
              <br />
              <em>THINGS WORK.</em>
            </h2>

            <p>
              I'm a Computer Science student focused on
              growing as a developer while exploring
              the creative side of technology.
            </p>

            <p>
              I enjoy learning by building: breaking
              down a problem, figuring out the right
              tools, creating an interface and improving
              it until it feels right.
            </p>

            <p>
              Outside development, I'm interested in
              photography, videography, visual storytelling
              and motion — all the things that make
              a digital experience feel alive.
            </p>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="section about-values">
        <div className="section-top reveal">
          <span>02 / HOW I THINK</span>
          <span>MY APPROACH</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            THE WAY
            <br />
            <em>I BUILD.</em>
          </h2>

          <p>
            Every project is an opportunity to learn
            something new and make something better.
          </p>
        </div>

        <div className="value-list">
          {principles.map((principle) => (
            <div className="value-row reveal" key={principle.number}>
              <span>{principle.number}</span>

              <h3>{principle.title}</h3>

              <p>{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTERESTS */}
      <section className="section about-interests">
        <div className="section-top reveal">
          <span>03 / BEYOND THE CODE</span>
          <span>THINGS THAT INTEREST ME</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            MORE THAN
            <br />
            <em>ONE THING.</em>
          </h2>

          <p>
            Technology is one side of creativity.
            I enjoy exploring the visual side too.
          </p>
        </div>

        <div className="interest-grid reveal">
          {interests.map((interest, index) => (
            <div className="interest-item" key={interest}>
              <span>0{index + 1}</span>
              <h3>{interest}</h3>
              <b>↗</b>
            </div>
          ))}
        </div>
      </section>

      {/* ENDING */}
      <section className="section about-ending">
        <div className="about-ending-content reveal">
          <p className="eyebrow">STILL LEARNING. ALWAYS BUILDING.</p>

          <h2 className="display-heading">
            THIS IS JUST
            <br />
            <em>THE BEGINNING.</em>
          </h2>

          <LiquidLink to="/projects" variant="solid">
            EXPLORE MY WORK ↗
          </LiquidLink>
        </div>
      </section>

    </main>
  );
}
