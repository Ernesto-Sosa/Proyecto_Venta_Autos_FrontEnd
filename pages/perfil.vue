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
        <div class="flex items-center gap-4">
          <img :src="me?.avatar_url || '/images/avatars/car-1.svg'" alt="Avatar" class="w-20 h-20 rounded-full ring-2 ring-white object-cover" />
          <div>
            <p class="text-lg font-semibold text-[#12161e]">{{ me?.nombre }} {{ me?.apellido }}</p>
            <button @click="openAvatarModal" class="mt-2 px-3 py-1 text-sm border-2 border-[#12161e] text-[#12161e] rounded hover:bg-[#12161e] hover:text-white transition-colors">Cambiar avatar</button>
          </div>
        </div>
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
        <div v-if="pwdSuccess" class="p-3 bg-green-100 text-green-700 rounded text-sm">{{ pwdSuccess }}</div>

        <div class="pt-4">
          <div class="flex gap-3 flex-wrap">
            <button @click="openPwdModal" class="px-4 py-2 border-2 border-[#12161e] text-[#12161e] rounded hover:bg-[#12161e] hover:text-white transition-colors">
              Cambiar contraseña
            </button>
            <button @click="goMisCitas" class="px-4 py-2 bg-[#12161e] text-white rounded hover:bg-opacity-90 transition-colors">
              Mis Citas
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    :is-open="pwdOpen"
    title="Cambiar contraseña"
    :is-loading="pwdLoading"
    @close="closePwdModal"
    @confirm="confirmPwdChange"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Contraseña actual</label>
        <input :type="showPasswords ? 'text' : 'password'" v-model="currentPassword" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Nueva contraseña</label>
        <input :type="showPasswords ? 'text' : 'password'" v-model="newPassword" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Confirmar contraseña</label>
        <input :type="showPasswords ? 'text' : 'password'" v-model="confirmPassword" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
      </div>
      <label class="inline-flex items-center gap-2 text-sm text-[#12161e]"><input type="checkbox" v-model="showPasswords" class="border-[#a19b9c]" /> Mostrar contraseñas</label>
      <div v-if="pwdError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ pwdError }}</div>
    </div>
  </Modal>

  <Modal
    :is-open="avatarOpen"
    title="Cambiar avatar"
    :is-loading="avatarLoading"
    @close="closeAvatarModal"
    @confirm="confirmAvatarChange"
  >
    <div class="space-y-4">
      <div>
        <h3 class="text-sm font-semibold text-[#12161e] mb-2">Elige un avatar</h3>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="(url, idx) in avatars"
            :key="idx"
            type="button"
            @click="selectedAvatar = url; uploadFile = null"
            class="relative aspect-square overflow-hidden rounded-lg border-2 hover:border-[#12161e]"
            :class="{ 'ring-2 ring-[#12161e]': selectedAvatar === url }"
          >
            <img :src="url" alt="Avatar" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-[#12161e] mb-2">O sube una imagen</h3>
        <input type="file" accept="image/*" @change="onAvatarFileChange" class="w-full text-sm" />
      </div>
      <div v-if="avatarError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ avatarError }}</div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from '~/components/Modal.vue'
import { useState, useFetch, navigateTo } from '#imports'

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador', 'Vendedor', 'Cliente']
})

const user = useState<any>('auth_user', () => null)
const { data, error, pending } = useFetch<any>('http://localhost:3000/api/auth/me', { server: false })
if (data.value) user.value = data.value

const me = user

// Cambiar contraseña
const pwdOpen = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwdLoading = ref(false)
const pwdError = ref<string | null>(null)
const pwdSuccess = ref<string | null>(null)
const showPasswords = ref(false)

const openPwdModal = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  pwdError.value = null
  pwdOpen.value = true
}
const closePwdModal = () => { pwdOpen.value = false }
const confirmPwdChange = async () => {
  if (!currentPassword.value) {
    pwdError.value = 'La contraseña actual es requerida'
    return
  }
  if (!newPassword.value || !confirmPassword.value) {
    pwdError.value = 'Ambos campos son requeridos'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    pwdError.value = 'Las contraseñas no coinciden'
    return
  }
  if (newPassword.value.length < 6) {
    pwdError.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  try {
    pwdLoading.value = true
    pwdError.value = null
    pwdSuccess.value = null
    // Verificar contraseña actual intentando login
    await $fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { email: me.value?.email, contraseña: currentPassword.value }
    })
    await $fetch(`http://localhost:3000/api/usuarios/${me.value?.usuario_id}`, {
      method: 'PUT',
      body: {
        nombre: me.value?.nombre,
        apellido: me.value?.apellido,
        email: me.value?.email,
        telefono: me.value?.telefono,
        rol_id: me.value?.rol_id,
        contraseña: newPassword.value,
        avatar_url: me.value?.avatar_url,
      }
    })
    pwdOpen.value = false
    pwdSuccess.value = 'Contraseña actualizada correctamente'
  } catch (e: any) {
    pwdError.value = e?.data?.message || e?.message || 'No se pudo cambiar la contraseña'
  } finally {
    pwdLoading.value = false
  }
}

// Navegar a Mis Citas
const goMisCitas = () => navigateTo('/mis-citas')

// Avatares
const avatars = [
  '/images/avatars/car-1.svg',
  '/images/avatars/car-2.svg',
  '/images/avatars/car-3.svg',
  '/images/avatars/car-4.svg',
  '/images/avatars/car-5.svg',
  '/images/avatars/car-6.svg',
]
const avatarOpen = ref(false)
const avatarLoading = ref(false)
const avatarError = ref<string | null>(null)
const selectedAvatar = ref<string>('')
const uploadFile = ref<File | null>(null)

const openAvatarModal = () => {
  selectedAvatar.value = me.value?.avatar_url || ''
  uploadFile.value = null
  avatarError.value = null
  avatarOpen.value = true
}
const closeAvatarModal = () => { avatarOpen.value = false }
const onAvatarFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  uploadFile.value = files && files[0] ? files[0] : null
  if (uploadFile.value) selectedAvatar.value = ''
}
const confirmAvatarChange = async () => {
  if (!me.value?.usuario_id) return
  try {
    avatarLoading.value = true
    avatarError.value = null
    let updatedUser: any = null
    if (uploadFile.value) {
      const fd = new FormData()
      fd.append('avatar', uploadFile.value)
      const resp: any = await $fetch(`http://localhost:3000/api/usuarios/${me.value.usuario_id}/avatar`, { method: 'PUT', body: fd })
      updatedUser = resp?.usuario
    } else if (selectedAvatar.value && selectedAvatar.value !== me.value?.avatar_url) {
      const resp: any = await $fetch(`http://localhost:3000/api/usuarios/${me.value.usuario_id}`, {
        method: 'PUT',
        body: {
          nombre: me.value?.nombre,
          apellido: me.value?.apellido,
          email: me.value?.email,
          telefono: me.value?.telefono,
          rol_id: me.value?.rol_id,
          avatar_url: selectedAvatar.value,
        }
      })
      updatedUser = resp?.usuario
    } else {
      avatarError.value = 'Selecciona un avatar o sube una imagen'
      return
    }
    if (updatedUser) {
      user.value = updatedUser
    }
    avatarOpen.value = false
  } catch (e: any) {
    avatarError.value = e?.data?.message || e?.message || 'No se pudo actualizar el avatar'
  } finally {
    avatarLoading.value = false
  }
}
</script>
