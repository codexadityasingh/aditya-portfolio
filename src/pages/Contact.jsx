
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "gsap";
import usePageMotion from "../hooks/usePageMotion";
import {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
} from "../lib/siteContent";

const DEFAULT_CHANNELS = [
  {
    number: "01",
    name: "EMAIL",
    description: "For projects, opportunities and collaborations.",
    value: "adityasingh675454@gmail.com",
    url: "mailto:adityasingh675454@gmail.com",
    enabled: true,
  },
  {
    number: "02",
    name: "GITHUB",
    description: "Explore my code and development experiments.",
    value: "GITHUB PROFILE",
    url: "https://github.com/codexadityasingh",
    enabled: true,
  },
  {
    number: "03",
    name: "LINKEDIN",
    description: "Let's connect professionally.",
    value: "LINKEDIN PROFILE",
    url: "https://www.linkedin.com/in/aditya-singh-3728b324b",
    enabled: true,
  },
  {
    number: "04",
    name: "INSTAGRAM",
    description: "Photography, visuals and everyday moments.",
    value: "INSTAGRAM PROFILE",
    url: "https://www.instagram.com/",
    enabled: true,
  },
];

const DEFAULT_PHONE = {
  enabled: false,
  label: "PHONE",
  number: "",
  description: "Feel free to call me.",
};

const DEFAULT_CONTACT = {
  ...DEFAULT_SITE_CONTENT.contact,
  channels: DEFAULT_CHANNELS,
  phone: DEFAULT_PHONE,
};

function isExternalUrl(url = "") {
  return url.startsWith("https://") || url.startsWith("http://");
}

export default function Contact() {
  const pageRef = useRef(null);
  const [searchParams] = useSearchParams();

  const [content, setContent] = useState(DEFAULT_CONTACT);
  const [contentLoading, setContentLoading] = useState(true);

  const serviceId = searchParams.get("service");
  const packageName = searchParams.get("package");

  const serviceNames = Object.fromEntries(
    (DEFAULT_SITE_CONTENT.explore?.services || []).map((service) => [
      service.id,
      service.title,
    ])
  );

  const selectedService = serviceNames[serviceId] || null;

  const selectedPackage = packageName
    ? packageName.replace(/-/g, " ").toUpperCase()
    : null;

  const hasSelection = Boolean(selectedService && selectedPackage);

  usePageMotion(
    pageRef,
    `${serviceId}-${packageName}-${contentLoading}`
  );

  // LOAD SAVED CONTACT CONTENT
  useEffect(() => {
    let active = true;

    async function loadContactContent() {
      try {
        const saved = await getSiteContent("contact");

        if (!active) return;

        if (saved) {
          setContent({
            ...DEFAULT_CONTACT,
            ...saved,
            hero: {
              ...DEFAULT_CONTACT.hero,
              ...saved.hero,
            },
            channels: Array.isArray(saved.channels)
              ? saved.channels
              : DEFAULT_CHANNELS,
            phone: {
              ...DEFAULT_PHONE,
              ...saved.phone,
            },
            signoff: {
              ...DEFAULT_CONTACT.signoff,
              ...saved.signoff,
            },
            ending: {
              ...DEFAULT_CONTACT.ending,
              ...saved.ending,
            },
          });
        }
      } catch (error) {
        console.error("Unable to load Contact content:", error);
      } finally {
        if (active) setContentLoading(false);
      }
    }

    loadContactContent();

    return () => {
      active = false;
    };
  }, []);

  // AMBIENT GLOW
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const glow = page.querySelector(".contact-glow");
    if (!glow) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const animation = gsap.to(glow, {
      scale: 1.2,
      opacity: 0.65,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => animation.kill();
  }, [contentLoading]);

  const hero = content.hero || DEFAULT_CONTACT.hero;
  const ending = content.ending || DEFAULT_CONTACT.ending;
  const signoff = content.signoff || DEFAULT_CONTACT.signoff;

  const visibleChannels = (content.channels || []).filter(
    (channel) =>
      channel.enabled !== false &&
      channel.name &&
      channel.value
  );

  // PHONE IS SAVED SEPARATELY BY THE ADMIN EDITOR
  const phone = {
    ...DEFAULT_PHONE,
    ...(content.phone || {}),
  };

  const showPhone = Boolean(
    phone.enabled && phone.number?.trim()
  );

  const phoneHref = `tel:${phone.number.replace(/[^\d+]/g, "")}`;

  const emailChannel = visibleChannels.find(
    (channel) => channel.name?.toUpperCase() === "EMAIL"
  );

  const emailAddress =
    emailChannel?.value || "adityasingh675454@gmail.com";

  const emailSubject = hasSelection
    ? `Project Enquiry - ${selectedService} / ${selectedPackage}`
    : "Project Enquiry";

  const emailBody = hasSelection
    ? `Hi Aditya,

I'm interested in discussing a project.

Service: ${selectedService}
Package: ${selectedPackage}

Project details:
[Describe your idea, requirements and timeline here]

Looking forward to hearing from you.`
    : `Hi Aditya,

I'd like to discuss a project or collaboration.

Project details:
[Describe your idea, requirements and timeline here]

Looking forward to hearing from you.`;

  const emailLink =
    `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}` +
    `&body=${encodeURIComponent(emailBody)}`;

  return (
    <main className="inner-page contact-page" ref={pageRef}>
      {/* CONTACT HERO */}
      <section className="page-hero contact-page-hero">
        <div className="contact-glow" />

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

        <div className="contact-hero-bottom motion-reveal">
          <span>
            {hero.availability || "AVAILABLE FOR INTERESTING PROJECTS"}
          </span>
          <span>SCROLL TO CONNECT ↓</span>
        </div>
      </section>

      {/* SELECTED PACKAGE */}
      {hasSelection && (
        <section className="section contact-selection-section">
          <div className="contact-selection motion-reveal">
            <div>
              <span className="eyebrow">YOUR SELECTED PACKAGE</span>
              <h2>{selectedService}</h2>
              <p>PACKAGE / {selectedPackage}</p>
            </div>

            <div className="contact-selection-status">
              <span />
              READY TO DISCUSS
            </div>
          </div>
        </section>
      )}

      {/* CONTACT CHANNELS */}
      <section className="section contact-methods">
        <div className="section-top motion-reveal">
          <span>FIND ME HERE</span>
          <span>OPEN TO GOOD CONVERSATIONS</span>
        </div>

        {contentLoading ? (
          <p className="contact-signoff">LOADING CONTACT DETAILS...</p>
        ) : (
          <div className="contact-method-list">
            {visibleChannels.map((channel, index) => {
              const isEmail =
                channel.name?.toUpperCase() === "EMAIL";

              const url = isEmail
                ? emailLink
                : channel.url || "#";

              const external = isExternalUrl(url);

              return (
                <a
                  className="contact-method motion-reveal"
                  href={url}
                  key={`${channel.number}-${channel.name}-${index}`}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  <span className="contact-number">
                    {channel.number ||
                      String(index + 1).padStart(2, "0")}
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
              );
            })}

            {/* PHONE — ONLY VISIBLE WHEN ENABLED IN ADMIN */}
            {showPhone && (
              <a
                className="contact-method motion-reveal"
                href={phoneHref}
              >
                <span className="contact-number">
                  {String(visibleChannels.length + 1).padStart(2, "0")}
                </span>

                <div className="contact-method-content">
                  <h2>{phone.label || "PHONE"}</h2>

                  <p>{phone.description}</p>

                  <span className="contact-method-value">
                    {phone.number}
                  </span>
                </div>

                <b className="contact-arrow">↗</b>
              </a>
            )}
          </div>
        )}

        <p className="contact-signoff motion-reveal">
          {signoff.text || "NO FORM. NO FRICTION. JUST A CONVERSATION."}
        </p>
      </section>

      {/* FINAL MESSAGE */}
      <section className="section contact-ending">
        <div className="contact-ending-content motion-reveal">
          <p className="eyebrow">{ending.eyebrow}</p>

          <h2 className="display-heading">
            {ending.title}
            <br />
            <em>{ending.emphasis}</em>
          </h2>

          <a href={emailLink} className="contact-email-cta">
            {ending.button || "SEND ME AN EMAIL ↗"}
          </a>
        </div>
      </section>
    </main>
  );
}
