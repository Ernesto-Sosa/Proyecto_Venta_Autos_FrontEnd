<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#12161e] text-white">
          <th class="px-6 py-3 text-left font-semibold">ID</th>
          <th class="px-6 py-3 text-left font-semibold">Nombre del Rol</th>
          <th class="px-6 py-3 text-left font-semibold">Descripción</th>
          <th class="px-6 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="roles.length === 0" class="border-b border-[#a19b9c]">
          <td colspan="4" class="px-6 py-8 text-center text-[#a19b9c]">
            No hay roles disponibles
          </td>
        </tr>
        <tr v-for="rol in roles" :key="rol.rol_id" class="border-b border-[#a19b9c] hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 text-[#12161e] font-semibold">{{ rol.rol_id }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ rol.nombre_rol }}</td>
          <td class="px-6 py-4 text-[#a19b9c]">{{ rol.descripcion }}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button
                @click="$emit('edit', rol)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold"
              >
                Editar
              </button>
              <button
                @click="$emit('delete', rol.rol_id)"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-semibold"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps({
  roles: {
    type: Array,
    required: true,
  },
})

defineEmits(['edit', 'delete'])
</script>
