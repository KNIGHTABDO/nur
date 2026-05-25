import React, { useEffect, useRef } from "react";

export const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
      fadeSpeed: number;
    }> = [];

    const createParticle = (yPos = height + 10) => {
      const size = Math.random() * 3 + 1; // 1px to 4px
      return {
        x: Math.random() * width,
        y: yPos,
        size,
        speedY: -(Math.random() * 0.8 + 0.3), // upward speed
        speedX: Math.random() * 0.4 - 0.2, // slight horizontal drift
        opacity: 0,
        maxOpacity: Math.random() * 0.4 + 0.1, // peak opacity (0.1 to 0.5)
        fadeSpeed: Math.random() * 0.01 + 0.005,
      };
    };

    // Initialize initial particles scattered across the screen
    for (let i = 0; i < 45; i++) {
      const p = createParticle(Math.random() * height);
      p.opacity = Math.random() * p.maxOpacity;
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Fade in initially, then let it float, then fade out near the top
        if (p.opacity < p.maxOpacity && p.y > height * 0.2) {
          p.opacity += p.fadeSpeed;
        } else if (p.y <= height * 0.2) {
          p.opacity -= p.fadeSpeed * 1.5; // fade out near the top
        }

        // Reset particle if it goes off screen or becomes invisible
        if (p.y < -10 || p.opacity <= 0) {
          particles[idx] = createParticle();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 202, 80, ${Math.max(0, p.opacity)})`;
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = "#f2ca50";
        ctx.fill();
      });

      // Clear shadow properties for performance
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};
