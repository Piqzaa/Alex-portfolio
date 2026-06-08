import './scss/main.scss'
import { initHalo } from './js/halo.js';
import { initParticles } from './js/particles.js';

document.addEventListener("DOMContentLoaded", () => {
  initHalo("hero-halo-glow");
  initParticles("hero-canvas");
});
