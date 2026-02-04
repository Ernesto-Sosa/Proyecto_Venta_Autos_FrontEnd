<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-6 py-12">
    <div class="w-full max-w-lg bg-white shadow-md rounded-lg p-8 border-2 border-[#a19b9c] focus-within:border-[#12161e] transition-colors">
      <h1 class="text-2xl font-bold text-[#12161e] mb-6">Crear cuenta</h1>

      <form @submit.prevent="onSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-[#12161e] mb-1">Nombre</label>
          <input v-model="form.nombre" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-[#12161e] mb-1">Apellido</label>
          <input v-model="form.apellido" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-[#12161e] mb-1">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-[#12161e] mb-1">Teléfono</label>
          <input v-model="form.telefono" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-[#12161e] mb-1">Contraseña</label>
          <input v-model="form.contraseña" type="password" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        
        <!-- Avatares -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-[#12161e] mb-2">Elige un avatar</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="(url, idx) in avatars"
              :key="idx"
              type="button"
              @click="form.avatar_url = url"
              class="relative aspect-square overflow-hidden rounded-lg border-2 hover:border-[#12161e]"
              :class="{ 'ring-2 ring-[#12161e]': form.avatar_url === url }"
            >
              <img :src="url" alt="Avatar" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <div v-if="error" class="md:col-span-2 p-3 bg-red-100 text-red-700 rounded text-sm">{{ error }}</div>
        <div v-if="ok" class="md:col-span-2 p-3 bg-green-100 text-green-700 rounded text-sm">{{ ok }}</div>

        <div class="md:col-span-2">
          <button :disabled="loading" class="w-full px-4 py-2 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 disabled:opacity-50">
            {{ loading ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </div>
      </form>

      <p class="text-sm text-[#a19b9c] mt-4">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="text-[#12161e] underline">Inicia sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useFetch, navigateTo, useSeoMeta, useHead } from '#imports'
definePageMeta({ layout: 'auth' })
interface Rol { rol_id: number; nombre_rol: string; descripcion: string }
const { data: rolesData } = useFetch<Rol[]>('http://localhost:3000/api/roles', { server: false })
const clienteRoleId = computed(() => {
  const list = rolesData.value || []
  const found = list.find(r => r.nombre_rol === 'Cliente')
  return found ? found.rol_id : 1
})

interface RegisterForm {
  nombre: string
  apellido: string
  email: string
  contraseña: string
  telefono: string
  rol_id: number
  avatar_url?: string
}

const form = reactive<RegisterForm>({ nombre: '', apellido: '', email: '', contraseña: '', telefono: '', rol_id: 1, avatar_url: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const ok = ref<string | null>(null)

// Avatares disponibles (locales)
const avatars = [
  '/images/avatars/car-1.svg',
  '/images/avatars/car-2.svg',
  '/images/avatars/car-3.svg',
  '/images/avatars/car-4.svg',
  '/images/avatars/car-5.svg',
  '/images/avatars/car-6.svg',
]

const onSubmit = async () => {
  error.value = null
  ok.value = null
  loading.value = true
  try {
    form.rol_id = clienteRoleId.value
    await $fetch('http://localhost:3000/api/usuarios', { method: 'POST', body: form })
    ok.value = 'Cuenta creada. Ahora puedes iniciar sesión.'
    setTimeout(() => navigateTo('/login'), 1000)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Error al registrarse'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Crear cuenta',
  description: 'Regístrate en AutoSales para reservar pruebas de manejo y gestionar tus compras.',
  ogTitle: 'Crear cuenta',
  ogDescription: 'Regístrate en AutoSales para reservar pruebas de manejo y gestionar tus compras.',
})
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
