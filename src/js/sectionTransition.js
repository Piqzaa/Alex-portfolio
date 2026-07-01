export function initSectionTransition(spaceCtrl) {
  const hero = document.querySelector("#hero");
  const projects = document.querySelector("#projects");
  if (!hero || !projects || !spaceCtrl) return;

  let animFrame;
  let lastScrollY = window.scrollY;
  let velocity = 0;
  let lastProgress = -1;

  const VELOCITY_SMOOTH = 0.88;
  const MAX_VELOCITY = 60;

  function update() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const heroStart = hero.offsetTop;
    const transitionDist = vh * 2.5;

    const rawProgress = (scrollY - heroStart) / transitionDist;
    const progress = Math.max(0, Math.min(1, rawProgress));
    const isTransitioning = progress > 0.001 && progress < 1;

    // Track scroll velocity
    const diff = Math.abs(scrollY - lastScrollY);
    velocity = velocity * VELOCITY_SMOOTH + diff * (1 - VELOCITY_SMOOTH);
    lastScrollY = scrollY;

    if (isTransitioning) {
      const velocityFactor = Math.min(1, velocity / MAX_VELOCITY);

      // Hero exit: progress 0 → 0.4
      if (progress < 0.4) {
        const p = progress / 0.4;
        const tz = p * -600;
        const rx = p * 18;
        const sc = 1 - p * 0.35;
        const op = Math.max(0, 1 - p * 1.4);
        hero.style.transform = `perspective(1000px) translateZ(${tz}px) rotateX(${rx}deg) scale(${sc})`;
        hero.style.opacity = op;
        hero.style.willChange = "transform, opacity";
        hero.style.pointerEvents = p > 0.3 ? "none" : "";
      } else {
        hero.style.transform = "";
        hero.style.opacity = "";
        hero.style.willChange = "";
        hero.style.pointerEvents = "none";
      }

      // Projects entrance: progress 0.64 → 0.80 (fini juste avant que la section soit visible)
      if (progress > 0.64) {
        const p = Math.min(1, (progress - 0.64) / 0.16);
        const tz = (1 - p) * -500;
        const sc = 0.85 + p * 0.15;
        const op = Math.min(1, p * 2.5);
        projects.style.transform = `perspective(1000px) translateZ(${tz}px) scale(${sc})`;
        projects.style.opacity = op;
        projects.style.willChange = "transform, opacity";
      } else {
        projects.style.transform = "perspective(1000px) translateZ(-500px) scale(0.85)";
        projects.style.opacity = "0";
        projects.style.willChange = "transform, opacity";
      }

      // Warp: base curve + velocity modulation
      let baseWarp;
      if (progress < 0.25) {
        baseWarp = progress / 0.25;
      } else if (progress < 0.6) {
        baseWarp = 1;
      } else {
        baseWarp = 1 - (progress - 0.6) / 0.2;
      }
      const warp = baseWarp * (0.1 + 0.9 * velocityFactor);
      spaceCtrl.setWarp(warp);

      document.documentElement.style.setProperty("--warp", warp);

      lastProgress = progress;
    } else if (lastProgress >= 0) {
      hero.style.transform = "";
      hero.style.opacity = "";
      hero.style.willChange = "";
      hero.style.pointerEvents = "";
      projects.style.transform = "";
      projects.style.opacity = "";
      projects.style.willChange = "";
      document.documentElement.style.removeProperty("--warp");
      spaceCtrl.setWarp(0);
      lastProgress = -1;
    }

    animFrame = requestAnimationFrame(update);
  }

  update();
  return () => cancelAnimationFrame(animFrame);
}
