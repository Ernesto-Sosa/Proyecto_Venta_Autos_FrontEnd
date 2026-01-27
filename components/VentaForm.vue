<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Fecha</label>
        <input v-model="formData.fecha" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Precio final</label>
        <input v-model.number="formData.precio_final" type="number" min="0" step="1" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Estado</label>
        <select v-model="formData.estado_venta" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required>
          <option value="Pendiente">Pendiente</option>
          <option value="Procesando">Procesando</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Usuario</label>
        <select v-model.number="formData.usuario_id" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required>
          <option v-for="u in usuarios" :key="u.usuario_id" :value="u.usuario_id">{{ u.nombre }} {{ u.apellido }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Vehículo</label>
        <select v-model.number="formData.vehiculo_id" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required>
          <option v-for="v in vehiculos" :key="v.vehiculo_id" :value="v.vehiculo_id">{{ v.marca }} {{ v.modelo }}</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Usuario { usuario_id: number; nombre: string; apellido: string }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface VentaFormData {
  fecha: string
  precio_final: number
  usuario_id: number
  vehiculo_id: number
  estado_venta: string
}

interface Props {
  initialData: VentaFormData
  usuarios: Usuario[]
  vehiculos: Vehiculo[]
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), { isEditMode: false })

const STORAGE_KEY = 'ventaFormData'
const formData = ref<VentaFormData>({
  fecha: props.initialData.fecha,
  precio_final: props.initialData.precio_final ?? 0,
  usuario_id: props.initialData.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
  vehiculo_id: props.initialData.vehiculo_id ?? (props.vehiculos[0]?.vehiculo_id || 1),
  estado_venta: props.initialData.estado_venta ?? 'Pendiente',
})

const emit = defineEmits<{ submit: [formData: VentaFormData] }>()

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && !props.isEditMode) {
    try { formData.value = JSON.parse(saved) } catch (e) { console.error(e) }
  }
})

watch(() => formData.value, (val) => {
  if (!props.isEditMode) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      fecha: newVal.fecha,
      precio_final: newVal.precio_final ?? 0,
      usuario_id: newVal.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
      vehiculo_id: newVal.vehiculo_id ?? (props.vehiculos[0]?.vehiculo_id || 1),
      estado_venta: newVal.estado_venta ?? 'Pendiente',
    }
  }
}, { deep: true, immediate: true })

const error = ref('')
const submit = () => {
  if (!formData.value.fecha || !formData.value.precio_final) {
    error.value = 'Fecha y precio son obligatorios'
    return
  }
  error.value = ''
  emit('submit', formData.value)
  localStorage.removeItem(STORAGE_KEY)
}

defineExpose({ submit })
</script>
