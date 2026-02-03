<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Barra de navegación superior -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo y menú principal -->
          <div class="flex items-center">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-xl font-bold text-[#12161e]">
                AutoSales
              </NuxtLink>
            </div>
            
            <!-- Menú de navegación -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink 
                v-for="item in navigation" 
                :key="item.name" 
                :to="item.href"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{ 'border-indigo-500 text-gray-900': isActive(item.href) }"
              >
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Perfil y Cerrar Sesión -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center" v-if="isAuthenticated">
            <div class="relative ml-3">
              <div class="flex items-center">
                <img :src="avatarSrc" alt="Avatar" class="w-8 h-8 rounded-full ring-2 ring-white mr-2" />
                <NuxtLink 
                  to="/perfil" 
                  class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Mi Perfil
                </NuxtLink>
                <button 
                  @click="logout"
                  class="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium flex items-center"
                >
                  <span>Cerrar Sesión</span>
                  <svg class="ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Botón móvil -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span class="sr-only">Abrir menú principal</span>
              <svg
                class="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Menú móvil -->
      <div v-show="isMobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            :class="{ 'bg-indigo-50 border-indigo-500 text-indigo-700': isActive(item.href) }"
            @click="isMobileMenuOpen = false"
          >
            {{ item.name }}
          </NuxtLink>
          <div class="pt-4 pb-3 border-t border-gray-200" v-if="isAuthenticated">
            <div class="mt-3 space-y-1">
              <NuxtLink
                to="/perfil"
                class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                @click="isMobileMenuOpen = false"
              >
                <span class="inline-flex items-center gap-2">
                  <img :src="avatarSrc" alt="Avatar" class="w-6 h-6 rounded-full ring-2 ring-white" />
                  Mi Perfil
                </span>
              </NuxtLink>
              <button
                @click="logout"
                class="w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <div class="py-6">
      <main>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCookie, useState, navigateTo, useFetch } from '#imports'

const route = useRoute();
const isMobileMenuOpen = ref(false);

const token = useCookie<string | null>('auth_token')
const user = useState<any>('auth_user', () => null)
const isAuthenticated = computed(() => !!token.value)

onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    const { data, error } = await useFetch<any>('http://localhost:3000/api/auth/me', { server: false, headers: token.value ? { Authorization: `Bearer ${token.value}` } : {} })
    if (!error.value && data.value) user.value = data.value
  }
})

const avatarSrc = computed(() => {
  const url = user.value?.avatar_url
  if (!url) return '/images/avatars/car-1.svg'
  return url.startsWith('/uploads') ? `http://localhost:3000${url}` : url
})

const navigation = computed(() => {
  const items: Array<{ name: string; href: string }> = []
  const role = String(user.value?.nombre_rol || '').toLowerCase().trim()
  if (!isAuthenticated.value) {
    items.push({ name: 'Inicio', href: '/' })
  } else if (role === 'administrador') {
    items.push(
      { name: 'Inicio', href: '/' },
      { name: 'Roles', href: '/roles' },
      { name: 'Usuarios', href: '/usuarios' },
      { name: 'Vehículos', href: '/vehiculos' },
      { name: 'Citas', href: '/citas' },
      { name: 'Ventas', href: '/ventas' },
    )
  } else if (role === 'vendedor') {
    // Vendedor puede ver Vehículos, Citas y Ventas
    items.push(
      { name: 'Vehículos', href: '/vehiculos' },
      { name: 'Citas', href: '/citas' },
      { name: 'Ventas', href: '/ventas' },
    )
  } else if (role === 'cliente') {
    // Navegación para clientes autenticados
    items.push({ name: 'Vehículos', href: '/vehiculos' })
    items.push({ name: 'Mis Citas', href: '/mis-citas' })
  }
  return items
})

const isActive = (path: string) => {
  return route.path === path || (path !== '/' && route.path.startsWith(path));
};

const logout = () => {
  token.value = null
  user.value = null
  navigateTo('/')
}
</script>
