export default defineNuxtPlugin((nuxtApp) => {
  const token = useCookie<string | null>('auth_token')

  const authFetch = $fetch.create({
    onRequest({ options }) {
      if (!token.value) return
      const headers = new Headers(options.headers as HeadersInit)
      headers.set('Authorization', `Bearer ${token.value}`)
      options.headers = headers as any
    },
  })

  nuxtApp.provide('fetch', authFetch)
  ;(globalThis as any).$fetch = authFetch
})
