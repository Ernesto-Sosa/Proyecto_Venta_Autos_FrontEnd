<template>
  <form @submit.prevent="$emit('submit', formData)" class="space-y-4">
    <div>
      <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
      <input
        type="text"
        id="nombre"
        v-model="formData.nombre"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="apellido" class="block text-sm font-medium text-gray-700">Apellido</label>
      <input
        type="text"
        id="apellido"
        v-model="formData.apellido"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        v-model="formData.email"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div v-if="!isEditMode">
      <label for="contraseña" class="block text-sm font-medium text-gray-700">Contraseña</label>
      <input
        type="password"
        id="contraseña"
        v-model="formData.contraseña"
        :required="!isEditMode"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
      <input
        type="tel"
        id="telefono"
        v-model="formData.telefono"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>

    <div>
      <label for="rol_id" class="block text-sm font-medium text-gray-700">Rol</label>
      <select
        id="rol_id"
        v-model.number="formData.rol_id"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option v-for="rol in roles" :key="rol.rol_id" :value="rol.rol_id">
          {{ rol.nombre_rol }}
        </option>
      </select>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Rol {
  rol_id: number;
  nombre_rol: string;
  descripcion: string;
}

interface UsuarioFormData {
  nombre: string;
  apellido: string;
  email: string;
  contraseña?: string;
  telefono: string;
  rol_id: number;
}

interface Props {
  initialData: UsuarioFormData;
  roles: Rol[];
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
});

const STORAGE_KEY = 'usuarioFormData';
const formData = ref<UsuarioFormData>({
  nombre: props.initialData.nombre,
  apellido: props.initialData.apellido,
  email: props.initialData.email,
  contraseña: '',
  telefono: props.initialData.telefono,
  rol_id: props.initialData.rol_id,
});

const emit = defineEmits<{
  submit: [formData: UsuarioFormData]
}>();

// Cargar datos del localStorage al montar el componente
onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      formData.value = JSON.parse(savedData);
    } catch (e) {
      console.error('Error al cargar datos del localStorage:', e);
    }
  }
});

// Guardar en localStorage cuando cambian los datos
watch(formData, (newData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}, { deep: true, flush: 'post' });

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = {
      nombre: newVal.nombre,
      apellido: newVal.apellido,
      email: newVal.email,
      contraseña: '',
      telefono: newVal.telefono,
      rol_id: newVal.rol_id,
    };
  }
}, { deep: true, immediate: true });

const submit = () => {
  emit('submit', formData.value);
  // Limpiar localStorage después de guardar
  localStorage.removeItem(STORAGE_KEY);
};

defineExpose({
  submit
});
</script>
