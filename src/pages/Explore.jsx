
import { useEffect, useRef, useState } from "react";
import LiquidLink from "../components/LiquidLink";
import usePageMotion from "../hooks/usePageMotion";
import {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
} from "../lib/siteContent";

const clone = (value) => JSON.parse(JSON.stringify(value));

function mergeExploreContent(saved) {
  const defaults = clone(DEFAULT_SITE_CONTENT.explore);

  if (!saved) return defaults;

  return {
    ...defaults,
    ...saved,

    hero: {
      ...defaults.hero,
      ...(saved.hero || {}),
    },

    services: Array.isArray(saved.services)
      ? saved.services.map((service) => ({
          ...service,
          packages: Array.isArray(service.packages)
            ? service.packages.map((pack) => ({
                ...pack,
                features: Array.isArray(pack.features)
                  ? pack.features
                  : [],
              }))
            : [],
        }))
      : defaults.services,

    custom: {
      ...defaults.custom,
      ...(saved.custom || {}),
      paragraphs: Array.isArray(saved.custom?.paragraphs)
        ? saved.custom.paragraphs
        : defaults.custom.paragraphs,
    },

    addOns: Array.isArray(saved.addOns)
      ? saved.addOns
      : defaults.addOns,

    process: Array.isArray(saved.process)
      ? saved.process
      : defaults.process,

    notes: {
      ...defaults.notes,
      ...(saved.notes || {}),
      paragraphs: Array.isArray(saved.notes?.paragraphs)
        ? saved.notes.paragraphs
        : defaults.notes.paragraphs,
    },

    ending: {
      ...defaults.ending,
      ...(saved.ending || {}),
    },
  };
}

export default function Explore() {
  const pageRef = useRef(null);

  const [content, setContent] = useState(() =>
    clone(DEFAULT_SITE_CONTENT.explore)
  );

  const [activeService, setActiveService] = useState("web");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  usePageMotion(pageRef, activeService);

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      try {
        const saved = await getSiteContent("explore");

        if (!mounted) return;

        const updatedContent = mergeExploreContent(saved);

        setContent(updatedContent);

        // Keep the selected service valid if services were renamed,
        // removed or reordered in the admin panel.
        setActiveService((current) => {
          const stillExists = updatedContent.services.some(
            (service) => service.id === current
          );

          return stillExists
            ? current
            : updatedContent.services[0]?.id || "";
        });
      } catch (error) {
        console.error("Unable to load Explore content:", error);

        if (mounted) {
          setLoadError(
            "Some content could not be loaded. Showing default content."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadContent();

    return () => {
      mounted = false;
    };
  }, []);

  const {
    hero,
    services,
    custom,
    addOns,
    process,
    notes,
    ending,
  } = content;

  const selectedService =
    services.find((service) => service.id === activeService) ||
    services[0];

  return (
    <main
      className="inner-page explore-page services-page"
      ref={pageRef}
    >
      {/* HERO */}
      <section className="page-hero services-hero">
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

        <div className="services-hero-meta motion-reveal">
          <span>{hero.availability}</span>
          <span>{hero.subtitle}</span>
        </div>
      </section>

      {loadError && (
        <p className="explore-load-error" role="status">
          {loadError}
        </p>
      )}

      {loading && (
        <div className="explore-loading">
          LOADING SERVICES...
        </div>
      )}

      {/* SERVICE SELECTOR */}
      <section className="section services-catalogue">
        <div className="section-top motion-reveal">
          <span>01 / WHAT I OFFER</span>
          <span>SELECT A SERVICE</span>
        </div>

        <div className="services-heading motion-reveal">
          <h2 className="display-heading">
            WHAT CAN
            <br />
            <em>I BUILD FOR YOU?</em>
          </h2>

          <p>
            Choose a service to explore packages, deliverables
            and starting prices.
          </p>
        </div>

        <div className="services-selector">
          {services.map((service) => (
            <button
              type="button"
              key={service.id}
              className={`service-selector-item ${
                activeService === service.id ? "active" : ""
              }`}
              onClick={() => setActiveService(service.id)}
            >
              <span>{service.number}</span>
              <strong>{service.title}</strong>
              <span className="service-selector-arrow">↗</span>
            </button>
          ))}
        </div>

        {/* SELECTED SERVICE */}
        {selectedService && (
          <div
            className="selected-service"
            key={selectedService.id}
          >
            <div className="selected-service-intro motion-reveal">
              <div>
                <span className="eyebrow">
                  {selectedService.number} / {selectedService.category}
                </span>

                <h3>
                  {selectedService.title}
                  <span>.</span>
                </h3>

                <p>{selectedService.description}</p>
              </div>

              <span className="selected-service-icon">
                {selectedService.icon}
              </span>
            </div>

            {/* PRICING PACKAGES */}
            <div className="service-packages">
              {selectedService.packages.map((pack, index) => (
                <article
                  className={`service-package motion-reveal ${
                    pack.popular ? "service-package-featured" : ""
                  }`}
                  key={`${selectedService.id}-${pack.name}-${index}`}
                >
                  {pack.popular && (
                    <span className="service-popular">
                      MOST POPULAR
                    </span>
                  )}

                  <div className="service-package-top">
                    <span>
                      PACKAGE {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{pack.name}</span>
                  </div>

                  <div className="service-package-price">
                    <h4>{pack.price}</h4>
                    {pack.unit && <span>{pack.unit}</span>}
                  </div>

                  <p className="service-package-description">
                    {pack.description}
                  </p>

                  <div className="service-package-divider" />

                  <span className="service-includes">
                    WHAT'S INCLUDED
                  </span>

                  <ul>
                    {pack.features.map((feature, featureIndex) => (
                      <li key={`${feature}-${featureIndex}`}>
                        <span>↗</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <LiquidLink
                    to={`/contact?service=${encodeURIComponent(
                      selectedService.id
                    )}&package=${encodeURIComponent(
                      pack.name.toLowerCase()
                    )}`}
                    variant={pack.popular ? "solid" : "glass"}
                  >
                    CHOOSE THIS PACKAGE ↗
                  </LiquidLink>
                </article>
              ))}
            </div>
          </div>
        )}

        {!selectedService && (
          <p className="explore-empty">
            No services are currently available.
          </p>
        )}
      </section>

      {/* CUSTOM WORK */}
      <section className="section services-custom">
        <div className="section-top motion-reveal">
          <span>02 / SOMETHING DIFFERENT?</span>
          <span>LET'S TALK CUSTOM</span>
        </div>

        <div className="services-custom-content motion-reveal">
          <div>
            <p className="eyebrow">{custom.eyebrow}</p>

            <h2 className="display-heading">
              {custom.title}
              <br />
              <em>{custom.emphasis}</em>
            </h2>
          </div>

          <div className="services-custom-copy">
            {custom.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <LiquidLink to="/contact" variant="solid">
              {custom.button}
            </LiquidLink>
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="section services-addons">
        <div className="section-top motion-reveal">
          <span>03 / OPTIONAL EXTRAS</span>
          <span>MAKE IT YOURS</span>
        </div>

        <div className="services-addons-heading motion-reveal">
          <h2 className="display-heading">
            A LITTLE
            <br />
            <em>EXTRA.</em>
          </h2>

          <p>
            Extend your package with additional features
            and services.
          </p>
        </div>

        <div className="services-addon-list">
          {addOns.map((addon, index) => (
            <div
              className="services-addon-row motion-reveal motion-tilt"
              key={`${addon.name}-${index}`}
            >
              <span>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{addon.name}</h3>
              <p>{addon.price}</p>
              <span>↗</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="section services-process">
        <div className="section-top motion-reveal">
          <span>04 / HOW IT WORKS</span>
          <span>FROM IDEA TO DELIVERY</span>
        </div>

        <h2 className="display-heading motion-reveal">
          SIMPLE PROCESS.
          <br />
          <em>GOOD RESULTS.</em>
        </h2>

        <div className="services-process-grid">
          {process.map((step, index) => (
            <article
              className="services-process-card motion-reveal motion-tilt"
              key={`${step.number}-${step.title}-${index}`}
            >
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* IMPORTANT PRICING NOTES */}
      <section className="section services-notes">
        <div className="services-notes-content motion-reveal">
          <p className="eyebrow">{notes.eyebrow}</p>

          <h2 className="display-heading">
            {notes.title}
            <br />
            <em>{notes.emphasis}</em>
          </h2>

          {notes.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section services-ending">
        <div className="services-ending-content motion-reveal">
          <p className="eyebrow">
            {ending.eyebrow}
          </p>

          <h2 className="display-heading">
            {ending.title}
            <br />
            <em>{ending.emphasis}</em>
          </h2>

          <LiquidLink to="/contact" variant="solid">
            {ending.button}
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}
