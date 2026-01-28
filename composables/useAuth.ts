export interface AuthUser {
  usuario_id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol_id: number
  nombre_rol?: string
}

export const useAuth = () => {
  const token = useCookie<string | null>('auth_token', { sameSite: 'lax' })
  const user = useState<AuthUser | null>('auth_user', () => null)
  const pending = useState<boolean>('auth_pending', () => false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, contraseña: string) => {
    pending.value = true
    try {
      const resp = await $fetch<{ token: string; usuario: AuthUser }>('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: { email, contraseña },
      })
      token.value = resp.token
      user.value = resp.usuario
      return resp.usuario
    } finally {
      pending.value = false
    }
  }

  const fetchMe = async () => {
    pending.value = true
    try {
      const { data, error } = await useFetch<AuthUser>('http://localhost:3000/api/auth/me', { server: false })
      if (error.value) throw error.value
      user.value = data.value || null
      return user.value
    } finally {
      pending.value = false
    }
  }

  const logout = async () => {
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  return { token, user, pending, isAuthenticated, login, fetchMe, logout }
}
