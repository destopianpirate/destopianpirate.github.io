"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  useMotionValueEvent
} from "framer-motion";
import ReactLenis from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef, useState } from "react";
import { Github, ExternalLink, Sparkles } from "lucide-react";
import "./StickyProjects.css";

export const StickyCard_003 = ({
  project,
  idx,
  total,
  theme,
  techLogos = {},
  isDarkLogo = () => false
}) => {
  // Skiper 34 exact vertical margin constant
  const vertMargin = 10;
  const container = useRef(null);
  const [maxScrollY, setMaxScrollY] = useState(Infinity);

  const filter = useMotionValue(0);
  const negateFilter = useTransform(filter, (value) => -value);
  const scale = useMotionValue(1);

  const { scrollY } = useScroll({
    target: container,
  });

  const isInView = useInView(container, {
    margin: `0px 0px -${100 - vertMargin}% 0px`,
    once: true,
  });

  // Skiper 34 exact scroll animation equation:
  // animationValue = Math.max(0, 1 - (scrollY - maxScrollY) / 10000)
  // scale = animationValue
  // filter = (1 - animationValue) * 100
  useMotionValueEvent(scrollY, "change", (latestScrollY) => {
    let animationValue = 1;
    if (latestScrollY > maxScrollY) {
      // Clamped to 0.80 so the card doesn't vanish when stacking 11 repositories
      animationValue = Math.max(0.80, 1 - (latestScrollY - maxScrollY) / 10000);
    }

    scale.set(animationValue);
    filter.set((1 - animationValue) * 100);
  });

  // Calculate and synchronize sticky trigger point dynamically
  useEffect(() => {
    const updatePosition = () => {
      if (container.current) {
        const topPx = (window.innerHeight * vertMargin) / 100;
        const rect = container.current.getBoundingClientRect();
        const calculatedMax = window.scrollY + rect.top - Math.max(75, topPx);
        if (calculatedMax > 0) {
          setMaxScrollY(calculatedMax);
        }
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [vertMargin]);

  useEffect(() => {
    if (isInView && maxScrollY === Infinity) {
      setMaxScrollY(scrollY.get());
    }
  }, [isInView, scrollY, maxScrollY]);

  const cardNumber = String(idx + 1).padStart(2, "0");
  const totalCards = String(total).padStart(2, "0");

  return (
    <motion.div
      ref={container}
      className="rounded-4xl sticky-project-card-wrapper"
      style={{
        scale: scale,
        rotate: filter,
        top: `clamp(75px, ${vertMargin}vh, 95px)`,
        zIndex: idx + 1,
      }}
    >
      <motion.div
        className="sticky-project-card-inner"
        style={{
          rotate: negateFilter,
        }}
      >
        {/* Background Watermark Icon */}
        <div
          className={`project-bg-icon ${project.hasImageLogo ? "image-watermark" : ""} ${
            project.title.includes("AcadX") ? "acadx-bg-icon" : ""
          } ${project.title.includes("AssignmentAI") ? "assignmentai-bg-icon" : ""} ${
            project.title.includes("ImagePress") || project.title.includes("Compressor") ? "compressor-bg-icon" : ""
          } ${project.title.includes("QS IITGN") ? "qs-bg-icon" : ""} ${
            project.title.includes("FamShield") ? "famshield-bg-icon" : ""
          } ${project.title.includes("CloudForge") ? "cloudforge-bg-icon" : ""} ${
            project.title.includes("Octrops") ? "octrops-bg-icon" : ""
          } ${project.title.includes("Manthan") ? "manthan-bg-icon" : ""}`}
        >
          {project.logo}
        </div>

        {/* Card Body Grid */}
        <div className="sticky-card-layout">
          {/* Left Column: Meta & Info */}
          <div className="sticky-card-left">
            <div className="sticky-card-top-row">
              <div className="sticky-card-brand">
                <div className={`project-logo-container ${project.hasImageLogo ? "white-bg" : ""}`}>
                  {project.logo}
                </div>
                <div>
                  <span className="sticky-card-index">{cardNumber} / {totalCards}</span>
                  <h3 className="sticky-project-title">{project.title}</h3>
                </div>
              </div>

              <div className="sticky-card-actions">
                {(project.title.includes("AcadX") ||
                  project.title.includes("Image Compressor") ||
                  project.title.includes("ImagePress") ||
                  project.title.includes("QS") ||
                  project.title.includes("FamShield") ||
                  project.title.includes("CloudForge") ||
                  project.title.includes("Octrops") ||
                  project.title.includes("Manthan")) && (
                  <span className="featured-badge">Featured</span>
                )}
                <a
                  href={project.repoUrl || "https://github.com/destopianpirate"}
                  target="_blank"
                  rel="noreferrer"
                  className="project-link-btn"
                  title="View GitHub Repository"
                >
                  <Github size={16} />
                </a>
              </div>
            </div>

            <p className="sticky-project-desc">{project.desc}</p>

            <div className="sticky-project-stack">
              {project.stack.map((tech) => (
                <span className="tech-pill" key={tech} title={tech}>
                  {techLogos[tech] ? (
                    <img
                      src={techLogos[tech]}
                      alt={tech}
                      style={{
                        width: 18,
                        height: 18,
                        filter: theme === "dark" && isDarkLogo(techLogos[tech]) ? "invert(1)" : "none",
                      }}
                    />
                  ) : (
                    tech
                  )}
                </span>
              ))}
            </div>

            {project.liveUrl && (
              <div className="sticky-visit-cta-wrapper">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="project-visit-btn sticky-visit-btn"
                >
                  <span>Visit Site</span>
                  <ExternalLink size={15} style={{ marginLeft: "6px" }} />
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Key Core Features */}
          <div className="sticky-card-right">
            {project.features && project.features.length > 0 && (
              <div className="sticky-features-box">
                <div className="sticky-bullet-header">
                  <Sparkles size={15} className="sparkle-accent" />
                  <span>Key Core Features</span>
                </div>
                <ul className="sticky-features-list">
                  {project.features.map((feature, fIdx) => (
                    <li key={fIdx} className="sticky-feature-item">
                      <span className="sticky-bullet-diamond">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Skiper34 = ({ projects, theme, techLogos, isDarkLogo }) => {
  return (
    <ReactLenis root>
      <section className="sticky-projects-section">
        <div className="sticky-scroll-hint">
          <span className="sticky-hint-text">
            Scroll down to see effect
          </span>
          <div className="sticky-hint-line"></div>
        </div>

        <div className="sticky-cards-stack">
          {projects.map((project, idx) => (
            <StickyCard_003
              key={project.title || idx}
              project={project}
              idx={idx}
              total={projects.length}
              theme={theme}
              techLogos={techLogos}
              isDarkLogo={isDarkLogo}
            />
          ))}
        </div>
      </section>
    </ReactLenis>
  );
};

export default Skiper34;
