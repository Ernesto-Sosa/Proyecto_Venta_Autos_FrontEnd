<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-6xl mx-auto px-6 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold text-[#12161e] mb-2">Gestión de Usuarios</h1>
          <p class="text-[#a19b9c]">Administra los usuarios del sistema</p>
        </div>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-[#12161e] text-white rounded font-semibold hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin">
          <svg class="w-8 h-8 text-[#12161e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
        {{ error }}
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <UsuarioTable
          :usuarios="usuarios"
          :roles="roles"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'"
      :is-loading="loading"
      @close="closeModal"
      @confirm="handleSave"
    >
      <UsuarioForm 
        ref="formRef" 
        :initial-data="currentUsuario" 
        :roles="roles"
        :is-edit-mode="isEditMode"
        @submit="handleFormSubmit"
      />
    </Modal>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-[#12161e] mb-4">Confirmar eliminación</h3>
        <p class="text-[#a19b9c] mb-6">¿Estás seguro de que deseas eliminar este usuario?</p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 border-2 border-[#a19b9c] text-[#12161e] rounded hover:bg-[#a19b9c] hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="loading"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Modal from '~/components/Modal.vue';
import UsuarioForm from '~/components/UsuarioForm.vue';
import UsuarioTable from '~/components/UsuarioTable.vue';

const API_URL = 'http://localhost:3000/api/usuarios';
const ROLES_URL = 'http://localhost:3000/api/roles';

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
  contrasena?: string;
  telefono: string;
  rol_id: number;
}

interface UsuarioFormData {
  nombre: string;
  apellido: string;
  email: string;
  contraseña?: string;
  telefono: string;
  rol_id: number;
}

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
});

// Estados reactivos
const usuarios = ref<Usuario[]>([]);
const roles = ref<Rol[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentUsuario = ref<UsuarioFormData>({
  nombre: '',
  apellido: '',
  email: '',
  contraseña: '',
  telefono: '',
  rol_id: 1,
});
const formRef = ref<{ submit: () => void } | null>(null);
const showDeleteConfirm = ref(false);
const usuarioToDelete = ref<number | null>(null);

// Funciones de la API
const { data: usuariosData, refresh: refreshUsuarios } = useFetch<Usuario[]>(API_URL, {
  lazy: true,
  server: false,
  onResponseError: (context) => {
    error.value = context.error?.message || 'Error al cargar los usuarios';
    loading.value = false;
  },
  onResponse: () => {
    loading.value = false;
  }
});

// Sincronizar los datos de useFetch con la referencia reactiva
watch(usuariosData, (newData) => {
  if (Array.isArray(newData)) {
    usuarios.value = newData;
  }
}, { immediate: true });

// Cargar roles con useFetch
const { data: rolesData } = useFetch<Rol[]>(ROLES_URL, {
  server: false,
  onResponseError: (context) => {
    console.error('Error al cargar los roles:', context.error);
  }
});

// Sincronizar roles
watch(rolesData, (newData) => {
  if (Array.isArray(newData)) {
    roles.value = newData;
  }
}, { immediate: true });

const createUsuario = async (datos: Omit<Usuario, 'usuario_id'>) => {
  loading.value = true;
  error.value = null;
  try {
    const newUsuario = await $fetch<Usuario>(API_URL, {
      method: 'POST',
      body: datos,
    });
    // Actualizar la lista de usuarios
    await refreshUsuarios();
    return newUsuario;
  } catch (err) {
    error.value = (err as Error).message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const updateUsuario = async (id: number, datos: Partial<Usuario>) => {
  loading.value = true;
  error.value = null;
  try {
    const updatedUsuario = await $fetch<Usuario>(`${API_URL}/${id}`, {
      method: 'PUT',
      body: datos,
    });
    // Actualizar la lista de usuarios
    await refreshUsuarios();
    return updatedUsuario;
  } catch (err) {
    error.value = (err as Error).message;
    throw err;
  } finally {
    loading.value = false;
  }
};

const deleteUsuario = async (id: number) => {
  loading.value = true;
  error.value = null;
  try {
    await $fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    // Actualizar la lista de usuarios
    await refreshUsuarios();
  } catch (err) {
    error.value = (err as Error).message;
    throw err;
  } finally {
    loading.value = false;
  }
};

// Funciones de la interfaz de usuario
const openCreateModal = () => {
  isEditMode.value = false;
  currentUsuario.value = {
    nombre: '',
    apellido: '',
    email: '',
    contraseña: '',
    telefono: '',
    rol_id: roles.value[0]?.rol_id || 1,
  };
  isModalOpen.value = true;
};

const openEditModal = (usuario: Usuario) => {
  isEditMode.value = true;
  const { usuario_id, ...usuarioData } = usuario;
  currentUsuario.value = usuarioData as UsuarioFormData;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = () => {
  if (formRef.value) {
    formRef.value.submit();
  }
};

const handleFormSubmit = async (formData: UsuarioFormData) => {
  try {
    if (isEditMode.value) {
      // Encontrar el usuario actual para obtener su ID
      const usuarioActual = usuarios.value.find(u => u.email === currentUsuario.value.email);
      if (usuarioActual) {
        await updateUsuario(usuarioActual.usuario_id, formData);
      }
    } else {
      await createUsuario(formData);
    }
    isModalOpen.value = false;
  } catch (err) {
    console.error('Error al guardar el usuario:', err);
  }
};

const confirmDelete = (usuarioId: number) => {
  usuarioToDelete.value = usuarioId;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (usuarioToDelete.value !== null) {
    try {
      await deleteUsuario(usuarioToDelete.value);
      showDeleteConfirm.value = false;
      usuarioToDelete.value = null;
    } catch (err) {
      console.error('Error al eliminar el usuario:', err);
    }
  }
};

// Inicializar datos
onMounted(() => {
  // No es necesario cargar los datos aquí ya que se cargan automáticamente con useFetch
  // Los watchers se encargan de sincronizar los datos
});
</script>
