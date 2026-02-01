<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Citas</h1>
          <p class="text-[#a19b9c]">Administra las citas de prueba de manejo</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cita
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-[#12161e] mb-2">Estado</label>
            <select v-model="filtroEstado" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]">
              <option value="Todos">Todos</option>
              <option v-for="e in estadosCita" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[#12161e] mb-2">Desde</label>
            <input v-model="filtroDesde" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-[#12161e] mb-2">Hasta</label>
            <input v-model="filtroHasta" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
          </div>
          <div class="flex items-end">
            <button @click="limpiarFiltros" class="w-full px-4 py-2 border-2 border-[#a19b9c] text-[#12161e] rounded hover:bg-[#a19b9c] hover:text-white transition-colors">Limpiar</button>
          </div>
        </div>
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
        <CitaTable :citas="citasFiltradas" :usuarios="usuarios" :vehiculos="vehiculos" @edit="openEditModal" @delete="confirmDelete" />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Editar Cita' : 'Crear Nueva Cita'"
      :is-loading="loading"
      @close="closeModal"
      @confirm="handleSave"
    >
      <CitaForm
        ref="formRef"
        :initial-data="currentCita"
        :usuarios="usuarios"
        :vehiculos="vehiculos"
        :is-edit-mode="isEditMode"
        @submit="handleFormSubmit"
      />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-[#12161e] mb-4">Confirmar eliminación</h3>
        <p class="text-[#a19b9c] mb-6">¿Estás seguro de que deseas eliminar esta cita?</p>
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
import CitaForm from '~/components/CitaForm.vue'
import CitaTable from '~/components/CitaTable.vue'

const API_URL = 'http://localhost:3000/api/citas'
const USERS_URL = 'http://localhost:3000/api/usuarios'
const VEHICULOS_URL = 'http://localhost:3000/api/vehiculos'

interface Cita {
  cita_id: number
  fecha_cita: string
  hora_cita: string
  estado: string
  notas?: string
  usuario_id: number
  vehiculo_id: number
}

interface Usuario { usuario_id: number; nombre: string; apellido: string; email: string; telefono: string; rol_id: number }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface CitaFormData {
  fecha_cita: string
  hora_cita: string
  estado: string
  notas?: string
  usuario_id: number
  vehiculo_id: number
}

 
definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador', 'Vendedor'],
})

// Estado
const citas = ref<Cita[]>([])
const usuarios = ref<Usuario[]>([])
const vehiculos = ref<Vehiculo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filtros
const estadosCita: string[] = ['Pendiente', 'Confirmada', 'Cancelada', 'Completada']
const filtroEstado = ref<string>('Todos')
const filtroDesde = ref<string>('')
const filtroHasta = ref<string>('')
const isModalOpen = ref(false)
const isEditMode = ref(false)
const formRef = ref<{ submit: () => void } | null>(null)
const showDeleteConfirm = ref(false)
const citaToDelete = ref<number | null>(null)
const editingId = ref<number | null>(null)

const currentCita = ref<CitaFormData>({
  fecha_cita: '',
  hora_cita: '',
  estado: 'Pendiente',
  notas: '',
  usuario_id: 1,
  vehiculo_id: 1,
})

// GET con useFetch
const { data: citasData, refresh: refreshCitas, pending: pendingCitas } = useFetch<Cita[]>(API_URL, {
  server: false,
  onResponseError: (ctx) => { error.value = ctx.error?.message || 'Error al cargar las citas' }
})
watch(citasData, (val) => { if (Array.isArray(val)) citas.value = val }, { immediate: true })

const { data: usuariosData, pending: pendingUsuarios } = useFetch<Usuario[]>(USERS_URL, {
  server: false,
  onResponseError: (ctx) => { console.error('Error al cargar usuarios:', ctx.error) }
})
watch(usuariosData, (val) => { if (Array.isArray(val)) usuarios.value = val }, { immediate: true })

const { data: vehiculosData, pending: pendingVehiculos } = useFetch<Vehiculo[]>(VEHICULOS_URL, {
  server: false,
  onResponseError: (ctx) => { console.error('Error al cargar vehículos:', ctx.error) }
})
watch(vehiculosData, (val) => { if (Array.isArray(val)) vehiculos.value = val }, { immediate: true })

const isLoading = computed(() => pendingCitas.value || pendingUsuarios.value || pendingVehiculos.value || loading.value)

// Computed: citas filtradas
const citasFiltradas = computed(() => {
  const desde = filtroDesde.value
  const hasta = filtroHasta.value
  return citas.value.filter(c => {
    const estadoOk = filtroEstado.value === 'Todos' || c.estado === filtroEstado.value
    let dateStr = ''
    try { dateStr = new Date(c.fecha_cita).toISOString().slice(0, 10) } catch { dateStr = '' }
    const desdeOk = !desde || dateStr >= desde
    const hastaOk = !hasta || dateStr <= hasta
    return estadoOk && desdeOk && hastaOk
  })
})

// POST
const createCita = async (datos: CitaFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(API_URL, { method: 'POST', body: datos })
    await refreshCitas()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// PUT
const updateCita = async (id: number, datos: CitaFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'PUT', body: datos })
    await refreshCitas()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// DELETE
const deleteCita = async (id: number) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    await refreshCitas()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// UI handlers
const limpiarFiltros = () => {
  filtroEstado.value = 'Todos'
  filtroDesde.value = ''
  filtroHasta.value = ''
}
const openCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  currentCita.value = {
    fecha_cita: '',
    hora_cita: '',
    estado: 'Pendiente',
    notas: '',
    usuario_id: usuarios.value[0]?.usuario_id || 1,
    vehiculo_id: vehiculos.value[0]?.vehiculo_id || 1,
  }
  isModalOpen.value = true
}

const openEditModal = (c: Cita) => {
  isEditMode.value = true
  editingId.value = c.cita_id
  const { cita_id, ...data } = c
  currentCita.value = { ...data }
  isModalOpen.value = true
}

const closeModal = () => { isModalOpen.value = false }
const handleSave = () => { formRef.value?.submit() }

const handleFormSubmit = async (formData: CitaFormData) => {
  try {
    if (isEditMode.value && editingId.value !== null) {
      await updateCita(editingId.value, formData)
    } else {
      await createCita(formData)
    }
    isModalOpen.value = false
  } catch (e) {
    console.error('Error al guardar cita:', e)
  }
}

const confirmDelete = (id: number) => { citaToDelete.value = id; showDeleteConfirm.value = true }

const handleDelete = async () => {
  if (citaToDelete.value !== null) {
    try {
      await deleteCita(citaToDelete.value)
      showDeleteConfirm.value = false
      citaToDelete.value = null
    } catch (e) {
      console.error('Error al eliminar cita:', e)
    }
  }
}
</script>
