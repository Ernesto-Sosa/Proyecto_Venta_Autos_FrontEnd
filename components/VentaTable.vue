<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#12161e] text-white">
          <th class="px-6 py-3 text-left font-semibold">Fecha</th>
          <th class="px-6 py-3 text-left font-semibold">Usuario</th>
          <th class="px-6 py-3 text-left font-semibold">Vehículo</th>
          <th class="px-6 py-3 text-left font-semibold">Precio</th>
          <th class="px-6 py-3 text-left font-semibold">Estado</th>
          <th class="px-6 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="ventas.length === 0" class="border-b border-[#a19b9c]">
          <td colspan="6" class="px-6 py-8 text-center text-[#a19b9c]">No hay ventas registradas</td>
        </tr>
        <tr v-for="v in ventas" :key="v.venta_id" class="border-b border-[#a19b9c] hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 text-[#12161e] font-semibold">{{ formatFecha(v.fecha) }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ getUsuarioNombre(v.usuario_id) }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ getVehiculoNombre(v.vehiculo_id) }}</td>
          <td class="px-6 py-4 text-[#12161e]">${{ formatPrecio(v.precio_final) }}</td>
          <td class="px-6 py-4 text-[#a19b9c]">{{ v.estado_venta }}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button @click="$emit('edit', v)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold">Editar</button>
              <button @click="$emit('delete', v.venta_id)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-semibold">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Venta {
  venta_id: number
  fecha: string
  precio_final: number
  usuario_id: number
  vehiculo_id: number
  estado_venta: string
}

interface Usuario { usuario_id: number; nombre: string; apellido: string }
interface Vehiculo { vehiculo_id: number; marca: string; modelo: string }

interface Props {
  ventas: Venta[]
  usuarios: Usuario[]
  vehiculos: Vehiculo[]
}

const props = defineProps<Props>()

defineEmits<{ edit: [venta: Venta]; delete: [ventaId: number] }>()

const formatFecha = (d: string) => {
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toISOString().slice(0, 10)
}

const formatPrecio = (valor: number) => new Intl.NumberFormat('es-PE', { style: 'decimal' }).format(valor)

const getUsuarioNombre = (id: number) => {
  const u = props.usuarios.find(u => u.usuario_id === id)
  return u ? `${u.nombre} ${u.apellido}` : `Usuario ${id}`
}

const getVehiculoNombre = (id: number) => {
  const v = props.vehiculos.find(v => v.vehiculo_id === id)
  return v ? `${v.marca} ${v.modelo}` : `Vehículo ${id}`
}
</script>
