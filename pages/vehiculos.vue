<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Vehículos</h1>
          <p class="text-[#a19b9c]">Administra los vehículos del sistema</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Vehículo
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
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
        <VehiculoTable
          :vehiculos="vehiculos"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Editar Vehículo' : 'Crear Nuevo Vehículo'"
      :is-loading="loading"
      @close="closeModal"
      @confirm="handleSave"
    >
      <VehiculoForm
        ref="formRef"
        :initial-data="currentVehiculo"
        :usuarios="usuarios"
        :is-edit-mode="isEditMode"
        @submit="handleFormSubmit"
      />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-[#12161e] mb-4">Confirmar eliminación</h3>
        <p class="text-[#a19b9c] mb-6">¿Estás seguro de que deseas eliminar este vehículo?</p>
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
import { ref, watch, computed } from 'vue'
import Modal from '~/components/Modal.vue'
import VehiculoForm from '~/components/VehiculoForm.vue'
import VehiculoTable from '~/components/VehiculoTable.vue'

const API_URL = 'http://localhost:3000/api/vehiculos'
const USERS_URL = 'http://localhost:3000/api/usuarios'

interface Vehiculo {
  vehiculo_id: number
  marca: string
  modelo: string
  precio: number
  año: string
  kilometraje: string
  color: string
  tipo_combustible: string
  descripcion: string
  estado: string
  usuario_id: number
}

interface Usuario {
  usuario_id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol_id: number
}

interface VehiculoFormData {
  marca: string
  modelo: string
  precio: number
  año: string
  kilometraje: string
  color: string
  tipo_combustible: string
  descripcion: string
  estado: string
  usuario_id: number
}

definePageMeta({
  layout: 'default',
})

// Estado
const vehiculos = ref<Vehiculo[]>([])
const usuarios = ref<Usuario[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const isModalOpen = ref(false)
const isEditMode = ref(false)
const formRef = ref<{ submit: () => void } | null>(null)
const showDeleteConfirm = ref(false)
const vehiculoToDelete = ref<number | null>(null)
const editingId = ref<number | null>(null)

const currentVehiculo = ref<VehiculoFormData>({
  marca: '',
  modelo: '',
  precio: 0,
  año: '',
  kilometraje: '',
  color: '',
  tipo_combustible: '',
  descripcion: '',
  estado: 'Disponible',
  usuario_id: 1,
})

// GET con useFetch (regla del proyecto)
const { data: vehiculosData, refresh: refreshVehiculos, pending: pendingVehiculos } = useFetch<Vehiculo[]>(API_URL, {
  server: false,
  onResponseError: (ctx) => {
    error.value = ctx.error?.message || 'Error al cargar los vehículos'
  }
})

watch(vehiculosData, (val) => {
  if (Array.isArray(val)) vehiculos.value = val
}, { immediate: true })

const { data: usuariosData, pending: pendingUsuarios } = useFetch<Usuario[]>(USERS_URL, {
  server: false,
  onResponseError: (ctx) => {
    console.error('Error al cargar usuarios:', ctx.error)
  }
})

watch(usuariosData, (val) => {
  if (Array.isArray(val)) usuarios.value = val
}, { immediate: true })

const isLoading = computed(() => pendingVehiculos.value || pendingUsuarios.value || loading.value)

// POST
const createVehiculo = async (datos: VehiculoFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(API_URL, { method: 'POST', body: datos })
    await refreshVehiculos()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// PUT
const updateVehiculo = async (id: number, datos: VehiculoFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'PUT', body: datos })
    await refreshVehiculos()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// DELETE
const deleteVehiculo = async (id: number) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    await refreshVehiculos()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// UI handlers
const openCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  currentVehiculo.value = {
    marca: '', modelo: '', precio: 0, año: '', kilometraje: '', color: '', tipo_combustible: '', descripcion: '', estado: 'Disponible', usuario_id: usuarios.value[0]?.usuario_id || 1
  }
  isModalOpen.value = true
}

const openEditModal = (v: Vehiculo) => {
  isEditMode.value = true
  editingId.value = v.vehiculo_id
  const { vehiculo_id, ...data } = v
  currentVehiculo.value = { ...data }
  isModalOpen.value = true
}

const closeModal = () => { isModalOpen.value = false }

const handleSave = () => { formRef.value?.submit() }

const handleFormSubmit = async (formData: VehiculoFormData) => {
  try {
    if (isEditMode.value && editingId.value !== null) {
      await updateVehiculo(editingId.value, formData)
    } else {
      await createVehiculo(formData)
    }
    isModalOpen.value = false
  } catch (e) {
    console.error('Error al guardar vehículo:', e)
  }
}

const confirmDelete = (id: number) => {
  vehiculoToDelete.value = id
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (vehiculoToDelete.value !== null) {
    try {
      await deleteVehiculo(vehiculoToDelete.value)
      showDeleteConfirm.value = false
      vehiculoToDelete.value = null
    } catch (e) {
      console.error('Error al eliminar vehículo:', e)
    }
  }
}
</script>
