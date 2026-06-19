import { useEffect, useRef } from 'react';

/* Floating particles canvas */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = 0, H = 0;

    const particles = Array.from({ length: 28 }, () => makeParticle(W, H, true));

    function makeParticle(W, H, random = false) {
      return {
        x: Math.random() * W,
        y: random ? Math.random() * H : H + 10,
        r: 1 + Math.random() * 2.5,
        speed: 0.18 + Math.random() * 0.35,
        opacity: 0,
        maxOpacity: 0.12 + Math.random() * 0.22,
        drift: (Math.random() - 0.5) * 0.25,
        hue: Math.random() > 0.5 ? '91, 110, 245' : '139, 92, 246',
        phase: Math.random() * Math.PI * 2,
      };
    }

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(p.phase + p.y * 0.01) * 0.2;
        p.phase += 0.008;
        // fade in / out
        if (p.y > H * 0.8) p.opacity = Math.min(p.maxOpacity, p.opacity + 0.004);
        if (p.y < H * 0.2) p.opacity = Math.max(0, p.opacity - 0.005);

        if (p.y < -10) Object.assign(p, makeParticle(W, H));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, ${p.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}

export default function AuthBackground() {
  return (
    <div className="auth-bg">
      <div className="auth-bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <ParticleCanvas />
    </div>
  );
}
