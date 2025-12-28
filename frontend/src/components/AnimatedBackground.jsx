import React, { useEffect, useRef } from 'react';

const AnimatedBackground = ({ isDarkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
    }

    const init = () => {
      particles = Array.from({ length: 60 }, () => new Particle());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Couleur selon le mode
      const mainColor = isDarkMode ? '99, 102, 241' : '79, 70, 229'; 
      ctx.fillStyle = `rgba(${mainColor}, 0.2)`;
      ctx.strokeStyle = `rgba(${mainColor}, 0.05)`;

      particles.forEach((p, i) => {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize(); init(); draw();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700 overflow-hidden">
      {/* Canvas Particules */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
      
      {/* Blobs Dynamiques */}
      <div className={`absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-400/20'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-1000 ${isDarkMode ? 'bg-blue-600/10' : 'bg-blue-400/20'}`}></div>
    </div>
  );
};

export default AnimatedBackground;