import './scss/main.scss'
import { initHalo } from './js/halo.js';
import { initParticles } from './js/particles.js';
import { initNavScroll, initActiveLinks, initSmoothScroll } from './js/animations.js';

document.addEventListener("DOMContentLoaded", () => {
  initHalo("hero-halo-glow");
  initParticles("hero-canvas");
  initNavScroll();
  initActiveLinks();
  initSmoothScroll();
});
