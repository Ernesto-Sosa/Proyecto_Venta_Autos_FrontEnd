<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-5xl mx-auto px-6 py-10">
      <h1 class="text-3xl font-bold text-[#12161e] mb-6">Mis Citas</h1>

      <div v-if="pendingCitas || pendingVehiculos" class="text-center py-12">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-[#12161e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
        {{ error }}
      </div>

      <div v-else-if="misCitas.length === 0" class="text-center py-12 text-[#a19b9c]">
        <p>No tienes citas programadas.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="c in misCitas" :key="c.cita_id" class="bg-white rounded-lg shadow p-6 border border-gray-100">
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-[#12161e]">
                {{ vehiculoNombre(c.vehiculo_id) }}
              </h2>
              <span :class="['px-3 py-1 rounded-full text-xs font-semibold', estadoClass(c.estado)]">{{ c.estado }}</span>
            </div>
            <p class="text-sm text-[#a19b9c]">
              <span class="font-semibold text-[#12161e]">Fecha:</span> {{ formatDate(c.fecha_cita) }}
            </p>
            <p class="text-sm text-[#a19b9c]">
              <span class="font-semibold text-[#12161e]">Hora:</span> {{ c.hora_cita }}
            </p>
            <p v-if="c.notas" class="text-sm text-[#a19b9c]"><span class="font-semibold text-[#12161e]">Notas:</span> {{ c.notas }}</p>
            <div class="flex gap-2 pt-2">
              <button
                v-if="c.estado === 'Pendiente'"
                @click="confirmCancel(c.cita_id)"
                class="px-3 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors text-sm"
              >Cancelar</button>
              <button
                v-if="c.estado === 'Pendiente'"
                :disabled="!canReschedule(c.cita_id)"
                @click="openReschedule(c)"
                class="px-3 py-2 border-2 rounded text-sm transition-colors"
                :class="canReschedule(c.cita_id) ? 'border-[#12161e] text-[#12161e] hover:bg-[#12161e] hover:text-white' : 'border-gray-300 text-gray-400 cursor-not-allowed'"
                title="Puedes reprogramar solo una vez"
              >Reprogramar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Cancelar -->
    <Modal
      :is-open="cancelOpen"
      title="Cancelar cita"
      :is-loading="cancelLoading"
      @close="closeCancel"
      @confirm="doCancel"
    >
      <div class="space-y-4">
        <p class="text-[#a19b9c]">¿Estás seguro de que deseas cancelar esta cita?</p>
        <div v-if="cancelError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ cancelError }}</div>
      </div>
    </Modal>

    <!-- Modal Reprogramar -->
    <Modal
      :is-open="reschedOpen"
      title="Reprogramar cita"
      :is-loading="reschedLoading"
      @close="closeReschedule"
      @confirm="doReschedule"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-[#12161e] mb-2">Nueva fecha</label>
          <input v-model="reschedDate" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-[#12161e] mb-2">Nueva hora</label>
          <input v-model="reschedTime" type="time" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" />
        </div>
        <div v-if="reschedError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ reschedError }}</div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useState, useFetch } from '#imports'
import Modal from '~/components/Modal.vue'

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Cliente']
})

const API_CITAS = 'http://localhost:3000/api/citas'
const API_VEHICULOS = 'http://localhost:3000/api/vehiculos'

interface Cita {
  cita_id: number
  fecha_cita: string
  hora_cita: string
  estado: string
  notas?: string
  usuario_id: number
  vehiculo_id: number
}
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

const user = useState<any>('auth_user', () => null)

const { data: citasData, error, pending: pendingCitas, refresh: refreshCitas } = useFetch<Cita[]>(API_CITAS, { server: false })
const citas = ref<Cita[]>([])
watch(citasData, (val) => { if (Array.isArray(val)) citas.value = val }, { immediate: true })

const { data: vehiculosData, pending: pendingVehiculos } = useFetch<Vehiculo[]>(API_VEHICULOS, { server: false })
const vehiculos = ref<Vehiculo[]>([])
watch(vehiculosData, (val) => { if (Array.isArray(val)) vehiculos.value = val }, { immediate: true })

const vehiculoNombre = (id: number) => {
  const v = vehiculos.value.find(v => v.vehiculo_id === id)
  return v ? `${v.marca} ${v.modelo}` : `Vehículo #${id}`
}

const misCitas = computed(() => citas.value.filter(c => c.usuario_id === user.value?.usuario_id))

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
const estadoClass = (estado: string) => {
  switch (estado) {
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'Confirmada': return 'bg-green-100 text-green-800'
    case 'Cancelada': return 'bg-red-100 text-red-800'
    case 'Completada': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Cancelar cita
const cancelOpen = ref(false)
const cancelId = ref<number | null>(null)
const cancelLoading = ref(false)
const cancelError = ref<string | null>(null)
const confirmCancel = (id: number) => { cancelId.value = id; cancelError.value = null; cancelOpen.value = true }
const closeCancel = () => { cancelOpen.value = false }
const doCancel = async () => {
  if (!cancelId.value) return
  try {
    cancelLoading.value = true
    cancelError.value = null
    await $fetch(`${API_CITAS}/${cancelId.value}`, { method: 'DELETE' })
    await refreshCitas()
    cancelOpen.value = false
  } catch (e: any) {
    cancelError.value = e?.data?.message || e?.message || 'No se pudo cancelar la cita'
  } finally {
    cancelLoading.value = false
  }
}

// Reprogramar (una sola vez)
const reschedOpen = ref(false)
const reschedId = ref<number | null>(null)
const reschedDate = ref('')
const reschedTime = ref('')
const reschedLoading = ref(false)
const reschedError = ref<string | null>(null)

const getReschedMap = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem('mis_citas_resched') || '{}') } catch { return {} }
}
const setReschedMap = (m: Record<string, number>) => localStorage.setItem('mis_citas_resched', JSON.stringify(m))
const canReschedule = (id: number) => (getReschedMap()[String(id)] || 0) < 1

const openReschedule = (c: Cita) => {
  reschedId.value = c.cita_id
  // fecha_cita puede venir como ISO; normalizar a yyyy-mm-dd
  const d = new Date(c.fecha_cita)
  reschedDate.value = isNaN(d.getTime()) ? '' : d.toISOString().slice(0,10)
  reschedTime.value = c.hora_cita || ''
  reschedError.value = null
  reschedOpen.value = true
}
const closeReschedule = () => { reschedOpen.value = false }
const doReschedule = async () => {
  if (!reschedId.value) return
  if (!reschedDate.value || !reschedTime.value) {
    reschedError.value = 'Fecha y hora son requeridas'
    return
  }
  // Encontrar cita actual para enviar campos completos en PUT
  const c = citas.value.find(x => x.cita_id === reschedId.value)
  if (!c) return
  try {
    reschedLoading.value = true
    reschedError.value = null
    await $fetch(`${API_CITAS}/${reschedId.value}`, {
      method: 'PUT',
      body: {
        fecha_cita: reschedDate.value,
        hora_cita: reschedTime.value,
        estado: c.estado,
        notas: c.notas || '',
        usuario_id: c.usuario_id,
        vehiculo_id: c.vehiculo_id,
      }
    })
    // Aumentar contador local de reprogramaciones
    const m = getReschedMap()
    m[String(reschedId.value)] = (m[String(reschedId.value)] || 0) + 1
    setReschedMap(m)
    await refreshCitas()
    reschedOpen.value = false
  } catch (e: any) {
    reschedError.value = e?.data?.message || e?.message || 'No se pudo reprogramar la cita'
  } finally {
    reschedLoading.value = false
  }
}
</script>
