"use client";

import { useEffect, useRef } from "react";

export default function ThreeBg({ category = "all" }) {
  const canvasRef = useRef(null);
  const categoryRef = useRef(category);

  // Keep category value updated in ref for the animation loop
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Color theme configuration
    const themes = {
      all: { color1: "rgba(0, 242, 254, ", color2: "rgba(177, 82, 255, ", glow: "#00f2fe" },
      ai: { color1: "rgba(177, 82, 255, ", color2: "rgba(124, 34, 255, ", glow: "#b152ff" },
      dev: { color1: "rgba(0, 242, 254, ", color2: "rgba(79, 172, 254, ", glow: "#00f2fe" },
      tech: { color1: "rgba(5, 255, 163, ", color2: "rgba(0, 184, 255, ", glow: "#05ffa3" },
      gaming: { color1: "rgba(255, 69, 0, ", color2: "rgba(255, 51, 102, ", glow: "#ff4500" }
    };

    // Particles Settings
    const particles = [];
    const particleCount = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    
    // Cursor position tracking
    let mouse = { x: null, y: null, radius: 180 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Initialize Particles
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.colorRatio = Math.random(); // mix ratio
        
        // Dynamic color tracking
        this.currentR = 255;
        this.currentG = 255;
        this.currentB = 255;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce boundaries
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse interaction (push effect)
        if (mouse.x !== null && mouse.y !== null) {
          let dx = this.x - mouse.x;
          let dy = this.y - mouse.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let force = (mouse.radius - distance) / mouse.radius;
            let angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 1.5;
            this.y += Math.sin(angle) * force * 1.5;
          }
        }
      }

      draw(activeTheme) {
        // Smoothly transition particle color towards the target category theme
        const colorString = this.colorRatio > 0.5 ? activeTheme.color1 : activeTheme.color2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colorString}0.85)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = activeTheme.glow;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Connect particles with thin neon lines
    const connectParticles = () => {
      ctx.shadowBlur = 0; // turn off shadow glow for lines to boost rendering performance
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            let opacity = (1 - (distance / 110)) * 0.12;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation Loop
    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#07070a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Get current theme from ref
      const currentCat = categoryRef.current.toLowerCase();
      const activeTheme = themes[currentCat] || themes.all;

      particles.forEach((p) => {
        p.update();
        p.draw(activeTheme);
      });
      
      connectParticles();
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}
