import './scss/main.scss'
import { initHalo } from './js/halo.js';
import { initSpace } from './js/space.js';
import { initSectionTransition } from './js/sectionTransition.js';
import { initNavScroll, initActiveLinks, initSmoothScroll, initCardVideos, initMobileMenu } from './js/animations.js';

document.addEventListener("DOMContentLoaded", () => {
  initHalo("hero-halo-glow");
  const space = initSpace("space-canvas");
  if (space) {
    initSectionTransition(space);
  }
  initNavScroll();
  initActiveLinks();
  initSmoothScroll();
  initCardVideos();
  initMobileMenu();
});
