export function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animFrame;

  // --- Resize canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // --- Créer les particules
  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.7 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        drift: (Math.random() - 0.5) * 0.2,
        pulse: Math.random() * Math.PI * 2, // phase pour le clignotement
        pulseSpeed: Math.random() * 0.02 + 0.005,
        // Quelques particules colorées
        color:
          Math.random() < 0.15
            ? `rgba(124, 110, 245, ${Math.random() * 0.8 + 0.2})` // violet
            : Math.random() < 0.08
              ? `rgba(224, 80, 160, ${Math.random() * 0.8 + 0.2})` // rose
              : null, // blanc (calculé au draw)
      });
    }
  }

  // --- Draw frame
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      // Pulsation d'opacité
      p.pulse += p.pulseSpeed;
      const pulsedOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color
        ? p.color
        : `rgba(255, 255, 255, ${pulsedOpacity})`;
      ctx.fill();

      // Déplacement
      p.y -= p.speed;
      p.x += p.drift;

      // Réapparition en bas quand sort par le haut
      if (p.y < -5) {
        p.y = canvas.height + 5;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -5 || p.x > canvas.width + 5) {
        p.x = Math.random() * canvas.width;
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  // --- Init
  resize();
  createParticles();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animFrame);
      resize();
      createParticles();
      draw();
    }, 200);
  });

  draw();

  // Cleanup
  return () => cancelAnimationFrame(animFrame);
}
