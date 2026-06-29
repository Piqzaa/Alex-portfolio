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

// --- Hamburger menu mobile
export function initMobileMenu(navSelector = ".nav") {
  const nav = document.querySelector(navSelector);
  const hamburger = nav?.querySelector(".nav__hamburger");
  const links = nav?.querySelectorAll(".nav__link");
  if (!nav || !hamburger) return;

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav--open");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  links?.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

// --- Video preview au hover sur les cartes projets
export function initCardVideos() {
  document.querySelectorAll(".card__video video").forEach((video) => {
    const card = video.closest(".card");
    if (!card) return;

    let playTimer;
    let isPlaying = false;

    function playVideo() {
      if (isPlaying) return;
      isPlaying = true;
      video.currentTime = 0;
      video.play().catch(() => { isPlaying = false; });
    }

    function pauseVideo() {
      clearTimeout(playTimer);
      isPlaying = false;
      video.pause();
      video.currentTime = 0;
    }

    card.addEventListener("mouseenter", () => {
      playTimer = setTimeout(playVideo, 150);
    });

    card.addEventListener("mouseleave", pauseVideo);

    card.addEventListener("click", (e) => {
      if (e.target.closest("a, .card__links")) return;
      if (isPlaying) {
        pauseVideo();
      } else {
        playVideo();
      }
    });
  });
}
