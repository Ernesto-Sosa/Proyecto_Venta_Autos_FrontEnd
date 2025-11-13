import { ref } from 'vue'

const API_URL = 'http://localhost:3000/api/roles'

interface Rol {
  rol_id: number
  nombre_rol: string
  descripcion: string
}

export const useRoles = () => {
  const roles = ref<Rol[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRoles = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Rol[]>(API_URL)
      roles.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  const createRol = async (datos: Omit<Rol, 'rol_id'>) => {
    loading.value = true
    error.value = null
    try {
      const newRol = await $fetch<Rol>(API_URL, {
        method: 'POST',
        body: datos,
      })
      roles.value.push(newRol)
      return newRol
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRol = async (id: number, datos: Omit<Partial<Rol>, 'rol_id'>) => {
    loading.value = true
    error.value = null
    try {
      const updatedRol = await $fetch<Rol>(`${API_URL}/${id}`, {
        method: 'PATCH',
        body: datos,
      })
      const index = roles.value.findIndex(r => r.rol_id === id)
      if (index !== -1) {
        roles.value[index] = {
          ...roles.value[index],
          ...updatedRol,
          rol_id: id
        }
      }
      return updatedRol
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRol = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
      roles.value = roles.value.filter(r => r.rol_id !== id)
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRol,
    updateRol,
    deleteRol,
  }
}