<template>
  <div class="overflow-x-auto">
    <div v-if="loading" class="text-center py-4">
      <div class="inline-block animate-spin">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
    
    <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
      {{ error }}
    </div>
    
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Teléfono
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rol
          </th>
          <th scope="col" class="relative px-6 py-3">
            <span class="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="usuario in usuarios" :key="usuario.usuario_id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ usuario.nombre }} {{ usuario.apellido }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ usuario.email }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">{{ usuario.telefono }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {{ getRolNombre(usuario.rol_id) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              @click="$emit('edit', usuario)"
              class="text-indigo-600 hover:text-indigo-900 mr-4"
            >
              Editar
            </button>
            <button
              @click="$emit('delete', usuario.usuario_id)"
              class="text-red-600 hover:text-red-900"
            >
              Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="usuarios.length === 0">
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">
            No hay usuarios registrados
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Rol {
  rol_id: number;
  nombre_rol: string;
  descripcion: string;
}

interface Usuario {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol_id: number;
}

interface Props {
  usuarios: Usuario[];
  roles: Rol[];
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

defineEmits<{
  edit: [usuario: Usuario];
  delete: [usuarioId: number];
}>();

const getRolNombre = (rolId: number): string => {
  const rol = props.roles.find(r => r.rol_id === rolId);
  return rol ? rol.nombre_rol : 'Sin rol';
};
</script>
