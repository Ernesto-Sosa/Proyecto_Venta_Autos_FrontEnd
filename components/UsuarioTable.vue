<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#12161e] text-white">
          <th class="px-6 py-3 text-left font-semibold">Nombre</th>
          <th class="px-6 py-3 text-left font-semibold">Email</th>
          <th class="px-6 py-3 text-left font-semibold">Teléfono</th>
          <th class="px-6 py-3 text-left font-semibold">Rol</th>
          <th class="px-6 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="usuarios.length === 0" class="border-b border-[#a19b9c]">
          <td colspan="5" class="px-6 py-8 text-center text-[#a19b9c]">
            No hay usuarios registrados
          </td>
        </tr>
        <tr v-for="usuario in usuarios" :key="usuario.usuario_id" class="border-b border-[#a19b9c] hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 text-[#12161e] font-semibold">
            {{ usuario.nombre }} {{ usuario.apellido }}
          </td>
          <td class="px-6 py-4 text-[#12161e]">{{ usuario.email }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ usuario.telefono }}</td>
          <td class="px-6 py-4 text-[#a19b9c]">{{ getRolNombre(usuario.rol_id) }}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button
                @click="$emit('edit', usuario)"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold"
              >
                Editar
              </button>
              <button
                @click="$emit('delete', usuario.usuario_id)"
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
