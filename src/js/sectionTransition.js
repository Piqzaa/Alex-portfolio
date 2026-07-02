export function initSectionTransition(spaceCtrl) {
  const hero = document.querySelector('.hero');
  const projects = document.querySelector('.projects');
  const html = document.documentElement;
  if (!hero || !projects) return;

  let ticking = false;

  function update() {
    const vh = window.innerHeight;
    const hr = hero.getBoundingClientRect();
    const pr = projects.getBoundingClientRect();

    // 0 = hero fully visible (bottom at viewport bottom)
    // 1 = hero fully gone (bottom at viewport top)
    const progress = Math.max(0, Math.min(1, 1 - hr.bottom / vh));

    // Hero exit
    const ho = 1 - progress;
    const hty = -progress * 40;
    html.style.setProperty('--hero-opacity', ho);
    html.style.setProperty('--hero-translate-y', `${hty}px`);

    // Projects entrance (ease-in)
    const po = progress < 0.01 ? 0 : progress * progress;
    const pty = (1 - progress) * 30;
    html.style.setProperty('--projects-opacity', po);
    html.style.setProperty('--projects-translate-y', `${pty}px`);

    // Warp pulse
    const warp = Math.sin(progress * Math.PI) * 0.3;
    spaceCtrl.setWarp(warp);

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    html.style.removeProperty('--hero-opacity');
    html.style.removeProperty('--hero-translate-y');
    html.style.removeProperty('--projects-opacity');
    html.style.removeProperty('--projects-translate-y');
  };
}
