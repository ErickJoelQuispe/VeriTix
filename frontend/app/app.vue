<script setup>
const toaster = {
  position: 'bottom-right',
  duration: 4200,
  max: 4,
  expand: true,
}
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
