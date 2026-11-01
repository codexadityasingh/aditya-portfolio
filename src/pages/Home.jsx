import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidLink from "../components/LiquidLink";
import { supabase } from "../lib/supabase";

gsap.registerPlugin(ScrollTrigger);

const clientWorks = [
  {
    number: "01",
    title: "BONE JAM",
    category: "WEB DEVELOPMENT / CLIENT WORK",
    description:
      "A collaborative website for custom Minecraft creations, bringing a distinctive creative vision to life.",
    visual: "client-website-visual",
    symbol: "↗",
    status: "FEATURED COLLABORATION",
  },
];

const tools = [
  {
    number: "01",
    title: "DEVELOPMENT",
    description: "React · JavaScript · Java · Spring Boot · Python",
  },
  {
    number: "02",
    title: "DATA",
    description: "SQL · MySQL · Excel · Pandas",
  },
  {
    number: "03",
    title: "CREATIVE",
    description: "DaVinci Resolve · Lightroom · Photography",
  },
];

export default function Home() {
  const pageRef = useRef(null);
  const projectCarouselRef = useRef(null);
  const clientCarouselRef = useRef(null);
  const toolkitViewportRef = useRef(null);
  const toolkitDrag = useRef({ active: false, startX: 0, lastX: 0, pointerId: null });
  const [toolkitDragX, setToolkitDragX] = useState(0);
  const [toolkitIsDragging, setToolkitIsDragging] = useState(false);

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [toolIndex, setToolIndex] = useState(0);

  // Load published personal projects from Supabase.
  useEffect(() => {
    let active = true;

    const loadFeaturedProjects = async () => {
      const { data, error } = await supabase
        .from("personal_projects")
        .select(
          "id, title, slug, category, description, status, cover_image_url, featured, sort_order"
        )
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(2);

      if (!active) return;

      if (error) {
        console.error("Unable to load homepage projects:", error);
        setFeaturedProjects([]);
      } else {
        setFeaturedProjects(data || []);
      }

      setProjectsLoading(false);
    };

    loadFeaturedProjects();

    return () => {
      active = false;
    };
  }, []);

  // Original homepage animations.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [
            ".hero-kicker",
            ".hero-line",
            ".hero-description",
            ".hero-actions",
            ".hero-social",
            ".hero-artwork",
            ".floating-label",
            ".reveal",
          ],
          { clearProps: "all" }
        );
        return;
      }

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      intro
        .from(".hero-kicker", {
          y: 20,
          opacity: 0,
          duration: 0.6,
        })
        .from(
          ".hero-line",
          {
            yPercent: 110,
            opacity: 0,
            stagger: 0.14,
            duration: 0.9,
          },
          "-=0.25"
        )
        .from(
          ".hero-description, .hero-actions, .hero-social",
          {
            y: 20,
            opacity: 0,
            stagger: 0.12,
            duration: 0.6,
          },
          "-=0.35"
        )
        .from(
          ".hero-artwork",
          {
            scale: 0.8,
            opacity: 0,
            duration: 1.2,
          },
          "-=0.8"
        )
        .from(
          ".floating-label",
          {
            y: 15,
            opacity: 0,
            stagger: 0.15,
            duration: 0.5,
          },
          "-=0.5"
        );

      gsap.to(".orbit-ring", {
        rotation: 360,
        duration: 35,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".visual-core", {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      [
        ".glass-drop-one",
        ".glass-drop-two",
        ".glass-drop-three",
        ".glass-drop-four",
      ].forEach((selector, index) => {
        gsap.to(selector, {
          y: index % 2 === 0 ? -20 : 18,
          x: index % 2 === 0 ? 10 : -10,
          rotation: index % 2 === 0 ? 12 : -12,
          duration: 3 + index * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      gsap.utils.toArray(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 45,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, page);

    return () => context.revert();
  }, []);

  // 3D interaction for project cards.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const cards = page.querySelectorAll(".float-card");

    cards.forEach((card) => {
      const handleMove = (event) => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 9,
          rotateX: -y * 8,
          y: -10,
          duration: 0.35,
          ease: "power2.out",
          transformPerspective: 900,
        });
      };

      const handleLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.65,
          ease: "elastic.out(1, 0.6)",
        });
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);

      card._cleanup = () => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      };
    });

    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      window.clearTimeout(refreshTimer);

      cards.forEach((card) => {
        card._cleanup?.();
        delete card._cleanup;
      });
    };
  }, [featuredProjects, projectsLoading]);

  // Find the currently centred card and move one position.
  const scrollCarousel = (ref, direction) => {
    const carousel = ref.current;
    if (!carousel) return;

    const cards = Array.from(
      carousel.querySelectorAll(".mobile-carousel-card")
    );

    if (!cards.length) return;

    const carouselRect = carousel.getBoundingClientRect();
    const carouselCenter =
      carouselRect.left + carouselRect.width / 2;

    let currentIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - carouselCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentIndex = index;
      }
    });

    const nextIndex = Math.max(
      0,
      Math.min(cards.length - 1, currentIndex + direction)
    );

    const target = cards[nextIndex];
    const targetRect = target.getBoundingClientRect();
    const targetCenter = targetRect.left + targetRect.width / 2;
    const offset = targetCenter - carouselCenter;

    carousel.scrollTo({
      left: carousel.scrollLeft + offset,
      behavior: "smooth",
    });
  };

  // Desktop mouse-drag support for the two homepage card carousels.
  // Touch and trackpad scrolling remain native, including scroll snapping.
  useEffect(() => {
    const cleanups = [];

    [projectCarouselRef, clientCarouselRef].forEach((ref) => {
      const carousel = ref.current;
      if (!carousel) return;

      let pointerDown = false;
      let startX = 0;
      let startScrollLeft = 0;
      let dragged = false;

      const onPointerDown = (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        pointerDown = true;
        dragged = false;
        startX = event.clientX;
        startScrollLeft = carousel.scrollLeft;
        carousel.classList.add("is-mouse-dragging");
      };

      const onPointerMove = (event) => {
        if (!pointerDown) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 4) dragged = true;
        if (dragged) carousel.scrollLeft = startScrollLeft - delta;
      };

      const stopDragging = () => {
        if (!pointerDown) return;
        pointerDown = false;
        carousel.classList.remove("is-mouse-dragging");
        if (dragged) {
          carousel.dataset.dragged = "true";
          window.setTimeout(() => delete carousel.dataset.dragged, 0);
        }
      };

      const preventDraggedClick = (event) => {
        if (carousel.dataset.dragged === "true") {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      // Explicit trackpad support: route horizontal wheel gestures to this
      // carousel instead of relying on browser-specific overflow handling.
      const onWheel = (event) => {
        const horizontalDelta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
        if (Math.abs(horizontalDelta) < 0.5) return;

        event.preventDefault();
        carousel.scrollLeft += horizontalDelta;
      };

      carousel.addEventListener("pointerdown", onPointerDown);
      carousel.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDragging);
      window.addEventListener("pointercancel", stopDragging);
      carousel.addEventListener("click", preventDraggedClick, true);

      cleanups.push(() => {
        carousel.removeEventListener("pointerdown", onPointerDown);
        carousel.removeEventListener("wheel", onWheel);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopDragging);
        window.removeEventListener("pointercancel", stopDragging);
        carousel.removeEventListener("click", preventDraggedClick, true);
        carousel.classList.remove("is-mouse-dragging");
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [featuredProjects, projectsLoading]);

  // Continuous toolkit dragging: cards follow the pointer/touch in real time,
  // then snap to the nearest card only after release.
  const handleToolkitPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    toolkitDrag.current = {
      active: true,
      startX: event.clientX,
      lastX: event.clientX,
      pointerId: event.pointerId,
    };
    setToolkitIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleToolkitPointerMove = (event) => {
    if (!toolkitDrag.current.active) return;
    const delta = event.clientX - toolkitDrag.current.startX;
    toolkitDrag.current.lastX = event.clientX;
    setToolkitDragX(delta);
  };

  const finishToolkitDrag = () => {
    if (!toolkitDrag.current.active) return;
    const delta = toolkitDrag.current.lastX - toolkitDrag.current.startX;
    const viewportWidth = toolkitViewportRef.current?.getBoundingClientRect().width || window.innerWidth;
    const snapDistance = viewportWidth * 0.18;
    if (Math.abs(delta) > snapDistance) {
      setToolIndex((previous) => delta < 0
        ? (previous + 1) % tools.length
        : (previous - 1 + tools.length) % tools.length);
    }
    toolkitDrag.current.active = false;
    setToolkitDragX(0);
    setToolkitIsDragging(false);
  };

  // Centre the first card on initial load.
  useEffect(() => {
    const refs = [
      projectCarouselRef,
      clientCarouselRef,
    ];

    const frame = requestAnimationFrame(() => {
      refs.forEach((ref) => {
        const carousel = ref.current;
        const firstCard = carousel?.querySelector(
          ".mobile-carousel-card"
        );

        if (!carousel || !firstCard) return;

        const carouselRect = carousel.getBoundingClientRect();
        const cardRect = firstCard.getBoundingClientRect();

        const offset =
          cardRect.left +
          cardRect.width / 2 -
          (carouselRect.left + carouselRect.width / 2);

        carousel.scrollLeft += offset;
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [featuredProjects, projectsLoading]);

  return (
    <main ref={pageRef}>
      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-kicker">
            <i />
            OPEN TO OPPORTUNITIES
          </div>

          <h1>
            <span className="hero-line-wrap">
              <span className="hero-line">CRAFTING</span>
            </span>
            <span className="hero-line-wrap">
              <span className="hero-line muted">DIGITAL</span>
            </span>
            <span className="hero-line-wrap">
              <span className="hero-line">
                EXPERIENCES<span className="period">.</span>
              </span>
            </span>
          </h1>

          <p className="hero-description">
            I'm a developer with a passion for creating thoughtful
            digital experiences. I turn ideas into functional,
            engaging and meaningful things on the internet.
          </p>

          <div className="hero-actions">
            <LiquidLink to="/projects" variant="solid">
              EXPLORE MY WORK ↗
            </LiquidLink>
            <LiquidLink to="/about">
              MORE ABOUT ME ↓
            </LiquidLink>
          </div>

          <div className="hero-social">
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              GH &nbsp; GITHUB ↗
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
            >
              IN &nbsp; LINKEDIN ↗
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-artwork">
            <div className="artwork-inner">
              <div className="visual-grid" />
              <div className="orbit-ring ring-one" />
              <div className="orbit-ring ring-two" />
              <div className="orbit-ring ring-three" />
              <div className="glass-drop glass-drop-one" />
              <div className="glass-drop glass-drop-two" />
              <div className="glass-drop glass-drop-three" />
              <div className="glass-drop glass-drop-four" />

              <div className="visual-core">
                <div className="core-inner">
                  <span className="core-symbol">
                    A<span>.</span>
                  </span>
                  <span className="core-caption">
                    DESIGN / DEVELOP / CREATE
                  </span>
                </div>
              </div>
            </div>

            <div className="floating-label label-top">
              <span>01 /</span> CREATIVE THINKING
            </div>
            <div className="floating-label label-bottom">
              <span>02 /</span> BUILDING IDEAS
            </div>
            <div className="visual-index">
              FIG. 001 — LIQUID FORM
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <span>BASED IN INDIA</span>
          <a href="#about">SCROLL TO EXPLORE ↓</a>
          <span>© 2026 ADI</span>
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="section about-preview" id="about">
        <div className="section-top reveal">
          <span>01 / A LITTLE ABOUT ME</span>
          <span>DEVELOPER / CREATIVE THINKER</span>
        </div>

        <div className="about-preview-grid">
          <h2 className="display-heading reveal">
            NOT JUST
            <br />
            WRITING <em>CODE.</em>
            <br />
            BUILDING <em>IDEAS.</em>
          </h2>

          <div className="about-preview-copy reveal">
            <p className="eyebrow">HELLO, I'M ADITYA.</p>
            <p>
              I'm a Computer Science student exploring the
              intersection of development, design and visual
              storytelling.
            </p>
            <p>
              I like understanding how things work, learning
              new tools and turning ideas into experiences
              people can actually use.
            </p>
            <LiquidLink to="/about">MORE ABOUT ME ↗</LiquidLink>
          </div>
        </div>
      </section>

      {/* PERSONAL PROJECTS */}
      <section className="section home-work">
        <div className="section-top reveal">
          <span>02 / PERSONAL PROJECTS</span>
          <span>BUILDS & EXPERIMENTS</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            A FEW THINGS
            <br />
            <em>IN THE WORKS.</em>
          </h2>
          <p>
            Ideas, experiments and projects that are part
            of my development journey.
          </p>
        </div>

        {projectsLoading ? (
          <p className="home-project-loading">LOADING PROJECTS...</p>
        ) : featuredProjects.length > 0 ? (
          <div className="home-carousel-stage">
            <button
              className="carousel-arrow carousel-arrow-prev"
              type="button"
              aria-label="Previous personal project"
              disabled={featuredProjects.length < 2}
              onClick={() => scrollCarousel(projectCarouselRef, -1)}
            >
              ←
            </button>

            <div
              className="featured-grid mobile-carousel mobile-project-carousel"
              ref={projectCarouselRef}
            >
              {featuredProjects.map((project, index) => (
                <Link
                  to={`/projects/${project.slug}`}
                  className={`float-card mobile-carousel-card home-dynamic-project-card ${
                    index % 2 === 0 ? "levelup-visual" : "web-visual"
                  }`}
                  key={project.id}
                  aria-label={`View ${project.title} project`}
                >
                  <div className="float-card-art">
                    {project.cover_image_url && (
                      <img
                        className="home-project-cover"
                        src={project.cover_image_url}
                        alt={`${project.title} cover`}
                        loading="lazy"
                      />
                    )}

                    <div className="home-project-shade" />
                    <span className="card-number">
                      {String(index + 1).padStart(2, "0")} / FEATURED
                    </span>

                    <div className="card-art-type">
                      {project.title}
                      <small>{project.category}</small>
                    </div>

                    <span className="card-art-footer">
                      PERSONAL PROJECT / ADI
                    </span>
                    <span className="project-art-symbol">
                      {index % 2 === 0 ? "↗" : "◈"}
                    </span>
                    <span className="home-project-status">
                      {project.status}
                    </span>
                  </div>

                  <div className="float-card-info">
                    <div>
                      <span className="eyebrow">{project.category}</span>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                    <span className="card-arrow">↗</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              className="carousel-arrow carousel-arrow-next"
              type="button"
              aria-label="Next personal project"
              disabled={featuredProjects.length < 2}
              onClick={() => scrollCarousel(projectCarouselRef, 1)}
            >
              →
            </button>
          </div>
        ) : (
          <p className="home-project-loading">
            NEW PROJECTS ARE TAKING SHAPE. CHECK BACK SOON.
          </p>
        )}

        <div className="center-action reveal">
          <LiquidLink to="/projects">
            VIEW ALL PERSONAL PROJECTS ↗
          </LiquidLink>
        </div>
      </section>

      {/* CLIENT WORK */}
      <section className="section client-work-preview">
        <div className="section-top reveal">
          <span>03 / SELECTED CLIENT WORK</span>
          <span>COLLABORATIONS & REAL-WORLD BUILDS</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            BUILT FOR
            <br />
            <em>OTHERS.</em>
          </h2>
          <p>
            A selection of work created through collaboration,
            turning other people's ideas and requirements
            into digital experiences.
          </p>
        </div>

        <div className="home-carousel-stage">
          <button
            className="carousel-arrow carousel-arrow-prev"
            type="button"
            aria-label="Previous client project"
            disabled={clientWorks.length < 2}
            onClick={() => scrollCarousel(clientCarouselRef, -1)}
          >
            ←
          </button>

          <div
            className="featured-grid mobile-carousel mobile-client-carousel"
            ref={clientCarouselRef}
          >
            {clientWorks.map((project) => (
              <Link
                to="/client-work/bone-jam"
                className={`float-card mobile-carousel-card ${project.visual}`}
                key={project.number}
                aria-label="View Bone Jam case study"
              >
                <div className="float-card-art">
                  <span className="card-number">
                    {project.number} / CLIENT WORK
                  </span>
                  <div className="card-art-type">
                    BONE JAM
                    <small>CUSTOM MINECRAFT CREATIONS</small>
                  </div>
                  <span className="card-art-footer">
                    COLLABORATION / ADI
                  </span>
                  <span className="project-art-symbol">
                    {project.symbol}
                  </span>
                </div>

                <div className="float-card-info">
                  <div>
                    <span className="eyebrow">{project.category}</span>
                    <h3>BONE JAM</h3>
                    <p>{project.description}</p>
                  </div>
                  <span className="card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            className="carousel-arrow carousel-arrow-next"
            type="button"
            aria-label="Next client project"
            disabled={clientWorks.length < 2}
            onClick={() => scrollCarousel(clientCarouselRef, 1)}
          >
            →
          </button>
        </div>

        <div className="center-action reveal">
          <LiquidLink to="/client-work">
            VIEW ALL CLIENT WORK ↗
          </LiquidLink>
        </div>
      </section>

      {/* TOOLKIT */}
      <section className="section home-expertise">
        <div className="section-top reveal">
          <span>04 / WHAT I WORK WITH</span>
          <span>ALWAYS LEARNING</span>
        </div>

        <div className="section-heading-row reveal">
          <h2 className="display-heading">
            MY CURRENT
            <br />
            <em>TOOLKIT.</em>
          </h2>
          <p>
            Technologies and creative tools I'm learning
            and exploring.
          </p>
        </div>

        <div className="home-carousel-stage toolkit-carousel-stage">
          <button
            className="carousel-arrow carousel-arrow-prev"
            type="button"
            aria-label="Previous toolkit category"
            onClick={() =>
              setToolIndex((previous) =>
                (previous - 1 + tools.length) % tools.length
              )
            }
          >
            ←
          </button>

          <div
            className="toolkit-carousel-viewport"
            ref={toolkitViewportRef}
            onPointerDown={handleToolkitPointerDown}
            onPointerMove={handleToolkitPointerMove}
            onPointerUp={finishToolkitDrag}
            onPointerCancel={finishToolkitDrag}
            onLostPointerCapture={finishToolkitDrag}
            style={{ touchAction: "pan-y", cursor: toolkitIsDragging ? "grabbing" : "grab" }}
          >
            <div className="toolkit-carousel-track">
              {tools.map((tool, index) => {
                const position =
                  (index - toolIndex + tools.length) % tools.length;

                const positionClass =
                  position === 0
                    ? "active"
                    : position === 1
                    ? "next"
                    : "previous";
                const signedPosition = position === 0 ? 0 : position === 1 ? 1 : -1;
                const spacing = typeof window !== "undefined" && window.innerWidth <= 700 ? 86 : 53;
                const offset = `calc(${signedPosition * spacing}vw + ${toolkitDragX}px)`;
                const scale = position === 0 ? 1 : 0.78;
                const opacity = position === 0 ? 1 : 0.5;

                return (
                  <article
                    className={`toolkit-slide ${positionClass}${toolkitIsDragging ? " is-dragging" : ""}`}
                    style={{
                      transform: `translate(calc(-50% + ${offset}), -50%) scale(${scale})`,
                      opacity,
                      transition: toolkitIsDragging ? "none" : undefined,
                    }}
                    key={tool.number}
                    aria-hidden={position !== 0}
                  >
                    <span>{tool.number}</span>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <button
            className="carousel-arrow carousel-arrow-next"
            type="button"
            aria-label="Next toolkit category"
            onClick={() =>
              setToolIndex((previous) => (previous + 1) % tools.length)
            }
          >
            →
          </button>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="contact-cta section" id="contact-cta">
        <div className="section-top reveal">
          <span>05 / HAVE SOMETHING IN MIND?</span>
          <span>LET'S CREATE</span>
        </div>

        <div className="cta-main reveal">
          <p className="eyebrow">
            GOOD IDEAS START WITH A CONVERSATION.
          </p>
          <h2>
            LET'S MAKE
            <br />
            <em>IT HAPPEN.</em>
          </h2>
          <LiquidLink to="/contact" variant="solid">
            LET'S TALK ↗
          </LiquidLink>
        </div>
      </section>
    </main>
  );
}