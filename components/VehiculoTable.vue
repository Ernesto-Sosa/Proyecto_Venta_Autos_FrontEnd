<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-[#12161e] text-white">
          <th class="px-6 py-3 text-left font-semibold">Foto</th>
          <th class="px-6 py-3 text-left font-semibold">Marca</th>
          <th class="px-6 py-3 text-left font-semibold">Modelo</th>
          <th class="px-6 py-3 text-left font-semibold">Precio</th>
          <th class="px-6 py-3 text-left font-semibold">Año</th>
          <th class="px-6 py-3 text-left font-semibold">Estado</th>
          <th class="px-6 py-3 text-center font-semibold">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="vehiculos.length === 0" class="border-b border-[#a19b9c]">
          <td colspan="7" class="px-6 py-8 text-center text-[#a19b9c]">
            No hay vehículos registrados
          </td>
        </tr>
        <tr v-for="v in vehiculos" :key="v.vehiculo_id" class="border-b border-[#a19b9c] hover:bg-gray-50 transition-colors">
          <td class="px-6 py-3">
            <img
              v-if="v.foto_url"
              :src="imageUrl(v.foto_url)"
              alt="Foto del vehículo"
              class="w-20 h-14 object-cover rounded border"
            />
            <div v-else class="w-20 h-14 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">Sin foto</div>
          </td>
          <td class="px-6 py-4 text-[#12161e] font-semibold">{{ v.marca }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ v.modelo }}</td>
          <td class="px-6 py-4 text-[#12161e]">${{ formatPrecio(v.precio) }}</td>
          <td class="px-6 py-4 text-[#12161e]">{{ v.año }}</td>
          <td class="px-6 py-4 text-[#a19b9c]">{{ v.estado }}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex gap-2 justify-center">
              <button @click="$emit('edit', v)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-semibold">Editar</button>
              <button @click="$emit('delete', v.vehiculo_id)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-semibold">Eliminar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Vehiculo {
  vehiculo_id: number
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
  foto_url?: string | null
}

interface Props {
  vehiculos: Vehiculo[]
}

defineProps<Props>()

defineEmits<{
  edit: [vehiculo: Vehiculo]
  delete: [vehiculoId: number]
}>()

const formatPrecio = (valor: number) => new Intl.NumberFormat('es-PE', { style: 'decimal' }).format(valor)
const imageUrl = (path?: string | null) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `http://localhost:3000${path}`
}
</script>
