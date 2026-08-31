/**
 * ParticleSystem - Real-time AR particle canvas manager for mood effects
 */

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 60;
    this.currentEmotion = 'neutral';
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  setEmotion(emotion) {
    if (this.currentEmotion !== emotion) {
      this.currentEmotion = emotion;
      // Soft transition - clear half old particles
      this.particles = this.particles.slice(0, Math.floor(this.particles.length / 2));
    }
  }

  spawnParticle() {
    if (this.particles.length >= this.maxParticles) return;

    const w = this.canvas.width;
    const h = this.canvas.height;

    let p = {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 2,
      alpha: Math.random() * 0.8 + 0.2,
      life: 0,
      maxLife: Math.random() * 100 + 60,
      color: '#00f0ff',
      shape: 'circle'
    };

    switch (this.currentEmotion) {
      case 'happy':
        p.color = `hsl(${45 + Math.random() * 20}, 100%, ${50 + Math.random() * 30}%)`; // Golden yellow / warm orange
        p.vy = -Math.random() * 2 - 1; // Rise up
        p.vx = (Math.random() - 0.5) * 1.5;
        p.shape = Math.random() > 0.4 ? 'star' : 'circle';
        p.y = h + 10;
        break;

      case 'sad':
        p.color = `hsl(${200 + Math.random() * 30}, 85%, ${60 + Math.random() * 25}%)`; // Soft rain blue
        p.vy = Math.random() * 3 + 2; // Rain down
        p.vx = (Math.random() - 0.5) * 0.5;
        p.shape = 'drop';
        p.y = -10;
        break;

      case 'angry':
        p.color = `hsl(${0 + Math.random() * 25}, 100%, ${50 + Math.random() * 30}%)`; // Fiery red / orange
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = (Math.random() - 0.5) * 4;
        p.shape = 'ember';
        break;

      case 'surprised':
        p.color = `hsl(${280 + Math.random() * 50}, 100%, ${65 + Math.random() * 25}%)`; // Neon Magenta / Purple
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
        p.shape = 'ring';
        p.size = Math.random() * 6 + 3;
        break;

      case 'fearful':
        p.color = `hsl(${250 + Math.random() * 30}, 70%, ${40 + Math.random() * 30}%)`; // Deep violet mist
        p.vy = -Math.random() * 0.8;
        p.vx = (Math.random() - 0.5) * 2;
        p.shape = 'mist';
        p.size = Math.random() * 12 + 6;
        break;

      case 'disgusted':
        p.color = `hsl(${100 + Math.random() * 40}, 90%, ${45 + Math.random() * 35}%)`; // Toxic green
        p.vy = -Math.random() * 1.5;
        p.shape = 'bubble';
        p.size = Math.random() * 8 + 3;
        break;

      case 'neutral':
      default:
        p.color = `hsl(${185 + Math.random() * 20}, 90%, ${70 + Math.random() * 20}%)`; // Soft cyan glow
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = (Math.random() - 0.5) * 0.8;
        p.shape = 'circle';
        break;
    }

    this.particles.push(p);
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Spawn new particle based on rate
    if (Math.random() < 0.6) {
      this.spawnParticle();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      const progress = p.life / p.maxLife;
      const currentAlpha = p.alpha * (1 - progress);

      if (p.life >= p.maxLife || currentAlpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.fillStyle = p.color;
      this.ctx.strokeStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
      } else if (p.shape === 'drop') {
        this.ctx.beginPath();
        this.ctx.ellipse(p.x, p.y, p.size * 0.5, p.size * 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'ember') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.shadowColor = '#ff3300';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
      } else if (p.shape === 'ring') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * (1 + progress), 0, Math.PI * 2);
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      } else if (p.shape === 'bubble') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      } else if (p.shape === 'mist') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.filter = 'blur(4px)';
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }
}
