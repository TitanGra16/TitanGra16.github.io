import { useCallback, useState } from "react";
import Navbar from "./components/Navbar";
import TitanGraIntro from "./components/TitanGraIntro";

const focusAreas = [
  {
    title: "Programmazione di sistema",
    description:
      "Interesse per C e C++, gestione della memoria, logica a basso livello e basi solide di programmazione studiate nel percorso universitario."
  },
  {
    title: "Java e logica applicativa",
    description:
      "Progetti orientati a strutture modulari, gestione dello stato, applicazioni da terminale e ragionamento algoritmico."
  },
  {
    title: "Web development",
    description:
      "Esperimenti e applicazioni con PHP, SQL, JavaScript, TypeScript, React, PWA e interfacce responsive pensate per il browser."
  },
  {
    title: "Linux e network analysis",
    description:
      "Studio e sperimentazione con ambienti Linux, Kali Linux e strumenti come Wireshark per osservare traffico, protocolli e comportamento delle reti."
  }
];

const stats = [
  { value: "CS", label: "Scienze dell'Informazione" },
  { value: "C/C++", label: "interesse system-side" },
  { value: "Web", label: "PHP, SQL, JS, TypeScript" },
  { value: "Tools", label: "Linux, Kali, Wireshark" }
];

const projects = [
  {
    status: "PWA",
    title: "PS3 Home Button Helper",
    description:
      "Una web app leggera che permette di inviare il comando PS/Home a una PS3 compatibile da telefono, tablet o PC. Un progetto pratico tra browser, rete locale e interazione con un dispositivo reale.",
    tags: ["JavaScript", "PWA", "Local Network", "PS3"],
    repo: "https://github.com/TitanGra16/ps3-home-button-helper",
    live: "https://titangra16.github.io/ps3-home-button-helper/"
  },
  {
    status: "Java",
    title: "Tic-Tac-Toe Java",
    description:
      "Gioco del Tris da terminale con modalita Player vs Player e Player vs Computer. Mostra gestione della logica di gioco, struttura modulare e attenzione all'esperienza console.",
    tags: ["Java", "Console", "Game Logic", "OOP"],
    repo: "https://github.com/TitanGra16/Tic-Tac-Toe-Java"
  },
  {
    status: "PHP",
    title: "Simulazione Ordine",
    description:
      "Piattaforma web per simulare la creazione di ordini personalizzati. Rappresenta il lato web classico del portfolio, con PHP e logica applicativa orientata a un flusso utente concreto.",
    tags: ["PHP", "Web", "Forms", "Order Flow"],
    repo: "https://github.com/TitanGra16/Simulazione_Ordine"
  },
  {
    status: "Portfolio",
    title: "TitanGra Portfolio",
    description:
      "Questo sito: portfolio React + TypeScript con intro canvas, stile cyber, layout responsive e deploy automatico su GitHub Pages.",
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

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div className={`app-shell ${introComplete ? "is-ready" : ""}`}>
      <Navbar visible={introComplete} />

      <main>
        <TitanGraIntro onIntroComplete={handleIntroComplete} />

        <section id="about" className="content-section content-section--first">
          <div className="section-inner">
            <div className="section-header">
              <p className="section-kicker">About</p>
              <h2>Studente di Scienze dell'Informazione con anima tecnica.</h2>
              <p className="section-lede">
                Studio Scienze dell'Informazione all'universita e mi piace
                esplorare sia la programmazione piu vicina al sistema, come C e
                C++, sia lo sviluppo applicativo con Java e il mondo web con PHP,
                SQL, JavaScript e TypeScript.
              </p>
            </div>

            <div className="about-layout">
              <div className="about-panel about-panel--main">
                <p>
                  Mi interessa capire come funzionano davvero le cose: dalla
                  logica di un programma console alla struttura di una web app,
                  fino al deploy di un progetto online e all'analisi di rete con
                  strumenti come Wireshark. Per questo alterno progetti
                  universitari, piccoli tool personali, ambienti Linux/Kali e
                  interfacce web piu sperimentali.
                </p>
                <p>
                  TitanGra e il mio spazio per raccogliere questo percorso:
                  codice, studio, curiosita tecnica e progetti che crescono nel
                  tempo.
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

        <section id="projects" className="content-section">
          <div className="section-inner">
            <div className="section-header">
              <p className="section-kicker">Projects</p>
              <h2>Progetti personali e repository rappresentativi.</h2>
              <p className="section-lede">
                Ho selezionato i progetti pubblici che rappresentano meglio il
                mio percorso attuale: web app, Java, PHP e questo portfolio.
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
          <div className="section-inner">
            <div className="contact-layout">
              <div className="section-header">
                <p className="section-kicker">Contact</p>
                <h2>Studio, progetto, miglioro.</h2>
                <p className="section-lede">
                  Se vuoi seguire i miei progetti, vedere come evolvono o
                  contattarmi per idee e collaborazioni, trovi qui i link
                  principali.
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
