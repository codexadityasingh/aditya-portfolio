
import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

export default function LiquidLink({
  children,
  href,
  to,
  onClick,
  className = "",
  external = false,
  variant = "glass",
}) {
  const linkRef = useRef(null);

  const handleMove = (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const element = linkRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    element.style.setProperty("--mouse-x", `${x}px`);
    element.style.setProperty("--mouse-y", `${y}px`);

    const rotateX = (y / rect.height - 0.5) * -8;
    const rotateY = (x / rect.width - 0.5) * 8;

    gsap.to(element, {
      y: -3,
      rotateX,
      rotateY,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: 700,
    });
  };

  const handleLeave = () => {
    if (!linkRef.current) return;

    gsap.to(linkRef.current, {
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.55,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const linkClass = `liquid-link liquid-link--${variant} ${className}`;

  const sharedProps = {
    ref: linkRef,
    onClick,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    className: linkClass,
  };

  const content = (
    <span className="liquid-link-content">{children}</span>
  );

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href || "#"}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      {...sharedProps}
    >
      {content}
    </a>
  );
}
