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
import { ref, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ nombre_rol: '', descripcion: '' }),
  },
})

const emit = defineEmits(['submit'])

const formData = ref({ ...props.initialData })
const error = ref('')

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
}

defineExpose({ submit })
</script>
