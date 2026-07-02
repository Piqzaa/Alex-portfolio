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

  let speedLines = [];
  let glowBursts = [];
  let solarProgress = 0;

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

  function drawSolarSystem(w, h, cx, cy, sp) {
    if (sp <= 0 || sp >= 1) return;
    const s = Math.min(w, h) / 700;
    const alpha = Math.sin(sp * Math.PI) * 0.35;
    const tiltX = 0.4;

    const planets = [
      { r: 35, speed: 0.7, color: "#c0c0c0", radius: 2.0, ring: false },
      { r: 50, speed: 0.55, color: "#e8c87a", radius: 2.8, ring: false },
      { r: 70, speed: 0.4, color: "#4a90d9", radius: 3.5, ring: false },
      { r: 95, speed: 0.3, color: "#c06040", radius: 3.0, ring: false },
      { r: 130, speed: 0.22, color: "#d4a060", radius: 5.0, ring: true },
      { r: 170, speed: 0.16, color: "#e0c880", radius: 4.5, ring: true },
      { r: 210, speed: 0.12, color: "#70c0e0", radius: 4.0, ring: false },
      { r: 250, speed: 0.08, color: "#6090c0", radius: 3.5, ring: false },
      { r: 290, speed: 0.05, color: "#6080a0", radius: 3.0, ring: false },
      { r: 320, speed: 0.03, color: "#506080", radius: 2.5, ring: false },
      { r: 340, speed: 0.02, color: "#405060", radius: 2.0, ring: false },
      { r: 355, speed: 0.015, color: "#304050", radius: 1.5, ring: false },
    ];

    for (const p of planets) {
      const pr = p.r * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy, pr, pr * tiltX, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(124, 110, 245, ${alpha * 0.08})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55 * s);
    sg.addColorStop(0, `rgba(255, 220, 120, ${alpha * 0.35})`);
    sg.addColorStop(0.3, `rgba(255, 200, 80, ${alpha * 0.12})`);
    sg.addColorStop(1, `rgba(200, 150, 50, 0)`);
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(cx, cy, 55 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 250, 220, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    const t = Date.now() * 0.0004;
    for (const p of planets) {
      const pr = p.r * s;
      const angle = t * p.speed + (p.r * 0.1);
      const px = cx + Math.cos(angle) * pr;
      const py = cy + Math.sin(angle) * pr * tiltX;
      const pRadius = p.radius * s;

      const pg = ctx.createRadialGradient(px, py, 0, px, py, pRadius * 2);
      pg.addColorStop(0, `${p.color}${Math.round(alpha * 50).toString(16).padStart(2, "0")}`);
      pg.addColorStop(1, `${p.color}00`);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, pRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      if (p.ring) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + 0.3);
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha * 0.15;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, pRadius * 2.5, pRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const pBody = ctx.createRadialGradient(
        px - pRadius * 0.3, py - pRadius * 0.3, 0,
        px, py, pRadius
      );
      pBody.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.15})`);
      pBody.addColorStop(0.4, p.color);
      pBody.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.25})`);
      ctx.fillStyle = pBody;
      ctx.beginPath();
      ctx.arc(px, py, pRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initSpeedLines(count) {
    speedLines = [];
    for (let i = 0; i < count; i++) {
      speedLines.push({
        angle: Math.random() * Math.PI * 2,
        length: 40 + Math.random() * 140,
        speed: 0.3 + Math.random() * 0.5,
        progress: Math.random(),
        width: 0.5 + Math.random() * 1.5,
      });
    }
  }

  function drawSpeedLines(w, h, cx, cy, wi) {
    if (wi < 0.05) return;
    for (const sl of speedLines) {
      sl.progress += sl.speed * wi * 0.06;
      if (sl.progress > 1) sl.progress -= 1;

      const p = sl.progress;
      const maxDist = Math.max(w, h) * 0.75;
      const startDist = p * maxDist;
      const endDist = startDist + sl.length * wi;
      const alpha = Math.sin(p * Math.PI) * wi * 0.25;

      const sx = cx + Math.cos(sl.angle) * startDist;
      const sy = cy + Math.sin(sl.angle) * startDist;
      const ex = cx + Math.cos(sl.angle) * endDist;
      const ey = cy + Math.sin(sl.angle) * endDist;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(124, 110, 245, ${alpha})`;
      ctx.lineWidth = sl.width * wi;
      ctx.stroke();
    }
  }

  function drawGlowBursts(cx, cy, wi) {
    if (wi < 0.1) return;
    if (Math.random() < wi * 0.04) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 120;
      glowBursts.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        radius: 2 + Math.random() * 5,
        life: 1,
        speed: 0.02 + Math.random() * 0.03,
      });
    }
    for (let i = glowBursts.length - 1; i >= 0; i--) {
      const g = glowBursts[i];
      g.life -= g.speed;
      if (g.life <= 0) { glowBursts.splice(i, 1); continue; }
      const alpha = g.life * wi * 0.4;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius * (1 + (1 - g.life) * 2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 160, 255, ${alpha})`;
      ctx.fill();
    }
  }

  function spawnWarpShootingStar(cx, cy, wi) {
    if (wi < 0.2 || Math.random() > wi * 0.05) return;
    const angle = Math.random() * Math.PI * 2;
    const length = 80 + Math.random() * 140;
    const speed = 8 + Math.random() * 8;
    shootingStars.push({
      x: cx + (Math.random() - 0.5) * 50,
      y: cy + (Math.random() - 0.5) * 50,
      angle,
      length,
      speed,
      life: 1,
    });
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

    // --- Solar system ---
    if (solarProgress > 0 && solarProgress < 1) {
      drawSolarSystem(w, h, cx, cy, solarProgress);
    }

    // --- Speed lines (warp trails) ---
    if (speedLines.length === 0 && wi > 0.05) initSpeedLines(50);
    if (wi > 0.05) drawSpeedLines(w, h, cx, cy, wi);

    // --- Glow bursts ---
    if (wi > 0.1) drawGlowBursts(cx, cy, wi);

    // --- Warp shooting stars ---
    if (wi > 0.2) spawnWarpShootingStar(cx, cy, wi);

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

  function setSolarProgress(v) {
    solarProgress = Math.max(0, Math.min(1, v));
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
    setSolarProgress,
    cleanup: () => cancelAnimationFrame(animFrame),
  };
}
