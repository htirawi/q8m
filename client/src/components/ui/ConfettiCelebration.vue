<template>
  <div class="confetti-celebration" :class="{ 'confetti-celebration--active': isActive }">
    <canvas
      ref="canvasRef"
      class="confetti-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const emit = defineEmits<{
  complete: [];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(window.innerWidth);
const canvasHeight = ref(window.innerHeight);
const isActive = ref(true);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  fade: number;
}

const particles: Particle[] = [];
particles;
const colors = ["#5E5CE6", "#32ADE6", "#34C759", "#FF9F0A", "#FF453A", "#AF52DE", "#FFD60A"];
let animationId: number | null = null;
animationId;

const createParticles = () => {
  const particleCount = 150;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvasWidth.value,
      y: canvasHeight.value + 10,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * -15 - 10,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)] || "#5E5CE6",
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      opacity: 1,
      fade: Math.random() * 0.02 + 0.005,
    });
  }
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate((particle.rotation * Math.PI) / 180);

  ctx.fillStyle = particle.color;
  ctx.globalAlpha = particle.opacity;

  // Draw a star shape
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = ((i * 72 - 90) * Math.PI) / 180;
    const x = Math.cos(angle) * particle.radius;
    const y = Math.sin(angle) * particle.radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    const innerAngle = ((i * 72 + 36 - 90) * Math.PI) / 180;
    const innerX = Math.cos(innerAngle) * (particle.radius * 0.5);
    const innerY = Math.sin(innerAngle) * (particle.radius * 0.5);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

const animate = () => {
  if (!canvasRef.value) return;

  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  let activeParticles = 0;

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];
    if (!particle) continue;

    // Update particle position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.5; // Gravity
    particle.rotation += particle.rotationSpeed;
    particle.opacity -= particle.fade;

    if (particle.opacity > 0 && particle.y < canvasHeight.value) {
      drawParticle(ctx, particle);
      activeParticles++;
    } else {
      particles.splice(i, 1);
    }
  }

  if (activeParticles > 0) {
    animationId = requestAnimationFrame(animate);
  } else {
    // All particles have disappeared
    isActive.value = false;
    setTimeout(() => {
      emit("complete");
    }, 500);
  }
};

const handleResize = () => {
  canvasWidth.value = window.innerWidth;
  canvasHeight.value = window.innerHeight;
};

onMounted(() => {
  createParticles();
  animate();
  window.addEventListener("resize", handleResize);

  // Auto-complete after 3 seconds
  setTimeout(() => {
    if (isActive.value) {
      isActive.value = false;
      emit("complete");
    }
  }, 3000);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.confetti-celebration {
  @apply pointer-events-none fixed inset-0 z-[9999];
  @apply transition-opacity duration-500;
}

.confetti-celebration--active {
  @apply opacity-100;
}

.confetti-celebration:not(.confetti-celebration--active) {
  @apply opacity-0;
}

.confetti-canvas {
  @apply h-full w-full;
}

@media (prefers-reduced-motion: reduce) {
  .confetti-celebration {
    display: none;
  }
}
</style>
