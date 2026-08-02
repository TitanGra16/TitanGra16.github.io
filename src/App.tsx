import { useEffect } from "react";
import Navbar from "./components/Navbar";
import TitanGraIntro from "./components/TitanGraIntro";

const capabilities = [
  {
    number: "01",
    title: "Systems & foundations",
    description:
      "C and C++ are where I sharpen my understanding of memory, algorithms, data structures, and the mechanics beneath software.",
    stack: "C · C++ · Algorithms"
  },
  {
    number: "02",
    title: "Application logic",
    description:
      "I use Java to turn requirements into modular programs, with deliberate state management, clear structure, and reliable behavior.",
    stack: "Java · OOP · Architecture"
  },
  {
    number: "03",
    title: "Web experiences",
    description:
      "From PHP and SQL to React and TypeScript, I build responsive interfaces around concrete, useful flows.",
    stack: "React · TypeScript · PHP · SQL"
  },
  {
    number: "04",
    title: "Linux & networks",
    description:
      "I explore Linux environments, protocols, and traffic analysis to understand what happens beyond the interface.",
    stack: "Linux · Kali · Wireshark"
  }
];

const projects = [
  {
    number: "01",
    status: "PWA · Featured",
    title: "PS3 Home Button Helper",
    description:
      "A lightweight web app that lets a phone, tablet, or computer send the PS/Home command to a compatible PlayStation 3 over the local network.",
    tags: ["JavaScript", "PWA", "Local network", "PS3"],
    repo: "https://github.com/TitanGra16/ps3-home-button-helper",
    live: "https://titangra16.github.io/ps3-home-button-helper/",
    visual: "signal"
  },
  {
    number: "02",
    status: "Java",
    title: "Tic-Tac-Toe",
    description:
      "A terminal game with Player vs Player and Player vs Computer modes, built around clean game-state logic and a focused console experience.",
    tags: ["Java", "OOP", "Game logic", "Console"],
    repo: "https://github.com/TitanGra16/Tic-Tac-Toe-Java",
    visual: "grid"
  },
  {
    number: "03",
    status: "PHP",
    title: "Order Simulation",
    description:
      "A web platform for assembling a custom order through a complete, structured user flow powered by PHP application logic.",
    tags: ["PHP", "Forms", "Web", "Order flow"],
    repo: "https://github.com/TitanGra16/Simulazione_Ordine",
    visual: "stack"
  },
  {
    number: "04",
    status: "React · TypeScript",
    title: "TitanGra Portfolio",
    description:
      "This evolving digital home: an interactive, accessible portfolio with a fluid canvas environment and automated GitHub Pages delivery.",
    tags: ["React", "TypeScript", "Canvas", "Vite"],
    repo: "https://github.com/TitanGra16/TitanGra16.github.io",
    live: "https://titangra16.github.io/",
    visual: "orbit"
  }
];

const tools = [
  "C",
  "C++",
  "Java",
  "PHP",
  "SQL",
  "JavaScript",
  "TypeScript",
  "React",
  "Python",
  "Linux",
  "Kali Linux",
  "Wireshark",
  "Git"
];

const principles = [
  {
    step: "01",
    title: "Understand",
    description:
      "I break the problem down and study the system before choosing the implementation."
  },
  {
    step: "02",
    title: "Build",
    description:
      "I prototype the smallest useful version, then give the code a clear, maintainable structure."
  },
  {
    step: "03",
    title: "Refine",
    description:
      "I test the details, improve the experience, and publish what is ready to keep learning in public."
  }
];

export default function App() {
  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-block")
    );

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.06
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Navbar />

      <main id="main-content">
        <TitanGraIntro />

        <section id="about" className="section section--about">
          <div className="section__inner">
            <div className="section-heading reveal-block">
              <p className="eyebrow">
                <span>01</span> About
              </p>
              <h2>
                Learning the layers between an idea and a system that works.
              </h2>
            </div>

            <div className="about-grid">
              <div className="about-copy reveal-block">
                <p className="about-copy__lead">
                  I am a Computer Science student who likes to move between
                  levels: from low-level logic to a polished interface, and
                  from a network packet to the product a person actually uses.
                </p>
                <p>
                  My work grows through university study, personal experiments,
                  and small practical tools. I care about understanding the
                  reason behind a solution—not only making it run once.
                </p>
                <a className="text-link" href="#projects">
                  Explore selected work <span aria-hidden="true">↘</span>
                </a>
              </div>

              <aside className="profile-card reveal-block" aria-label="Profile summary">
                <div className="profile-card__mark">
                  <img src="/logo.png" alt="" />
                </div>
                <dl>
                  <div>
                    <dt>Current path</dt>
                    <dd>Computer Science</dd>
                  </div>
                  <div>
                    <dt>Based in</dt>
                    <dd>Italy</dd>
                  </div>
                  <div>
                    <dt>Main focus</dt>
                    <dd>Software · Systems · Web</dd>
                  </div>
                  <div>
                    <dt>Mindset</dt>
                    <dd>Curious by default</dd>
                  </div>
                </dl>
              </aside>
            </div>

            <div className="capability-grid" aria-label="Areas of focus">
              {capabilities.map((capability) => (
                <article className="capability-card reveal-block" key={capability.title}>
                  <span className="capability-card__number">{capability.number}</span>
                  <div>
                    <h3>{capability.title}</h3>
                    <p>{capability.description}</p>
                  </div>
                  <span className="capability-card__stack">{capability.stack}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="section section--projects">
          <div className="section__inner">
            <div className="section-heading section-heading--split reveal-block">
              <div>
                <p className="eyebrow">
                  <span>02</span> Selected work
                </p>
                <h2>Projects built to turn learning into something tangible.</h2>
              </div>
              <p>
                A focused selection of public work across web development,
                Java, PHP, local networking, and interface experimentation.
              </p>
            </div>

            <div className="project-grid">
              {projects.map((project, index) => (
                <article
                  className={`project-card project-card--${project.visual} ${
                    index === 0 ? "project-card--featured" : ""
                  } reveal-block`}
                  key={project.title}
                >
                  <div className="project-card__visual" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="project-card__content">
                    <div className="project-card__meta">
                      <span>{project.number}</span>
                      <span>{project.status}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tag-list" aria-label={`${project.title} technologies`}>
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="project-card__links">
                      {project.live ? (
                        <a href={project.live} target="_blank" rel="noreferrer">
                          View live <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                      <a href={project.repo} target="_blank" rel="noreferrer">
                        Source code <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="section section--process">
          <div className="section__inner">
            <div className="process-layout">
              <div className="section-heading reveal-block">
                <p className="eyebrow">
                  <span>03</span> How I work
                </p>
                <h2>A simple loop: understand, build, refine.</h2>
                <p className="section-heading__lede">
                  The tools change. The habit of looking closely, building
                  deliberately, and improving with evidence does not.
                </p>
              </div>

              <div className="principle-list">
                {principles.map((principle) => (
                  <article className="principle reveal-block" key={principle.step}>
                    <span>{principle.step}</span>
                    <div>
                      <h3>{principle.title}</h3>
                      <p>{principle.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="toolbox reveal-block">
              <div className="toolbox__label">
                <span>Toolkit</span>
                <small>Always evolving</small>
              </div>
              <div className="toolbox__items" aria-label="Technical toolkit">
                {tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="section section--contact">
          <div className="section__inner">
            <div className="contact-panel reveal-block">
              <div className="contact-panel__orb" aria-hidden="true" />
              <p className="eyebrow">
                <span>04</span> Contact
              </p>
              <h2>Have an idea, an opportunity, or simply want to connect?</h2>
              <p>
                I am always interested in thoughtful projects, technical
                conversations, and new things worth learning.
              </p>
              <div className="contact-panel__actions">
                <a className="button button--primary" href="mailto:titangra.dev@gmail.com">
                  Send me an email <span aria-hidden="true">↗</span>
                </a>
                <a
                  className="button button--ghost"
                  href="https://github.com/TitanGra16"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub profile
                </a>
              </div>
            </div>

            <footer className="footer">
              <a className="footer__brand" href="#home" aria-label="Back to top">
                TitanGra<span>.</span>
              </a>
              <p>Designed and built with curiosity in Italy.</p>
              <a href="#home">Back to top ↑</a>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
