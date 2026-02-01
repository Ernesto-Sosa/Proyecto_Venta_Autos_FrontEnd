<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-6 py-12">
    <div class="w-full max-w-md bg-white shadow-md rounded-lg p-8">
      <h1 class="text-2xl font-bold text-[#12161e] mb-6">Iniciar sesión</h1>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#12161e] mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#12161e] mb-1">Contraseña</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>

        <div v-if="error" class="p-3 bg-red-100 text-red-700 rounded text-sm">{{ error }}</div>

        <button :disabled="loading" class="w-full px-4 py-2 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 disabled:opacity-50">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="text-sm text-[#a19b9c] mt-4">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="text-[#12161e] underline">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCookie, useState } from '#imports'
definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const token = useCookie<string | null>('auth_token', { sameSite: 'lax' })
const user = useState<any>('auth_user', () => null)

const onSubmit = async () => {
  error.value = null
  loading.value = true
  try {
    const resp = await $fetch<{ token: string; usuario: any }>('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { email: email.value, contraseña: password.value },
    })
    token.value = resp.token
    user.value = resp.usuario
    await navigateTo('/vehiculos')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
