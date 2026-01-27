<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#12161e] text-white">
          <th class="px-6 py-3 text-left font-semibold">Fecha</th>
          <th class="px-6 py-3 text-left font-semibold">Hora</th>
          <th class="px-6 py-3 text-left font-semibold">Usuario</th>
          <th class="px-6 py-3 text-left font-semibold">Vehículo</th>
          <th class="px-6 py-3 text-left font-semibold">Estado</th>
          <th class="px-6 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="citas.length === 0" class="border-b border-[#a19b9c]">
          <td colspan="6" class="px-6 py-8 text-center text-[#a19b9c]">No hay citas registradas</td>
        </tr>
        <tr v-for="c in citas" :key="c.cita_id" class="border-b border-[#a19b9c] hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 text-[#12161e] font-semibold">{{ formatFecha(c.fecha_cita) }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ c.hora_cita }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ getUsuarioNombre(c.usuario_id) }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ getVehiculoNombre(c.vehiculo_id) }}</td>
          <td class="px-6 py-4 text-[#a19b9c]">{{ c.estado }}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button @click="$emit('edit', c)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold">Editar</button>
              <button @click="$emit('delete', c.cita_id)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-semibold">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Cita {
  cita_id: number
  fecha_cita: string
  hora_cita: string
  estado: string
  notas?: string
  usuario_id: number
  vehiculo_id: number
}

interface Usuario { usuario_id: number; nombre: string; apellido: string }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface Props {
  citas: Cita[]
  usuarios: Usuario[]
  vehiculos: Vehiculo[]
}

const props = defineProps<Props>()

defineEmits<{ edit: [cita: Cita]; delete: [citaId: number] }>()

const formatFecha = (d: string) => {
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toISOString().slice(0, 10)
}

const getUsuarioNombre = (id: number) => {
  const u = props.usuarios.find(u => u.usuario_id === id)
  return u ? `${u.nombre} ${u.apellido}` : `Usuario ${id}`
}

const getVehiculoNombre = (id: number) => {
  const v = props.vehiculos.find(v => v.vehiculo_id === id)
  return v ? `${v.marca} ${v.modelo}` : `Vehículo ${id}`
}
</script>
