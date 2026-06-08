export function initHalo(glowElementId) {
  const glow = document.getElementById(glowElementId);
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let animFrame;

  // Lerp pour un mouvement fluide
  const LERP = 0.08;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function update() {
    currentX = lerp(currentX, mouseX, LERP);
    currentY = lerp(currentY, mouseY, LERP);

    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;

    animFrame = requestAnimationFrame(update);
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Touch support (mobile)
  window.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      mouseX = touch.clientX;
      mouseY = touch.clientY;
    },
    { passive: true },
  );

  update();

  return () => cancelAnimationFrame(animFrame);
}
