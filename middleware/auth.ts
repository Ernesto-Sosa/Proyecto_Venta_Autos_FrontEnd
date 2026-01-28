import { defineNuxtRouteMiddleware, navigateTo, useCookie, useState, useFetch } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const token = useCookie<string | null>('auth_token')
  const user = useState<any>('auth_user', () => null)

  // Public routes
  const publicPaths = ['/', '/login', '/register']
  if (publicPaths.includes(to.path)) return

  // Only enforce when page opts-in via meta
  const needsAuth = (to.meta as any)?.auth === true || Array.isArray((to.meta as any)?.roles)
  if (!needsAuth) return

  if (!token.value) {
    return navigateTo('/login')
  }

  if (!user.value) {
    try {
      const { data, error } = await useFetch<any>('http://localhost:3000/api/auth/me', { server: false, headers: token.value ? { Authorization: `Bearer ${token.value}` } : {} })
      if (error.value) return navigateTo('/login')
      user.value = data.value
    } catch {
      return navigateTo('/login')
    }
  }

  const requiredRoles = ((to.meta as any)?.roles as string[]) || []
  if (requiredRoles.length && user.value) {
    const hasRole = requiredRoles.includes(user.value.nombre_rol || '') || requiredRoles.includes(String(user.value.rol_id))
    if (!hasRole) return navigateTo('/')
  }
})
