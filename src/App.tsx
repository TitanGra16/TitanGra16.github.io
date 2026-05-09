import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import TitanGraIntro from "./components/TitanGraIntro";

const focusAreas = [
  {
    title: "Systems Programming",
    description:
      "Interest in C and C++, memory management, low-level logic, and strong programming foundations built through my university coursework."
  },
  {
    title: "Java & Application Logic",
    description:
      "Projects focused on modular architecture, state management, console applications, and algorithmic reasoning."
  },
  {
    title: "Web Development",
    description:
      "Experiments and applications with PHP, SQL, JavaScript, TypeScript, React, PWA, and responsive browser-first interfaces."
  },
  {
    title: "Linux & Network Analysis",
    description:
      "Study and hands-on practice with Linux environments, Kali Linux, and tools like Wireshark for traffic inspection, protocol analysis, and network behavior."
  }
];

const stats = [
  { value: "CS", label: "Computer Science" },
  { value: "C/C++", label: "system-side interest" },
  { value: "Web", label: "PHP, SQL, JS, TypeScript" },
  { value: "Tools", label: "Linux, Kali, Wireshark" }
];

const projects = [
  {
    status: "PWA",
    title: "PS3 Home Button Helper",
    description:
      "A lightweight web app that sends the PS/Home button command to a compatible PS3 from a phone, tablet, or PC. A practical project bridging browser tech, local networking, and real-device interaction.",
    tags: ["JavaScript", "PWA", "Local Network", "PS3"],
    repo: "https://github.com/TitanGra16/ps3-home-button-helper",
    live: "https://titangra16.github.io/ps3-home-button-helper/"
  },
  {
    status: "Java",
    title: "Tic-Tac-Toe Java",
    description:
      "A terminal-based Tic-Tac-Toe game with Player vs Player and Player vs Computer modes. Showcases game logic management, modular structure, and attention to console UX.",
    tags: ["Java", "Console", "Game Logic", "OOP"],
    repo: "https://github.com/TitanGra16/Tic-Tac-Toe-Java"
  },
  {
    status: "PHP",
    title: "Order Simulation",
    description:
      "A web platform for simulating custom order creation. Represents the classic web side of the portfolio, with PHP and application logic oriented around a concrete user flow.",
    tags: ["PHP", "Web", "Forms", "Order Flow"],
    repo: "https://github.com/TitanGra16/Simulazione_Ordine"
  },
  {
    status: "Portfolio",
    title: "TitanGra Portfolio",
    description:
      "This very site: a React + TypeScript portfolio with a canvas intro, cyber aesthetic, responsive layout, and automated deployment to GitHub Pages.",
    tags: ["React", "TypeScript", "Canvas", "Vite"],
    repo: "https://github.com/TitanGra16/TitanGra16.github.io",
    live: "https://titangra16.github.io/"
  }
];

const skills = [
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
  "Git",
  "GitHub Pages"
];

const processSteps = [
  {
    step: "01",
    title: "Study the Fundamentals",
    description:
      "Algorithms, data structures, logic, C/C++ and Java programming: I understand the behavior first, then I build."
  },
  {
    step: "02",
    title: "Prototype on the Web",
    description:
      "I turn small ideas into usable interfaces with PHP, SQL, JavaScript, TypeScript, and React."
  },
  {
    step: "03",
    title: "Analyze Systems & Networks",
    description:
      "I use Linux, Kali Linux, and Wireshark to observe traffic, protocols, and technical details that often remain invisible."
  },
  {
    step: "04",
    title: "Refine & Publish",
    description:
      "I clean up code, test responsive design, then bring projects online with Git, GitHub, and GitHub Pages."
  }
];

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const updateParallax = () => {
      animationFrame = 0;
      const scrollY = window.scrollY;
      const root = document.documentElement;

      root.style.setProperty("--parallax-slow", `${scrollY * -0.035}px`);
      root.style.setProperty("--parallax-medium", `${scrollY * -0.065}px`);
      root.style.setProperty("--parallax-fast", `${scrollY * -0.11}px`);
    };

    const requestUpdate = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateParallax);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div className={`app-shell ${introComplete ? "is-ready" : ""}`}>
      <Navbar visible={introComplete} />

      <main>
        <TitanGraIntro onIntroComplete={handleIntroComplete} />

        <section id="about" className="content-section content-section--first">
          <div className="section-depth section-depth--about-a" aria-hidden="true" />
          <div className="section-depth section-depth--about-b" aria-hidden="true" />

          <div className="section-inner">
            <div className="section-header">
              <p className="section-kicker">About</p>
              <h2>Computer Science student with a technical soul.</h2>
              <p className="section-lede">
                I study Computer Science at university and enjoy exploring
                both system-level programming with C and C++, application
                development with Java, and the web world with PHP, SQL,
                JavaScript, and TypeScript.
              </p>
            </div>

            <div className="about-layout">
              <div className="about-panel about-panel--main">
                <p>
                  I'm interested in understanding how things truly work: from
                  the logic of a console program to the architecture of a web
                  app, all the way to deploying projects online and analyzing
                  network traffic with tools like Wireshark. That's why I
                  alternate between university projects, small personal tools,
                  Linux/Kali environments, and more experimental web interfaces.
                </p>
                <p>
                  TitanGra is my space to collect this journey: code, study,
                  technical curiosity, and projects that grow over time.
                </p>
              </div>

              <div className="stat-grid" aria-label="Portfolio stack highlights">
                {stats.map((item) => (
                  <div className="stat-card" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="skill-strip" aria-label="Technologies and interests">
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <div className="focus-grid">
              {focusAreas.map((area, index) => (
                <article className="focus-card" key={area.title}>
                  <span className="card-index">0{index + 1}</span>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="lab" className="content-section content-section--lab">
          <div className="section-depth section-depth--lab-a" aria-hidden="true" />
          <div className="section-depth section-depth--lab-b" aria-hidden="true" />

          <div className="section-inner lab-layout">
            <div className="section-header lab-header">
              <p className="section-kicker">Lab Process</p>
              <h2>A technical journey, not a static showcase.</h2>
              <p className="section-lede">
                The site structure works as a sequence: cinematic entrance,
                identity, method, projects, and contact. Every section stays
                alive with lightweight, readable parallax layers.
              </p>
            </div>

            <div className="lab-console" aria-label="TitanGra technical process">
              <div className="lab-console__screen">
                <span className="lab-console__eyebrow">/usr/titangra/process</span>
                <strong>Computer Science</strong>
                <p>C/C++ . Java . PHP . SQL . Linux . Network Analysis</p>
                <div className="lab-console__grid" aria-hidden="true" />
              </div>
            </div>

            <div className="process-list">
              {processSteps.map((item) => (
                <article className="process-item" key={item.step}>
                  <span>{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="content-section">
          <div className="section-depth section-depth--projects-a" aria-hidden="true" />
          <div className="section-depth section-depth--projects-b" aria-hidden="true" />

          <div className="section-inner">
            <div className="section-header">
              <p className="section-kicker">Projects</p>
              <h2>Personal projects and representative repositories.</h2>
              <p className="section-lede">
                I've selected the public projects that best represent my current
                path: web apps, Java, PHP, and this portfolio.
              </p>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.title}>
                  <div className="project-card__top">
                    <span>{project.status}</span>
                    <div className="project-links">
                      {"live" in project && project.live ? (
                        <a href={project.live} target="_blank" rel="noreferrer">
                          Live
                        </a>
                      ) : null}
                      <a href={project.repo} target="_blank" rel="noreferrer">
                        Code
                      </a>
                    </div>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="tag-list" aria-label={`${project.title} stack`}>
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="content-section">
          <div className="section-depth section-depth--contact-a" aria-hidden="true" />

          <div className="section-inner">
            <div className="contact-layout">
              <div className="section-header">
                <p className="section-kicker">Contact</p>
                <h2>I study, I build, I improve.</h2>
                <p className="section-lede">
                  Want to follow my projects, see how they evolve, or reach out
                  for ideas and collaborations? Here are the main links.
                </p>
              </div>

              <div className="contact-actions" aria-label="Contact links">
                <a href="mailto:titangra.dev@gmail.com">
                  <span>Email</span>
                  titangra.dev@gmail.com
                </a>
                <a href="https://github.com/TitanGra16" target="_blank" rel="noreferrer">
                  <span>GitHub</span>
                  github.com/TitanGra16
                </a>
                <a href="#projects">
                  <span>Work</span>
                  Explore projects
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
