const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  root.dataset.theme = savedTheme;
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "" : "light";
  root.dataset.theme = nextTheme;

  if (nextTheme) {
    localStorage.setItem("theme", nextTheme);
  } else {
    localStorage.removeItem("theme");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const filters = [...document.querySelectorAll(".filter")];
const cards = [...document.querySelectorAll(".project-card")];

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const activeType = filter.dataset.filter;

    filters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card) => {
      const isVisible = activeType === "all" || card.dataset.type === activeType;
      card.classList.toggle("is-hidden", !isVisible);
    });
  });
});

const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 },
);

sections.forEach((section) => sectionObserver.observe(section));
