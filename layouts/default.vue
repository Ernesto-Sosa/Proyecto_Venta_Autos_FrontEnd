<template>
  <div class="min-h-screen bg-white">
    <Navigation />
    <slot />
  </div>
</template>

<script setup>
import Navigation from '~/components/Navigation.vue'
</script>
