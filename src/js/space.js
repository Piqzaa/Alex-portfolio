export function initSpace(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let stars = [];
  let shootingStars = [];
  let warpIntensity = 0;
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let animFrame;



  const STAR_COUNT = 220;
  const CONNECTION_DIST = 130;
  const SHOOTING_STAR_RATE = 0.003;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar(Math.random() * canvas.width, Math.random() * canvas.height));
    }
  }

  function createStar(x, y) {
    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      z: Math.random(),
      size: Math.random() * 2 + 0.3,
      baseSpeed: Math.random() * 0.3 + 0.05,
      drift: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      hue: Math.random() < 0.12 ? 260 : Math.random() < 0.06 ? 320 : 0,
    };
  }

  function drawShootingStar() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.4;
    const angle = Math.PI / 4 + Math.random() * Math.PI / 3;
    const length = 50 + Math.random() * 80;
    const speed = 4 + Math.random() * 4;

    shootingStars.push({ x, y, angle, length, speed, life: 1 });
  }

  function drawNebula(w, h, wi) {
    if (wi < 0.05) return;
    const alpha = wi * 0.35;
    const layers = [
      { cx: 0.3, cy: 0.4, r: 0.5, dx: 0.2, dy: 0.15, color: [124, 110, 245], phase: 0 },
      { cx: 0.7, cy: 0.6, r: 0.4, dx: 0.15, dy: 0.2, color: [60, 40, 180], phase: 2.1 },
      { cx: 0.5, cy: 0.3, r: 0.35, dx: 0.12, dy: 0.1, color: [224, 80, 160], phase: 4.2 },
    ];
    for (const n of layers) {
      const x = w * n.cx + Math.sin(time * 0.0003 + n.phase) * w * n.dx;
      const y = h * n.cy + Math.cos(time * 0.0004 + n.phase) * h * n.dy;
      const radius = Math.min(w, h) * n.r;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, ${alpha * 0.25})`);
      grad.addColorStop(1, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const wi = warpIntensity;

    // --- Nebula background ---
    if (wi > 0.05) drawNebula(w, h, wi);

    // --- Stars ---
    for (const s of stars) {
      s.pulsePhase += s.pulseSpeed;
      const pulsedOpacity = s.opacity * (0.6 + 0.4 * Math.sin(s.pulsePhase));

      if (wi > 0.05) {
        // WARP MODE
        const dx = s.x - cx;
        const dy = s.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;

        const depthFactor = 0.3 + s.z * 0.7;
        const warpSpeed = wi * 25 * depthFactor;
        const stretch = wi * 40 * depthFactor;

        s.x += nx * warpSpeed;
        s.y += ny * warpSpeed;

        if (s.x < -60 || s.x > canvas.width + 60 || s.y < -60 || s.y > canvas.height + 60) {
          const angle = Math.random() * Math.PI * 2;
          const r = 20 + Math.random() * 60;
          s.x = cx + Math.cos(angle) * r;
          s.y = cy + Math.sin(angle) * r;
          s.z = Math.random();
        }

        const alpha = Math.min(1, pulsedOpacity * (0.6 + wi * 0.4));
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(Math.atan2(ny, nx));

        const w = Math.max(s.size, s.size + stretch);
        const h = s.size * (0.3 + (1 - wi) * 0.3);

        const grad = ctx.createLinearGradient(0, 0, w + 4, 0);
        if (s.hue > 0) {
          grad.addColorStop(0, `hsla(${s.hue + wi * 20}, 90%, 80%, ${alpha})`);
          grad.addColorStop(0.15, `hsla(${s.hue + wi * 20}, 80%, 60%, ${alpha * 0.7})`);
          grad.addColorStop(1, `hsla(${s.hue + wi * 20}, 80%, 50%, 0)`);
        } else {
          const tint = wi * 30;
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.1, `rgba(210, 210, 255, ${alpha * 0.6})`);
          grad.addColorStop(0.5, `rgba(180, ${180 + tint}, 255, ${alpha * 0.2})`);
          grad.addColorStop(1, `rgba(150, ${150 + tint}, 255, 0)`);
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // NORMAL MODE
        s.y -= s.baseSpeed;
        s.x += s.drift;

        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
        if (s.x < -5 || s.x > canvas.width + 5) {
          s.x = Math.random() * canvas.width;
        }

        const px = (mouseX - cx) * 0.008 * (0.5 + s.z * 0.5);
        const py = (mouseY - cy) * 0.008 * (0.5 + s.z * 0.5);
        const drawX = s.x + px;
        const drawY = s.y + py;

        ctx.beginPath();
        ctx.arc(drawX, drawY, s.size, 0, Math.PI * 2);
        if (s.hue > 0) {
          ctx.fillStyle = `hsla(${s.hue}, 70%, 60%, ${pulsedOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${pulsedOpacity})`;
        }
        ctx.fill();
      }
    }

    // --- Connections (only in low warp) ---
    if (wi < 0.2) {
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j];
          const ddx = a.x - b.x;
          const ddy = a.y - b.y;
          const d = ddx * ddx + ddy * ddy;
          if (d < CONNECTION_DIST * CONNECTION_DIST) {
            const alpha = (1 - d / (CONNECTION_DIST * CONNECTION_DIST)) * 0.12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124, 110, 245, ${alpha})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }
    }

    // --- Shooting stars ---
    if (wi < 0.4 && Math.random() < SHOOTING_STAR_RATE) {
      drawShootingStar();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.02;

      if (ss.life <= 0 || ss.x > canvas.width + 100 || ss.y > canvas.height + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(ss.x, ss.y);
      ctx.rotate(ss.angle);

      const grad = ctx.createLinearGradient(0, 0, ss.length, 0);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(0.3, `rgba(255, 255, 255, ${ss.life * 0.9})`);
      grad.addColorStop(1, `rgba(200, 180, 255, 0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, -1.2, ss.length, 2.4);
      ctx.restore();
    }

    time++;
    animFrame = requestAnimationFrame(draw);
  }

  function setWarp(v) {
    warpIntensity = Math.max(0, Math.min(1, v));
  }

  function setMouse(x, y) {
    mouseX = x;
    mouseY = y;
  }

  resize();
  createStars();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createStars();
    }, 200);
  });

  window.addEventListener("mousemove", (e) => {
    setMouse(e.clientX, e.clientY);
  });

  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    setMouse(t.clientX, t.clientY);
  }, { passive: true });

  draw();

  return {
    setWarp,
    cleanup: () => cancelAnimationFrame(animFrame),
  };
}
