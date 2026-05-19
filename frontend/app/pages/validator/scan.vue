<script setup lang="ts">
definePageMeta({
  middleware: 'validator',
})

await navigateTo('/validator', { replace: true })
</script>
