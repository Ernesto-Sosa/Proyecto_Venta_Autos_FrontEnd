<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[85vh] flex flex-col">
      <div class="flex items-center justify-between p-6 border-b border-[#a19b9c]">
        <h2 class="text-xl font-bold text-[#12161e]">{{ title }}</h2>
        <button @click="close" class="text-[#a19b9c] hover:text-[#12161e] transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex-1 min-h-0">
        <slot />
      </div>
      <div class="flex gap-3 p-6 border-t border-[#a19b9c] justify-end">
        <button
          @click="close"
          class="px-4 py-2 border-2 border-[#a19b9c] text-[#12161e] rounded hover:bg-[#a19b9c] hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirm"
          :disabled="isLoading"
          class="px-4 py-2 bg-[#12161e] text-white rounded hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isOpen: Boolean,
  title: String,
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm'])

const close = () => emit('close')
const confirm = () => emit('confirm')
</script>
