<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Marca</label>
        <input v-model="formData.marca" type="text" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Modelo</label>
        <input v-model="formData.modelo" type="text" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Precio</label>
        <input v-model.number="formData.precio" type="number" min="0" step="1" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Año</label>
        <input v-model="formData.año" type="text" placeholder="2021" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Kilometraje</label>
        <input v-model="formData.kilometraje" type="text" placeholder="50000 km" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Color</label>
        <input v-model="formData.color" type="text" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Tipo de combustible</label>
        <input v-model="formData.tipo_combustible" type="text" placeholder="Gasolina / Diésel / Eléctrico / Híbrido" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div>
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Estado</label>
        <input v-model="formData.estado" type="text" placeholder="Disponible / Vendido" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Descripción</label>
        <textarea v-model="formData.descripcion" rows="4" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e] resize-none" required />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Foto</label>
        <input type="file" accept="image/*" @change="onFileChange" class="w-full" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-semibold text-[#12161e] mb-2">Usuario</label>
        <select v-model.number="formData.usuario_id" class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e]" required>
          <option v-for="u in usuarios" :key="u.usuario_id" :value="u.usuario_id">
            {{ u.nombre }} {{ u.apellido }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

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

interface Props {
  initialData: VehiculoFormData
  usuarios: Usuario[]
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
})

const STORAGE_KEY = 'vehiculoFormData'
const formData = ref<VehiculoFormData>({
  marca: props.initialData.marca,
  modelo: props.initialData.modelo,
  precio: props.initialData.precio ?? 0,
  año: props.initialData.año,
  kilometraje: props.initialData.kilometraje,
  color: props.initialData.color,
  tipo_combustible: props.initialData.tipo_combustible,
  descripcion: props.initialData.descripcion,
  estado: props.initialData.estado,
  usuario_id: props.initialData.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
})

const emit = defineEmits<{
  submit: [formData: VehiculoFormData, foto: File | null]
}>()

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { formData.value = JSON.parse(saved) } catch (e) { console.error(e) }
  }
})

watch(() => formData.value, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      marca: newVal.marca,
      modelo: newVal.modelo,
      precio: newVal.precio ?? 0,
      año: newVal.año,
      kilometraje: newVal.kilometraje,
      color: newVal.color,
      tipo_combustible: newVal.tipo_combustible,
      descripcion: newVal.descripcion,
      estado: newVal.estado,
      usuario_id: newVal.usuario_id ?? (props.usuarios[0]?.usuario_id || 1),
    }
  }
}, { deep: true, immediate: true })

const error = ref('')
const fotoFile = ref<File | null>(null)
const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  fotoFile.value = input.files && input.files[0] ? input.files[0] : null
}
const submit = () => {
  // Validaciones mínimas
  if (!formData.value.marca.trim() || !formData.value.modelo.trim()) {
    error.value = 'Marca y modelo son obligatorios'
    return
  }
  error.value = ''
  emit('submit', formData.value, fotoFile.value)
  localStorage.removeItem(STORAGE_KEY)
}

defineExpose({ submit })
</script>
