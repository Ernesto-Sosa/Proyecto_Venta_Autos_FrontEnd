<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Fecha</label>
        <input v-model="formData.fecha_cita" type="date" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Hora</label>
        <input v-model="formData.hora_cita" type="time" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Estado</label>
        <select v-model="formData.estado" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
          <option value="Completada">Completada</option>
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
      <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Notas</label>
        <textarea v-model="formData.notas" rows="4" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e] resize-none" placeholder="Opcional" />
      </div>
    </div>
    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Usuario { usuario_id: number; nombre: string; apellido: string }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface CitaFormData {
  fecha_cita: string
  hora_cita: string
  estado: string
  notas?: string
  usuario_id: number
  vehiculo_id: number
}

interface Props {
  initialData: CitaFormData
  usuarios: Usuario[]
  vehiculos: Vehiculo[]
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), { isEditMode: false })

const STORAGE_KEY = 'citaFormData'
const formData = ref<CitaFormData>({
  fecha_cita: props.initialData.fecha_cita,
  hora_cita: props.initialData.hora_cita,
  estado: props.initialData.estado ?? 'Pendiente',
  notas: props.initialData.notas ?? '',
  usuario_id: props.initialData.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
  vehiculo_id: props.initialData.vehiculo_id ?? (props.vehiculos[0]?.vehiculo_id || 1),
})

const emit = defineEmits<{ submit: [formData: CitaFormData] }>()

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && !props.isEditMode) {
    try { formData.value = JSON.parse(saved) } catch (e) { console.error(e) }
  }
})

watch(() => formData.value, (val) => {
  if (!props.isEditMode) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }
}, { deep: true })

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      fecha_cita: newVal.fecha_cita,
      hora_cita: newVal.hora_cita,
      estado: newVal.estado ?? 'Pendiente',
      notas: newVal.notas ?? '',
      usuario_id: newVal.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
      vehiculo_id: newVal.vehiculo_id ?? (props.vehiculos[0]?.vehiculo_id || 1),
    }
  }
}, { deep: true, immediate: true })

const error = ref('')
const submit = () => {
  // Validación mínima
  if (!formData.value.fecha_cita || !formData.value.hora_cita) {
    error.value = 'Fecha y hora son obligatorias'
    return
  }
  error.value = ''
  emit('submit', formData.value)
  localStorage.removeItem(STORAGE_KEY)
}

defineExpose({ submit })
</script>
