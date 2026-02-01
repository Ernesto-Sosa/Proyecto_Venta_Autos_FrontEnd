<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Ventas</h1>
          <p class="text-[#a19b9c]">Administra las ventas realizadas</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Venta
        </button>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-[#12161e] mb-2">Estado</label>
            <select v-model="filtroEstado" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]">
              <option value="Todos">Todos</option>
              <option v-for="e in estadosVenta" :key="e" :value="e">{{ e }}</option>
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
        <VentaTable :ventas="ventasFiltradas" :usuarios="usuarios" :vehiculos="vehiculos" @edit="openEditModal" @delete="confirmDelete" />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Editar Venta' : 'Crear Nueva Venta'"
      :is-loading="loading"
      @close="closeModal"
      @confirm="handleSave"
    >
      <VentaForm
        ref="formRef"
        :initial-data="currentVenta"
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
        <p class="text-[#a19b9c] mb-6">¿Estás seguro de que deseas eliminar esta venta?</p>
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
import VentaForm from '~/components/VentaForm.vue'
import VentaTable from '~/components/VentaTable.vue'

const API_URL = 'http://localhost:3000/api/ventas'
const USERS_URL = 'http://localhost:3000/api/usuarios'
const VEHICULOS_URL = 'http://localhost:3000/api/vehiculos'

interface Venta {
  venta_id: number
  fecha: string
  precio_final: number
  usuario_id: number
  vehiculo_id: number
  estado_venta: string
}

interface Usuario { usuario_id: number; nombre: string; apellido: string; email: string; telefono: string; rol_id: number }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface VentaFormData {
  fecha: string
  precio_final: number
  usuario_id: number
  vehiculo_id: number
  estado_venta: string
}

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador', 'Vendedor'],
})

// Estado
const ventas = ref<Venta[]>([])
const usuarios = ref<Usuario[]>([])
const vehiculos = ref<Vehiculo[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Filtros
const estadosVenta: string[] = ['Pendiente', 'Procesando', 'Completada', 'Cancelada']
const filtroEstado = ref<string>('Todos')
const filtroDesde = ref<string>('')
const filtroHasta = ref<string>('')
const isModalOpen = ref(false)
const isEditMode = ref(false)
const formRef = ref<{ submit: () => void } | null>(null)
const showDeleteConfirm = ref(false)
const ventaToDelete = ref<number | null>(null)
const editingId = ref<number | null>(null)

const currentVenta = ref<VentaFormData>({
  fecha: '',
  precio_final: 0,
  usuario_id: 1,
  vehiculo_id: 1,
  estado_venta: 'Pendiente',
})

// GET con useFetch
const { data: ventasData, refresh: refreshVentas, pending: pendingVentas } = useFetch<Venta[]>(API_URL, {
  server: false,
  onResponseError: (ctx) => { error.value = ctx.error?.message || 'Error al cargar las ventas' }
})
watch(ventasData, (val) => { if (Array.isArray(val)) ventas.value = val }, { immediate: true })

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

const isLoading = computed(() => pendingVentas.value || pendingUsuarios.value || pendingVehiculos.value || loading.value)

// Computed: ventas filtradas
const ventasFiltradas = computed(() => {
  const desde = filtroDesde.value
  const hasta = filtroHasta.value
  return ventas.value.filter(v => {
    const estadoOk = filtroEstado.value === 'Todos' || v.estado_venta === filtroEstado.value
    let dateStr = ''
    try { dateStr = new Date(v.fecha).toISOString().slice(0, 10) } catch { dateStr = '' }
    const desdeOk = !desde || dateStr >= desde
    const hastaOk = !hasta || dateStr <= hasta
    return estadoOk && desdeOk && hastaOk
  })
})

// POST
const createVenta = async (datos: VentaFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(API_URL, { method: 'POST', body: datos })
    await refreshVentas()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// PUT
const updateVenta = async (id: number, datos: VentaFormData) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'PUT', body: datos })
    await refreshVentas()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// DELETE
const deleteVenta = async (id: number) => {
  loading.value = true
  error.value = null
  try {
    await $fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    await refreshVentas()
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
  currentVenta.value = {
    fecha: new Date().toISOString().slice(0, 10),
    precio_final: 0,
    usuario_id: usuarios.value[0]?.usuario_id || 1,
    vehiculo_id: vehiculos.value[0]?.vehiculo_id || 1,
    estado_venta: 'Pendiente',
  }
  isModalOpen.value = true
}

const openEditModal = (v: Venta) => {
  isEditMode.value = true
  editingId.value = v.venta_id
  const fecha = (() => { try { return new Date(v.fecha).toISOString().slice(0, 10) } catch { return '' } })()
  currentVenta.value = {
    fecha,
    precio_final: v.precio_final,
    usuario_id: v.usuario_id,
    vehiculo_id: v.vehiculo_id,
    estado_venta: v.estado_venta,
  }
  isModalOpen.value = true
}

const closeModal = () => { isModalOpen.value = false }
const handleSave = () => { formRef.value?.submit() }

const handleFormSubmit = async (formData: VentaFormData) => {
  try {
    if (isEditMode.value && editingId.value !== null) {
      await updateVenta(editingId.value, formData)
    } else {
      await createVenta(formData)
    }
    isModalOpen.value = false
  } catch (e) {
    console.error('Error al guardar venta:', e)
  }
}

const confirmDelete = (id: number) => { ventaToDelete.value = id; showDeleteConfirm.value = true }

const handleDelete = async () => {
  if (ventaToDelete.value !== null) {
    try {
      await deleteVenta(ventaToDelete.value)
      showDeleteConfirm.value = false
      ventaToDelete.value = null
    } catch (e) {
      console.error('Error al eliminar venta:', e)
    }
  }
}
</script>
