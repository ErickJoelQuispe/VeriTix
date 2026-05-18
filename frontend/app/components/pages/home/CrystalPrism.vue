<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), {
  compact: false,
})
</script>

<template>
  <div
    class="orb-wrapper relative mx-auto aspect-square w-full max-w-md"
    :class="compact && 'orb-wrapper--compact max-w-[13rem] sm:max-w-[15rem] md:max-w-[16rem]'"
  >
    <div class="orb-ambient orb-ambient--top" />
    <div class="orb-ambient orb-ambient--bottom" />
    <div class="orb-backglow" />

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

.orb-wrapper--compact {
  transform: rotate(195deg) scale(0.92);
}

.orb-ambient,
.orb-field,
.orb-backglow,
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
  mix-blend-mode: soft-light;
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

.orb-backglow {
  inset: -8%;
  border-radius: 9999px;
  background:
    radial-gradient(circle at 18% 16%, color-mix(in oklch, var(--color-accent) 20%, transparent) 0%, transparent 46%),
    radial-gradient(circle at 82% 86%, color-mix(in oklch, var(--color-accent) 14%, transparent) 0%, transparent 54%),
    radial-gradient(circle at 50% 52%, color-mix(in oklch, var(--color-highlighted) 8%, transparent) 0%, transparent 36%);
  filter: blur(30px);
  opacity: 0.55;
  mix-blend-mode: soft-light;
  mask-image: radial-gradient(circle at 50% 50%, black 0 60%, transparent 90%);
  -webkit-mask-image: radial-gradient(circle at 50% 50%, black 0 60%, transparent 90%);
  animation: orb-breathe 10s ease-in-out infinite reverse;
}

.orb-field {
  inset: 8% 7% 9% 6%;
  border-radius: 42% 58% 55% 45% / 46% 40% 60% 54%;
  background:
    radial-gradient(circle at 28% 28%, color-mix(in oklch, var(--color-highlighted) 12%, transparent) 0%, transparent 22%),
    linear-gradient(145deg, color-mix(in oklch, var(--color-accent) 26%, transparent), color-mix(in oklch, var(--color-default) 10%, transparent) 42%, color-mix(in oklch, var(--color-primary) 16%, transparent));
  opacity: 0.72;
  filter: blur(1px);
  mix-blend-mode: soft-light;
  animation: orb-spin 22s linear infinite;
}

.orb-frame {
  inset: 7% 6% 8% 5%;
  border: 1px solid rgb(255 255 255 / 0.14);
  clip-path: polygon(50% 0%, 81% 11%, 98% 39%, 88% 79%, 50% 100%, 12% 79%, 2% 39%, 19% 11%);
}

.orb-frame--outer {
  opacity: 0.6;
  --frame-tilt: 10deg;
  animation: orb-drift 14s ease-in-out infinite;
}

.orb-frame--inner {
  inset: 14% 16% 13% 12%;
  border-color: rgb(255 255 255 / 0.08);
  opacity: 0.38;
  --frame-tilt: -14deg;
  animation: orb-drift 10s ease-in-out infinite reverse;
}

.orb-prism {
  inset: 20% 17% 17% 21%;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.18);
  clip-path: polygon(50% 0%, 80% 10%, 96% 35%, 85% 75%, 49% 100%, 12% 74%, 4% 36%, 21% 9%);
  --prism-tilt: -8deg;
  background:
    radial-gradient(circle at 30% 24%, color-mix(in oklch, var(--color-highlighted) 18%, transparent) 0%, transparent 26%),
    linear-gradient(135deg, color-mix(in oklch, var(--color-accent) 44%, transparent) 0%, color-mix(in oklch, var(--color-accent) 18%, transparent) 38%, color-mix(in oklch, var(--color-primary) 20%, transparent) 64%, color-mix(in oklch, var(--color-default) 8%, transparent) 100%);
  box-shadow:
    0 0 34px rgb(166 102 255 / 0.26),
    inset 0 0 28px rgb(255 255 255 / 0.1);
  transform: translateZ(0);
  animation: prism-float 7.4s ease-in-out infinite;
}

.orb-prism__facet {
  inset: 0;
  mix-blend-mode: soft-light;
  opacity: 0.9;
}

.orb-prism__facet--left {
  clip-path: polygon(50% 0%, 18% 10%, 12% 74%, 50% 100%);
  background: linear-gradient(160deg, color-mix(in oklch, var(--color-accent) 34%, transparent), transparent 72%);
}

.orb-prism__facet--right {
  clip-path: polygon(50% 0%, 82% 9%, 88% 76%, 50% 100%);
  background: linear-gradient(210deg, transparent 18%, color-mix(in oklch, var(--color-primary) 24%, transparent) 100%);
}

.orb-prism__facet--top {
  clip-path: polygon(50% 0%, 80% 9%, 21% 10%);
  background: linear-gradient(180deg, color-mix(in oklch, var(--color-highlighted) 18%, transparent), transparent 100%);
}

.orb-prism__facet--bottom {
  clip-path: polygon(12% 74%, 88% 76%, 49% 100%);
  background: linear-gradient(0deg, color-mix(in oklch, var(--color-accent) 22%, transparent), transparent 100%);
}

.orb-prism__core {
  inset: 15% 16% 17% 14%;
  clip-path: polygon(50% 0%, 81% 12%, 90% 39%, 79% 72%, 50% 100%, 19% 72%, 10% 39%, 20% 12%);
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
  inset: 11% 10% 12% 9%;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.16);
  opacity: 0.5;
}

.orb-rim--outer {
  --rim-tilt: 16deg;
  animation: rim-rotate 18s linear infinite;
}

.orb-rim--inner {
  inset: 18% 20% 17% 14%;
  border-style: dashed;
  border-color: rgb(255 255 255 / 0.1);
  --rim-tilt: -22deg;
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
  top: 16%;
  left: 10%;
}

.orb-spark--b {
  right: 12%;
  bottom: 16%;
  animation-delay: 900ms;
}

.orb-wrapper--compact .orb-ambient {
  filter: blur(14px);
  opacity: 0.58;
}

.orb-wrapper--compact .orb-backglow {
  filter: blur(24px);
  opacity: 0.42;
}

.orb-wrapper--compact .orb-field {
  opacity: 0.62;
}

.orb-wrapper--compact .orb-prism {
  box-shadow:
    0 0 24px rgb(166 102 255 / 0.18),
    inset 0 0 24px rgb(255 255 255 / 0.08);
}

.orb-wrapper--compact .orb-rim {
  opacity: 0.38;
}

.orb-wrapper--compact .orb-spark {
  height: 0.6rem;
  width: 0.6rem;
  box-shadow: 0 0 16px rgb(171 110 255 / 0.42);
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
    transform: scale(1) rotate(var(--frame-tilt, 0deg));
    opacity: 0.5;
  }
  50% {
    transform: scale(1.04) rotate(calc(var(--frame-tilt, 0deg) - 4deg));
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
    transform: rotate(var(--rim-tilt, 0deg));
  }
  to {
    transform: rotate(calc(var(--rim-tilt, 0deg) + 360deg));
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
