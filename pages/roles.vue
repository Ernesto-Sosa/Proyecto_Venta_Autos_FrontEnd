<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Roles</h1>
          <p class="text-[#a19b9c]">Administra los roles del sistema</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-[#12161e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
        {{ error }}
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <RolTable :roles="roles" @edit="openEditModal" @delete="confirmDelete" />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'"
      :is-loading="loading"
      @close="closeModal"
      @confirm="handleSave"
    >
      <RolForm ref="formRef" :initial-data="currentRol" @submit="handleFormSubmit" />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-[#12161e] mb-4">Confirmar eliminación</h3>
        <p class="text-[#a19b9c] mb-6">¿Estás seguro de que deseas eliminar este rol?</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border-2 border-[#a19b9c] text-[#12161e] rounded hover:bg-[#a19b9c] hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="loading"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoles } from '~/composables/useRoles'
import Modal from '~/components/Modal.vue'
import RolForm from '~/components/RolForm.vue'
import RolTable from '~/components/RolTable.vue'

definePageMeta({
  layout: 'default',
})

const { roles, loading, error, fetchRoles, createRol, updateRol, deleteRol } = useRoles()

const isModalOpen = ref(false)
const isEditMode = ref(false)
const currentRol = ref({ nombre_rol: '', descripcion: '' })
const formRef = ref(null)
const showDeleteConfirm = ref(false)
const rolToDelete = ref(null)

onMounted(() => {
  fetchRoles()
})

const openCreateModal = () => {
  isEditMode.value = false
  currentRol.value = { nombre_rol: '', descripcion: '' }
  isModalOpen.value = true
}

const openEditModal = (rol) => {
  isEditMode.value = true
  currentRol.value = { ...rol }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSave = () => {
  formRef.value?.submit()
}

const handleFormSubmit = async (formData) => {
  try {
    if (isEditMode.value) {
      await updateRol(currentRol.value.rol_id, formData)
    } else {
      await createRol(formData)
    }
    closeModal()
  } catch (err) {
    console.error('Error:', err)
  }
}

const confirmDelete = (rolId) => {
  rolToDelete.value = rolId
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  try {
    await deleteRol(rolToDelete.value)
    showDeleteConfirm.value = false
    rolToDelete.value = null
  } catch (err) {
    console.error('Error:', err)
  }
}
</script>
