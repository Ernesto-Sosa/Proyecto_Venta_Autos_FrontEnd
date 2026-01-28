<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-3xl mx-auto px-6 py-10">
      <h1 class="text-3xl font-bold text-[#12161e] mb-6">Mi Perfil</h1>

      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-[#12161e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 class="text-sm font-semibold text-[#a19b9c]">Nombre</h2>
            <p class="text-[#12161e]">{{ me?.nombre }} {{ me?.apellido }}</p>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[#a19b9c]">Email</h2>
            <p class="text-[#12161e]">{{ me?.email }}</p>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[#a19b9c]">Teléfono</h2>
            <p class="text-[#12161e]">{{ me?.telefono }}</p>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[#a19b9c]">Rol</h2>
            <p class="text-[#12161e]">{{ me?.nombre_rol || me?.rol_id }}</p>
          </div>
        </div>

        <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded text-sm">{{ error }}</div>

        <div class="pt-4">
          <button @click="goVehiculos" class="px-4 py-2 border-2 border-[#12161e] text-[#12161e] rounded hover:bg-[#12161e] hover:text-white transition-colors">
            Ver Vehículos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState, useFetch, navigateTo } from '#imports'

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador', 'Cliente']
})

const user = useState<any>('auth_user', () => null)
const { data, error, pending } = useFetch<any>('http://localhost:3000/api/auth/me', { server: false })
if (data.value) user.value = data.value

const me = user
const goVehiculos = () => navigateTo('/vehiculos')
</script>
