
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LiquidLink from "../components/LiquidLink";
import usePageMotion from "../hooks/usePageMotion";
import {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
} from "../lib/siteContent";

function mergeAboutContent(saved = {}) {
  const defaults = DEFAULT_SITE_CONTENT.about;

  return {
    hero: {
      ...defaults.hero,
      ...(saved.hero || {}),
    },

    introduction: {
      ...defaults.introduction,
      ...(saved.introduction || {}),
      paragraphs: Array.isArray(saved.introduction?.paragraphs)
        ? saved.introduction.paragraphs
        : defaults.introduction.paragraphs,
    },

    principles: Array.isArray(saved.principles)
      ? saved.principles
      : defaults.principles,

    interests: Array.isArray(saved.interests)
      ? saved.interests
      : defaults.interests,

    ending: {
      ...defaults.ending,
      ...(saved.ending || {}),
    },
  };
}

export default function About() {
  const pageRef = useRef(null);

  const [content, setContent] = useState(
    () => mergeAboutContent()
  );

  const [loading, setLoading] = useState(true);

  // Shared animation system
  usePageMotion(pageRef, loading ? 0 : 1);

  // Keep the orbit animation as a page-specific effect
  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const orbit = page.querySelector(".about-orbit");

    if (!orbit) return;

    const animation = gsap.to(orbit, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "none",
    });

    return () => animation.kill();
  }, []);

  // Load About content from Supabase
  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      try {
        const savedContent = await getSiteContent("about");

        if (!mounted) return;

        setContent(mergeAboutContent(savedContent));
      } catch (error) {
        console.error("Could not load About page content:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const { hero, introduction, principles, interests, ending } = content;

  return (
    <main className="inner-page about-page" ref={pageRef}>

      {/* PAGE INTRO */}
      <section className="page-hero">
        <p className="eyebrow motion-reveal">
          {hero.eyebrow}
        </p>

        <h1 className="page-title motion-reveal">
          {hero.title}
          <br />
          <em>{hero.emphasis}</em>
        </h1>

        <p className="page-lead motion-reveal">
          {hero.description}
        </p>

        <div className="about-hero-index motion-reveal">
          <span>{hero.name}</span>
          <span>{hero.subtitle}</span>
        </div>
      </section>

      {/* PERSONAL INTRODUCTION */}
      <section className="section about-detail">
        <div className="section-top motion-reveal">
          <span>THE PERSON BEHIND THE SCREEN</span>
          <span>INDIA / 2026</span>
        </div>

        <div className="about-detail-grid">

          <div className="about-identity motion-reveal">
            <div className="about-identity-art motion-tilt">
              <div className="about-orbit" />

              <div className="about-identity-core">
                A<span>.</span>
              </div>

              <span className="identity-caption">
                THINK / CREATE / REPEAT
              </span>
            </div>
          </div>

          <div className="about-copy motion-reveal">
            <p className="eyebrow">
              {introduction.eyebrow}
            </p>

            <h2
              className="display-heading"
              style={{ whiteSpace: "pre-line" }}
            >
              {introduction.heading}
            </h2>

            {introduction.paragraphs.map((paragraph, index) => (
              <p key={index}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="section about-values">
        <div className="section-top motion-reveal">
          <span>02 / HOW I THINK</span>
          <span>MY APPROACH</span>
        </div>

        <div className="section-heading-row motion-reveal">
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
          {principles.map((principle, index) => (
            <div
              className="value-row motion-reveal motion-tilt"
              key={principle.number || index}
            >
              <span>{principle.number}</span>

              <h3>{principle.title}</h3>

              <p>{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTERESTS */}
      <section className="section about-interests">
        <div className="section-top motion-reveal">
          <span>03 / BEYOND THE CODE</span>
          <span>THINGS THAT INTEREST ME</span>
        </div>

        <div className="section-heading-row motion-reveal">
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

        <div className="interest-grid">
          {interests.map((interest, index) => (
            <div
              className="interest-item motion-reveal motion-tilt"
              key={`${interest}-${index}`}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{interest}</h3>

              <b>↗</b>
            </div>
          ))}
        </div>
      </section>

      {/* ENDING */}
      <section className="section about-ending">
        <div className="about-ending-content motion-reveal">
          <p className="eyebrow">
            {ending.eyebrow}
          </p>

          <h2 className="display-heading">
            {ending.title}
            <br />
            <em>{ending.emphasis}</em>
          </h2>

          <LiquidLink to={ending.buttonLink || "/projects"} variant="solid">
            {ending.button} ↗
          </LiquidLink>
        </div>
      </section>

    </main>
  );
}
