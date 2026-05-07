<template>
  <div class="orb-wrapper relative mx-auto aspect-square w-full max-w-md">
    <div class="orb-ambient orb-ambient--top" />
    <div class="orb-ambient orb-ambient--bottom" />

    <div class="orb-field" />

    <div class="orb-frame orb-frame--outer" />
    <div class="orb-frame orb-frame--inner" />

    <div class="orb-prism">
      <span class="orb-prism__facet orb-prism__facet--left" />
      <span class="orb-prism__facet orb-prism__facet--right" />
      <span class="orb-prism__facet orb-prism__facet--top" />
      <span class="orb-prism__facet orb-prism__facet--bottom" />
      <span class="orb-prism__core" />
      <span class="orb-prism__cut orb-prism__cut--a" />
      <span class="orb-prism__cut orb-prism__cut--b" />
    </div>

    <div class="orb-rim orb-rim--outer" />
    <div class="orb-rim orb-rim--inner" />

    <div class="orb-spark orb-spark--a" />
    <div class="orb-spark orb-spark--b" />
  </div>
</template>

<style scoped>
.orb-wrapper {
  transform: rotate(195deg);
}

.orb-ambient,
.orb-field,
.orb-frame,
.orb-rim,
.orb-spark,
.orb-prism,
.orb-prism__facet,
.orb-prism__core,
.orb-prism__cut {
  position: absolute;
}

.orb-ambient {
  inset: 0;
  border-radius: 9999px;
  filter: blur(18px);
  opacity: 0.8;
  animation: orb-breathe 8s ease-in-out infinite;
}

.orb-ambient--top {
  background:
    radial-gradient(circle at 16% 14%, color-mix(in oklch, var(--color-accent) 28%, transparent) 0%, transparent 44%),
    radial-gradient(circle at 34% 22%, color-mix(in oklch, var(--color-accent) 14%, transparent) 0%, transparent 58%);
}

.orb-ambient--bottom {
  background:
    radial-gradient(circle at 84% 88%, color-mix(in oklch, var(--color-accent) 20%, transparent) 0%, transparent 48%),
    radial-gradient(circle at 66% 78%, color-mix(in oklch, var(--color-primary) 10%, transparent) 0%, transparent 60%);
  animation-delay: 800ms;
}

.orb-field {
  inset: 8%;
  border-radius: 42% 58% 55% 45% / 46% 40% 60% 54%;
  background:
    radial-gradient(circle at 28% 28%, color-mix(in oklch, var(--color-highlighted) 12%, transparent) 0%, transparent 22%),
    linear-gradient(145deg, color-mix(in oklch, var(--color-accent) 26%, transparent), color-mix(in oklch, var(--color-default) 10%, transparent) 42%, color-mix(in oklch, var(--color-primary) 16%, transparent));
  opacity: 0.72;
  filter: blur(1px);
  animation: orb-spin 22s linear infinite;
}

.orb-frame {
  inset: 7%;
  border: 1px solid rgb(255 255 255 / 0.14);
  clip-path: polygon(50% 0%, 81% 11%, 98% 39%, 88% 79%, 50% 100%, 12% 79%, 2% 39%, 19% 11%);
}

.orb-frame--outer {
  opacity: 0.6;
  animation: orb-drift 14s ease-in-out infinite;
}

.orb-frame--inner {
  inset: 14%;
  border-color: rgb(255 255 255 / 0.08);
  opacity: 0.38;
  animation: orb-drift 10s ease-in-out infinite reverse;
}

.orb-prism {
  inset: 20%;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.18);
  clip-path: polygon(50% 0%, 78% 10%, 95% 36%, 86% 74%, 50% 100%, 14% 74%, 5% 36%, 22% 10%);
  --prism-tilt: -8deg;
  background:
    radial-gradient(circle at 32% 26%, color-mix(in oklch, var(--color-highlighted) 18%, transparent) 0%, transparent 26%),
    linear-gradient(135deg, color-mix(in oklch, var(--color-accent) 44%, transparent) 0%, color-mix(in oklch, var(--color-accent) 18%, transparent) 38%, color-mix(in oklch, var(--color-primary) 20%, transparent) 64%, color-mix(in oklch, var(--color-default) 8%, transparent) 100%);
  box-shadow:
    0 0 34px rgb(166 102 255 / 0.26),
    inset 0 0 28px rgb(255 255 255 / 0.1);
  transform: translateZ(0);
  animation: prism-float 7.4s ease-in-out infinite;
}

.orb-prism__facet {
  inset: 0;
  mix-blend-mode: screen;
  opacity: 0.9;
}

.orb-prism__facet--left {
  clip-path: polygon(50% 0%, 22% 10%, 14% 74%, 50% 100%);
  background: linear-gradient(160deg, color-mix(in oklch, var(--color-accent) 34%, transparent), transparent 72%);
}

.orb-prism__facet--right {
  clip-path: polygon(50% 0%, 78% 10%, 86% 74%, 50% 100%);
  background: linear-gradient(210deg, transparent 18%, color-mix(in oklch, var(--color-primary) 24%, transparent) 100%);
}

.orb-prism__facet--top {
  clip-path: polygon(50% 0%, 78% 10%, 22% 10%);
  background: linear-gradient(180deg, color-mix(in oklch, var(--color-highlighted) 18%, transparent), transparent 100%);
}

.orb-prism__facet--bottom {
  clip-path: polygon(14% 74%, 86% 74%, 50% 100%);
  background: linear-gradient(0deg, color-mix(in oklch, var(--color-accent) 22%, transparent), transparent 100%);
}

.orb-prism__core {
  inset: 16%;
  clip-path: polygon(50% 0%, 79% 12%, 89% 39%, 80% 72%, 50% 100%, 20% 72%, 11% 39%, 21% 12%);
  background:
    radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.55) 0%, transparent 18%),
    radial-gradient(circle at 70% 74%, color-mix(in oklch, var(--color-accent) 36%, transparent) 0%, transparent 38%),
    linear-gradient(140deg, rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.02) 42%, rgb(10 12 24 / 0.22) 100%);
  box-shadow:
    inset 0 0 22px rgb(255 255 255 / 0.08),
    inset 0 -10px 28px rgb(82 38 155 / 0.22);
  animation: prism-pulse 6.2s ease-in-out infinite;
}

.orb-prism__cut {
  top: 8%;
  bottom: 8%;
  width: 10%;
  opacity: 0.42;
  background: linear-gradient(180deg, transparent, rgb(255 255 255 / 0.9), transparent);
}

.orb-prism__cut--a {
  left: 30%;
  transform: skewX(-20deg) rotate(-12deg);
}

.orb-prism__cut--b {
  right: 30%;
  transform: skewX(20deg) rotate(12deg);
}

.orb-rim {
  inset: 11%;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.16);
  opacity: 0.5;
}

.orb-rim--outer {
  transform: rotate(12deg);
  animation: rim-rotate 18s linear infinite;
}

.orb-rim--inner {
  inset: 18%;
  border-style: dashed;
  border-color: rgb(255 255 255 / 0.1);
  transform: rotate(-16deg);
  animation: rim-rotate 28s linear infinite reverse;
}

.orb-spark {
  height: 0.72rem;
  width: 0.72rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 40% 40%, rgb(255 255 255 / 0.92), color-mix(in oklch, var(--color-accent) 55%, transparent) 66%);
  box-shadow: 0 0 22px rgb(171 110 255 / 0.64);
  animation: spark-bob 4.8s ease-in-out infinite;
}

.orb-spark--a {
  top: 18%;
  left: 12%;
}

.orb-spark--b {
  right: 14%;
  bottom: 18%;
  animation-delay: 900ms;
}

@keyframes orb-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orb-drift {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.04) rotate(-4deg);
    opacity: 0.72;
  }
}

@keyframes prism-float {
  0%,
  100% {
    transform: translateY(0) rotate(var(--prism-tilt));
  }
  50% {
    transform: translateY(-10px) rotate(calc(var(--prism-tilt) + 2deg));
  }
}

@keyframes prism-pulse {
  0%,
  100% {
    opacity: 0.9;
  }
  50% {
    opacity: 1;
  }
}

@keyframes rim-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spark-bob {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.75;
  }
  50% {
    transform: translateY(-8px) scale(1.18);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb-ambient,
  .orb-field,
  .orb-frame,
  .orb-prism,
  .orb-rim,
  .orb-spark {
    animation: none;
  }
}
</style>
