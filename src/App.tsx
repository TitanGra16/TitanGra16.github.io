import { useCallback, useState } from "react";
import Navbar from "./components/Navbar";
import TitanGraIntro from "./components/TitanGraIntro";

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
            <p className="section-kicker">About</p>
            <h2>Clean code, sharp interfaces, and systems built to last.</h2>
          </div>
        </section>

        <section id="projects" className="content-section">
          <div className="section-inner">
            <p className="section-kicker">Projects</p>
            <h2>Selected work will live here as the portfolio grows.</h2>
          </div>
        </section>

        <section id="contact" className="content-section">
          <div className="section-inner">
            <p className="section-kicker">Contact</p>
            <h2>Open to focused collaborations and ambitious builds.</h2>
          </div>
        </section>
      </main>
    </div>
  );
}
