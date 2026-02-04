<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 v-if="!isCliente" class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Vehículos</h1>
          <h1 v-else class="text-4xl font-bold text-[#12161e] mb-2">Vehículos disponibles</h1>
          <p v-if="!isCliente" class="text-[#a19b9c]">Administra los vehículos del sistema</p>
        </div>
        <button
          v-if="isAdminOrVendedor"
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

      <!-- Contenido -->
      <div v-else>
        <!-- Vista para Cliente: Vehículos disponibles en tarjetas -->
        <div v-if="isCliente">
          <h2 class="text-2xl font-bold text-[#12161e] mb-4">Explora y reserva tu prueba</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="v in vehiculosDisponiblesFiltrados" :key="v.vehiculo_id" class="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
              <div class="h-44 w-full bg-gray-100">
                <NuxtImg
                  v-if="v.foto_url"
                  :src="imageUrl(v.foto_url)"
                  alt="Foto del vehículo"
                  class="w-full h-44 object-cover"
                  :width="640"
                  :height="360"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  format="webp"
                  loading="lazy"
                  placeholder="blur"
                />
                <div v-else class="w-full h-44 flex items-center justify-center text-gray-400 text-sm">Sin foto</div>
              </div>
              <div class="p-4 space-y-2">
                <div class="flex items-baseline justify-between">
                  <h3 class="text-lg font-semibold text-[#12161e]">{{ v.marca }} {{ v.modelo }}</h3>
                  <span class="text-[#12161e] font-bold">${{ formatPrecio(v.precio) }}</span>
                </div>
                <p class="text-sm text-[#a19b9c]">Año: {{ v.año }} · {{ v.tipo_combustible }} · {{ v.color }}</p>
                <p v-if="v.descripcion" class="text-sm text-[#12161e] line-clamp-2">{{ v.descripcion }}</p>
                <button @click="openBooking(v.vehiculo_id)" class="w-full mt-2 px-4 py-2 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90">Reservar cita</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista para Admin/Vendedor: Tabla -->
        <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
          <VehiculoTable
            :vehiculos="vehiculosFiltrados"
            @edit="openEditModal"
            @delete="confirmDelete"
          />
        </div>
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

    <!-- Booking Modal (Cliente) -->
    <Modal
      :is-open="isBookingOpen"
      title="Reservar Cita"
      :is-loading="bookingLoading"
      @close="closeBooking"
      @confirm="confirmBooking"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-[#12161e] mb-2">Fecha</label>
          <input v-model="bookingDate" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[#12161e] mb-2">Hora</label>
          <input v-model="bookingTime" type="time" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[#12161e] mb-2">Notas (opcional)</label>
          <textarea v-model="bookingNotes" rows="3" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e] resize-none" />
        </div>
        <div v-if="bookingError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ bookingError }}</div>
      </div>
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
import { useRoute, useState, useSeoMeta, useHead } from '#imports'
import Modal from '~/components/Modal.vue'
import VehiculoForm from '~/components/VehiculoForm.vue'
import VehiculoTable from '~/components/VehiculoTable.vue'

const API_URL = 'http://localhost:3000/api/vehiculos'
const USERS_URL = 'http://localhost:3000/api/usuarios'
const CITAS_URL = 'http://localhost:3000/api/citas'

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
  foto_url?: string | null
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

interface Cita {
  cita_id: number
  fecha_cita: string
  hora_cita: string
  estado: string
  notas: string
  usuario_id: number
  vehiculo_id: number
}

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador', 'Vendedor', 'Cliente'],
})

// Estado
const vehiculos = ref<Vehiculo[]>([])
const usuarios = ref<Usuario[]>([])
const citas = ref<Cita[]>([])
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

const { data: citasData, refresh: refreshCitas, pending: pendingCitas } = useFetch<Cita[]>(CITAS_URL, {
  server: false,
  onResponseError: (ctx) => {
    console.error('Error al cargar citas:', ctx.error)
  }
})

watch(citasData, (val) => {
  if (Array.isArray(val)) citas.value = val
}, { immediate: true })

const isLoading = computed(() => pendingVehiculos.value || pendingUsuarios.value || pendingCitas.value || loading.value)

// Búsqueda por query param `q`
const route = useRoute()
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : '').toLowerCase())
const vehiculosFiltrados = computed(() => {
  const term = q.value
  if (!term) return vehiculos.value
  return vehiculos.value.filter(v => {
    const texto = `${v.marca} ${v.modelo} ${v.color} ${v.tipo_combustible} ${v.descripcion} ${v.estado}`.toLowerCase()
    return texto.includes(term)
  })
})

// Rol actual y banderas
const user = useState<any>('auth_user', () => null)
const role = computed(() => String(user.value?.nombre_rol || '').toLowerCase().trim())
const isCliente = computed(() => role.value === 'cliente')
const isAdminOrVendedor = computed(() => role.value === 'administrador' || role.value === 'vendedor')

// Imagen absoluta desde backend
const imageUrl = (path?: string | null) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `http://localhost:3000${path}`
}

// Formateo de precio
const formatPrecio = (valor: number) => new Intl.NumberFormat('es-PE', { style: 'decimal' }).format(valor)

// Vehículos disponibles (sin citas pendientes)
const pendingVehiculoIds = computed(() => new Set(citas.value.filter(c => c.estado === 'Pendiente').map(c => c.vehiculo_id)))
const vehiculosDisponibles = computed(() => vehiculos.value.filter(v => !pendingVehiculoIds.value.has(v.vehiculo_id)))
const vehiculosDisponiblesFiltrados = computed(() => {
  const term = q.value
  const base = vehiculosDisponibles.value
  if (!term) return base
  return base.filter(v => {
    const texto = `${v.marca} ${v.modelo} ${v.color} ${v.tipo_combustible} ${v.descripcion}`.toLowerCase()
    return texto.includes(term)
  })
})

// POST (con imagen)
const createVehiculo = async (datos: VehiculoFormData, foto?: File | null) => {
  loading.value = true
  error.value = null
  try {
    const formData = new FormData()
    formData.append('marca', datos.marca)
    formData.append('modelo', datos.modelo)
    formData.append('precio', String(datos.precio))
    formData.append('año', datos.año)
    formData.append('kilometraje', datos.kilometraje)
    formData.append('color', datos.color)
    formData.append('tipo_combustible', datos.tipo_combustible)
    formData.append('descripcion', datos.descripcion)
    formData.append('estado', datos.estado)
    formData.append('usuario_id', String(datos.usuario_id))
    if (foto) formData.append('foto', foto)
    await $fetch(API_URL, { method: 'POST', body: formData as any })
    await refreshVehiculos()
  } catch (err) {
    error.value = (err as Error).message
    throw err
  } finally {
    loading.value = false
  }
}

// PUT (con imagen opcional)
const updateVehiculo = async (id: number, datos: VehiculoFormData, foto?: File | null) => {
  loading.value = true
  error.value = null
  try {
    const formData = new FormData()
    formData.append('marca', datos.marca)
    formData.append('modelo', datos.modelo)
    formData.append('precio', String(datos.precio))
    formData.append('año', datos.año)
    formData.append('kilometraje', datos.kilometraje)
    formData.append('color', datos.color)
    formData.append('tipo_combustible', datos.tipo_combustible)
    formData.append('descripcion', datos.descripcion)
    formData.append('estado', datos.estado)
    formData.append('usuario_id', String(datos.usuario_id))
    if (foto) formData.append('foto', foto)
    await $fetch(`${API_URL}/${id}`, { method: 'PUT', body: formData as any })
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

const handleFormSubmit = async (formData: VehiculoFormData, foto: File | null) => {
  try {
    if (isEditMode.value && editingId.value !== null) {
      await updateVehiculo(editingId.value, formData, foto)
    } else {
      await createVehiculo(formData, foto)
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

// Reserva de cita (Cliente)
const isBookingOpen = ref(false)
const bookingVehiculoId = ref<number | null>(null)
const bookingDate = ref<string>('')
const bookingTime = ref<string>('')
const bookingNotes = ref<string>('')
const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)

const today = () => new Date().toISOString().slice(0, 10)
const openBooking = (vehiculoId: number) => {
  bookingVehiculoId.value = vehiculoId
  bookingDate.value = today()
  bookingTime.value = ''
  bookingNotes.value = ''
  bookingError.value = null
  isBookingOpen.value = true
}
const closeBooking = () => { isBookingOpen.value = false }
const confirmBooking = async () => {
  if (!bookingVehiculoId.value) return
  if (!bookingDate.value || !bookingTime.value) {
    bookingError.value = 'Fecha y hora son requeridas'
    return
  }
  if (!user.value?.usuario_id) {
    bookingError.value = 'Usuario no autenticado'
    return
  }
  bookingLoading.value = true
  bookingError.value = null
  try {
    await $fetch('http://localhost:3000/api/citas', {
      method: 'POST',
      body: {
        fecha_cita: bookingDate.value,
        hora_cita: bookingTime.value,
        estado: 'Pendiente',
        notas: bookingNotes.value || '',
        usuario_id: user.value.usuario_id,
        vehiculo_id: bookingVehiculoId.value,
      }
    })
    await refreshCitas()
    isBookingOpen.value = false
  } catch (e: any) {
    bookingError.value = e?.data?.message || e?.message || 'Error al reservar la cita'
  } finally {
    bookingLoading.value = false
  }
}

useSeoMeta({
  title: computed(() => isCliente.value ? 'Vehículos disponibles' : 'Gestión de Vehículos'),
  description: 'Explora el catálogo de vehículos en AutoSales.',
  ogTitle: computed(() => isCliente.value ? 'Vehículos disponibles' : 'Gestión de Vehículos'),
  ogDescription: 'Explora el catálogo de vehículos en AutoSales.',
})
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>
