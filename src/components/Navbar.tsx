type NavbarProps = {
  visible: boolean;
};

export default function Navbar({ visible }: NavbarProps) {
  return (
    <nav
      className={`navbar ${visible ? "navbar--visible" : ""}`}
      aria-label="Main navigation"
    >
      <a className="navbar__brand" href="#top" aria-label="TitanGra home">
        TitanGra
      </a>

      <div className="navbar__links">
        <a href="#about">About</a>
        <a href="#lab">Lab</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
}
