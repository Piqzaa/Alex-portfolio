export function initSectionTransition(spaceCtrl) {
  const hero = document.querySelector("#hero");
  const projects = document.querySelector("#projects");
  const card = document.querySelector(".player-card");
  if (!hero || !projects || !spaceCtrl) return;

  let animFrame;
  let lastScrollY = window.scrollY;
  let velocity = 0;
  let lastProgress = -1;

  const VELOCITY_SMOOTH = 0.88;
  const MAX_VELOCITY = 60;

  function getOffset(vh) {
    if (window.innerWidth >= 1024) return 0;
    if (!card) return 0;
    const cardMid = card.offsetTop + card.offsetHeight / 2;
    return Math.max(0, (cardMid - vh * 0.35) / (vh * 2.5));
  }

  function update() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const transitionDist = vh * 2.5;
    const offset = getOffset(vh);

    const rawProgress = (scrollY - hero.offsetTop) / transitionDist;
    const progress = Math.max(0, Math.min(1, rawProgress - offset));
    const isTransitioning = progress > 0.001 && progress < 1;

    const diff = Math.abs(scrollY - lastScrollY);
    velocity = velocity * VELOCITY_SMOOTH + diff * (1 - VELOCITY_SMOOTH);
    lastScrollY = scrollY;

    // Dynamic entrance timing based on where projects actually is
    const enterEndRaw = (projects.offsetTop - vh * 0.2) / transitionDist;
    const enterEnd = Math.max(0.1, enterEndRaw - offset);
    const enterStart = Math.max(0, enterEnd - 0.14);
    const enterDuration = enterEnd - enterStart;

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
        hero.style.transform = "perspective(1000px) translateZ(-600px) rotateX(18deg) scale(0.65)";
        hero.style.opacity = "0";
        hero.style.willChange = "transform, opacity";
        hero.style.pointerEvents = "none";
      }

      // Projects entrance: dynamic timing based on actual position
      if (progress > enterStart && enterDuration > 0) {
        const p = Math.min(1, (progress - enterStart) / enterDuration);
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

      // Warp: sync ramp down with entrance end
      let baseWarp;
      if (progress < 0.25) {
        baseWarp = progress / 0.25;
      } else if (progress < enterEnd - 0.12) {
        baseWarp = 1;
      } else if (progress < enterEnd) {
        baseWarp = 1 - (progress - (enterEnd - 0.12)) / 0.12;
      } else {
        baseWarp = 0;
      }
      const warp = baseWarp * (0.1 + 0.9 * velocityFactor);
      spaceCtrl.setWarp(warp);
      document.documentElement.style.setProperty("--warp", warp);

      lastProgress = progress;
    } else if (lastProgress > 0.01) {
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
