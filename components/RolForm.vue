<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div>
      <label class="block text-sm font-semibold text-[#12161e] mb-2">
        Nombre del Rol
      </label>
      <input
        v-model="formData.nombre_rol"
        type="text"
        placeholder="Ej: Administrador"
        class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e] transition-colors"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-semibold text-[#12161e] mb-2">
        Descripción
      </label>
      <textarea
        v-model="formData.descripcion"
        placeholder="Describe el rol..."
        rows="4"
        class="w-full px-4 py-2 border-2 border-[#a19b9c] rounded focus:outline-none focus:border-[#12161e] transition-colors resize-none"
        required
      />
    </div>

    <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, watchEffect } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ nombre_rol: '', descripcion: '' }),
  },
})

const emit = defineEmits(['submit'])

const STORAGE_KEY = 'rolFormData'
const formData = ref({ ...props.initialData })
const error = ref('')

// Cargar datos del localStorage al montar el componente
onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    try {
      formData.value = JSON.parse(savedData)
    } catch (e) {
      console.error('Error al cargar datos del localStorage:', e)
    }
  }
})

// Guardar en localStorage cuando cambian los datos
watch(
  formData,
  (newData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  },
  { deep: true, flush: 'post' }
)

// Asegurar que los cambios se reflejen incluso sin eventos adicionales
watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formData.value))
})

watch(
  () => props.initialData,
  (newData) => {
    formData.value = { ...newData }
  },
  { deep: true }
)

const submit = () => {
  if (!formData.value.nombre_rol.trim() || !formData.value.descripcion.trim()) {
    error.value = 'Todos los campos son requeridos'
    return
  }
  error.value = ''
  emit('submit', formData.value)
  // Limpiar localStorage después de guardar
  localStorage.removeItem(STORAGE_KEY)
}

defineExpose({ submit })
</script>
