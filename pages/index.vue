<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Dashboard Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <!-- Left: Login Button -->
        <button class="px-6 py-2 font-semibold border-2 border-[#12161e] text-[#12161e] rounded hover:bg-[#12161e] hover:text-white transition-all duration-300 hover:shadow-lg active:scale-95">
          Iniciar Sesión
        </button>

        <!-- Center: Welcome Text -->
        <div class="flex-1 text-center">
          <h1 class="text-3xl font-bold text-[#12161e] tracking-tight">
            AutoSales
          </h1>
          <p class="text-[#a19b9c] text-sm mt-1">Tu plataforma de venta de autos</p>
        </div>

        <!-- Right: Social Icons -->
        <div class="flex gap-5 items-center">
          <a href="#" class="w-6 h-6 text-[#a19b9c] transition-all duration-300 hover:scale-110 hover:text-[#12161e]" title="Instagram" aria-label="Instagram">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
            </svg>
          </a>
          <a href="#" class="w-6 h-6 text-[#a19b9c] transition-all duration-300 hover:scale-110 hover:text-[#12161e]" title="X" aria-label="X">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.956 1.116 4.993 4.993 0 00-8.604 4.55A14.922 14.922 0 012.704 4.5a4.993 4.993 0 001.546 6.67 4.98 4.98 0 01-2.26-.616v.06a4.993 4.993 0 003.997 4.898 4.996 4.996 0 01-2.252.089 4.994 4.994 0 004.666 3.461 10.025 10.025 0 01-6.177 2.13c-.398 0-.79-.023-1.175-.067a14.947 14.947 0 008.134 2.38c9.76 0 15.07-8.08 15.07-15.07 0-.23-.005-.46-.015-.69a10.738 10.738 0 002.635-2.738z"/>
            </svg>
          </a>
          <a href="#" class="w-6 h-6 text-[#a19b9c] transition-all duration-300 hover:scale-110 hover:text-[#12161e]" title="Facebook" aria-label="Facebook">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" class="w-6 h-6 text-[#a19b9c] transition-all duration-300 hover:scale-110 hover:text-[#12161e]" title="Gmail" aria-label="Gmail">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="h-px bg-gradient-to-r from-transparent via-[#a19b9c] to-transparent"></div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Hero -->
      <section class="relative h-[70vh] md:h-[80vh]">
        <div class="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop" alt="Carros en carretera" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/50"></div>
        </div>
        <div class="relative z-10 h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <h1 class="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-3">AutoSales</h1>
          <p class="text-white/90 text-xl md:text-2xl mb-6">Encuentra tu auto perfecto</p>
          <div class="w-full max-w-2xl flex items-center bg-white rounded-full shadow-lg overflow-hidden">
            <div class="px-4 text-[#a19b9c]">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </div>
            <input v-model="searchQuery" @keyup.enter="doSearch" type="text" placeholder="Buscar por marca, modelo, tipo de carrocería" class="flex-1 px-2 py-3 outline-none text-[#12161e]" />
            <button @click="doSearch" class="px-5 py-3 bg-[#12161e] text-white font-semibold hover:bg-opacity-90">Buscar</button>
          </div>
          <div class="mt-6 flex flex-wrap gap-3 justify-center">
            <button @click="doSearch" class="px-4 py-2 rounded-md border border-white/40 text-white/90 hover:bg-white/10">Marca / Modelo</button>
            <button @click="doSearch" class="px-4 py-2 rounded-md border border-white/40 text-white/90 hover:bg-white/10">Estilo de Carrocería</button>
            <button @click="doSearch" class="px-4 py-2 rounded-md border border-white/40 text-white/90 hover:bg-white/10">Precio</button>
          </div>
        </div>
      </section>
 
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#imports'

definePageMeta({
  layout: false,
})

const searchQuery = ref('')
const doSearch = () => {
  const q = searchQuery.value.trim()
  if (q) return navigateTo({ path: '/vehiculos', query: { q } })
  return navigateTo('/vehiculos')
}
</script>
