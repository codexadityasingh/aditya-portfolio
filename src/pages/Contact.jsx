
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";

gsap.registerPlugin(ScrollTrigger);

const contactChannels = [
  {
    number: "01",
    name: "EMAIL",
    description: "For projects, opportunities and collaborations.",
    value: "hello@example.com",
    url: "mailto:hello@example.com",
  },
  {
    number: "02",
    name: "GITHUB",
    description: "Explore my code and development experiments.",
    value: "GITHUB PROFILE",
    url: "https://github.com/",
  },
  {
    number: "03",
    name: "LINKEDIN",
    description: "Let's connect professionally.",
    value: "LINKEDIN PROFILE",
    url: "https://www.linkedin.com/",
  },
  {
    number: "04",
    name: "INSTAGRAM",
    description: "Photography, visuals and everyday moments.",
    value: "INSTAGRAM PROFILE",
    url: "https://www.instagram.com/",
  },
];

export default function Contact() {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".contact-page .reveal", {
        y: 45,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
      });

      gsap.to(".contact-glow", {
        scale: 1.2,
        opacity: 0.65,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.utils.toArray(".contact-method").forEach((method) => {
        const arrow = method.querySelector(".contact-arrow");

        method.addEventListener("mouseenter", () => {
          gsap.to(arrow, {
            x: 5,
            y: -5,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        method.addEventListener("mouseleave", () => {
          gsap.to(arrow, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    });

    return () => context.revert();
  }, []);

  return (
    <main className="inner-page contact-page">

      {/* CONTACT HERO */}
      <section className="page-hero contact-page-hero">

        <div className="contact-glow" />

        <p className="eyebrow reveal">
          04 / CONTACT
        </p>

        <h1 className="page-title reveal">
          LET'S MAKE
          <br />
          <em>IT HAPPEN.</em>
        </h1>

        <p className="page-lead reveal">
          Have a project, an opportunity or just an
          interesting idea? I'd love to hear about it.
          Let's turn a good conversation into something
          worth building.
        </p>

        <div className="contact-hero-bottom reveal">
          <span>AVAILABLE FOR INTERESTING PROJECTS</span>
          <span>SCROLL TO CONNECT ↓</span>
        </div>

      </section>

      {/* CONTACT CHANNELS */}
      <section className="section contact-methods">

        <div className="section-top reveal">
          <span>FIND ME HERE</span>
          <span>OPEN TO GOOD CONVERSATIONS</span>
        </div>

        <div className="contact-method-list">

          {contactChannels.map((channel) => (
            <a
              className="contact-method reveal"
              href={channel.url}
              key={channel.number}
              target={
                channel.url.startsWith("http")
                  ? "_blank"
                  : undefined
              }
              rel="noreferrer"
            >
              <span className="contact-number">
                {channel.number}
              </span>

              <div className="contact-method-content">
                <h2>{channel.name}</h2>

                <p>{channel.description}</p>

                <span className="contact-method-value">
                  {channel.value}
                </span>
              </div>

              <b className="contact-arrow">↗</b>
            </a>
          ))}

        </div>

        <p className="contact-signoff reveal">
          NO FORM. NO FRICTION. JUST A CONVERSATION.
        </p>

      </section>

      {/* FINAL MESSAGE */}
      <section className="section contact-ending">

        <div className="contact-ending-content reveal">

          <p className="eyebrow">
            EVERY GREAT THING STARTS SOMEWHERE.
          </p>

          <h2 className="display-heading">
            YOUR IDEA.
            <br />
            <em>MY NEXT PROJECT?</em>
          </h2>

          <LiquidLink
            href="mailto:hello@example.com"
            variant="solid"
          >
            SEND ME AN EMAIL ↗
          </LiquidLink>

        </div>

      </section>

    </main>
  );
}
