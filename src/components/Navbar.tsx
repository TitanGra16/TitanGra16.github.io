import { useEffect, useState } from "react";

const navigation = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setScrolled(window.scrollY > 24);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <a className="navbar__brand" href="#home" aria-label="TitanGra, back to top">
          TitanGra<span>.</span>
        </a>

        <button
          className={`navbar__toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={`navbar__nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="navbar__cta" href="mailto:titangra.dev@gmail.com">
          Let&apos;s talk <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
