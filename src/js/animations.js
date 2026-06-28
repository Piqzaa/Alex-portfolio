// --- Nav : ajoute la classe .scrolled au scroll
export function initNavScroll(navSelector = ".nav") {
  const nav = document.querySelector(navSelector);
  if (!nav) return;

  const THRESHOLD = 60;

  function update() {
    if (window.scrollY > THRESHOLD) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
}

// --- Active link au scroll
export function initActiveLinks(navLinksSelector = ".nav__link") {
  const links = document.querySelectorAll(navLinksSelector);
  if (!links.length) return;

  const sections = [...links].map((link) => {
    const href = link.getAttribute("href");
    return href?.startsWith("#") ? document.querySelector(href) : null;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sections.indexOf(entry.target);
          links.forEach((l) => l.classList.remove("active"));
          if (links[index]) links[index].classList.add("active");
        }
      });
    },
    { threshold: 0.4 },
  );

  sections.forEach((s) => s && observer.observe(s));
}

// --- Smooth scroll pour les liens ancre
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// --- Video preview au hover sur les cartes projets
export function initCardVideos() {
  document.querySelectorAll(".card__video video").forEach((video) => {
    const card = video.closest(".card");
    if (!card) return;

    let playTimer;

    card.addEventListener("mouseenter", () => {
      playTimer = setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 150);
    });

    card.addEventListener("mouseleave", () => {
      clearTimeout(playTimer);
      video.pause();
      video.currentTime = 0;
    });
  });
}
