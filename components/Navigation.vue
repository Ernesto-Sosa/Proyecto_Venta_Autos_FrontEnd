<template>
  <nav class="bg-[#12161e] text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <NuxtLink to="/" class="text-2xl font-bold hover:opacity-80 transition-opacity">
        AutoSales
      </NuxtLink>
      
      <div class="flex gap-6 items-center">
        <NuxtLink
          to="/"
          class="hover:text-[#a19b9c] transition-colors font-semibold"
          :class="{ 'text-[#a19b9c]': isActive('/') }"
        >
          Inicio
        </NuxtLink>
        
        <NuxtLink
          to="/roles"
          class="hover:text-[#a19b9c] transition-colors font-semibold"
          :class="{ 'text-[#a19b9c]': isActive('/roles') }"
        >
          Roles
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
  return route.path === path
}
</script>
