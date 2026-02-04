<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-[#12161e] mb-6">Trazas del Sistema</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="col-span-1 lg:col-span-2 bg-white border rounded-lg shadow-sm p-4">
          <h2 class="text-xl font-semibold text-[#12161e] mb-3">Sesiones recientes</h2>
          <div class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="min-w-full text-sm">
              <thead class="sticky top-0 bg-white z-10">
                <tr class="text-left text-gray-500 border-b">
                  <th class="py-2 pr-4">Usuario</th>
                  <th class="py-2 pr-4">Email</th>
                  <th class="py-2 pr-4">Login</th>
                  <th class="py-2 pr-4">Logout</th>
                  <th class="py-2 pr-4">IP</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sessions" :key="s.id" class="border-b last:border-0">
                  <td class="py-2 pr-4">{{ s.usuario?.nombre }} {{ s.usuario?.apellido }}</td>
                  <td class="py-2 pr-4">{{ s.usuario?.email }}</td>
                  <td class="py-2 pr-4">{{ formatDate(s.login_at) }}</td>
                  <td class="py-2 pr-4">{{ s.logout_at ? formatDate(s.logout_at) : '-' }}</td>
                  <td class="py-2 pr-4">{{ s.ip || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="bg-white border rounded-lg shadow-sm p-4">
          <h2 class="text-xl font-semibold text-[#12161e] mb-3">Ingresos por usuario</h2>
          <div v-if="loginCounts && loginCounts.length" class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="min-w-full text-sm">
              <thead class="sticky top-0 bg-white z-10">
                <tr class="text-left text-gray-500 border-b">
                  <th class="py-2 pr-4">Usuario</th>
                  <th class="py-2 pr-4">Email</th>
                  <th class="py-2 pr-4">Logins</th>
                  <th class="py-2 pr-4">Último login</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in loginCounts" :key="c.usuario_id" class="border-b last:border-0">
                  <td class="py-2 pr-4">{{ c.usuario?.nombre }} {{ c.usuario?.apellido }}</td>
                  <td class="py-2 pr-4">{{ c.usuario?.email }}</td>
                  <td class="py-2 pr-4">{{ c.logins }}</td>
                  <td class="py-2 pr-4">{{ c.last_login ? formatDate(c.last_login) : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-gray-500">Sin datos</p>
        </div>
      </div>

      <div class="mt-6 bg-white border rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold text-[#12161e]">Ventas recientes</h2>
          <div class="text-sm text-gray-600">Total: {{ salesSummary?.total || 0 }}</div>
        </div>
        <div class="overflow-x-auto max-h-96 overflow-y-auto">
          <table class="min-w-full text-sm">
            <thead class="sticky top-0 bg-white z-10">
              <tr class="text-left text-gray-500 border-b">
                <th class="py-2 pr-4">ID</th>
                <th class="py-2 pr-4">Fecha</th>
                <th class="py-2 pr-4">Usuario</th>
                <th class="py-2 pr-4">Vehículo</th>
                <th class="py-2 pr-4">Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in recentSales" :key="v.venta_id" class="border-b last:border-0">
                <td class="py-2 pr-4">#{{ v.venta_id }}</td>
                <td class="py-2 pr-4">{{ formatDate(v.fecha) }}</td>
                <td class="py-2 pr-4">{{ v.usuario_id }}</td>
                <td class="py-2 pr-4">{{ v.vehiculo_marca || 'Vehículo' }} {{ v.vehiculo_modelo || v.vehiculo_id }}</td>
                <td class="py-2 pr-4">${{ v.precio_final }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta, useHead, useCookie, useFetch } from '#imports'

definePageMeta({
  layout: 'default',
  auth: true,
  middleware: 'auth' as any,
  roles: ['Administrador'],
})

useSeoMeta({ title: 'Trazas — Administración' })
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const token = useCookie<string | null>('auth_token')
const authHeaders = computed<Record<string, string>>(() => {
  const h: Record<string, string> = {}
  if (token.value) h.Authorization = `Bearer ${token.value}`
  return h
})

const { data: sessionsData } = await useFetch<any[]>('http://localhost:3000/api/audit/sessions/recent?limit=100', {
  server: false,
  headers: authHeaders.value,
})
const { data: loginCountsData } = await useFetch<any[]>('http://localhost:3000/api/audit/sessions/login-counts', {
  server: false,
  headers: authHeaders.value,
})
const { data: salesSummaryData } = await useFetch<any>('http://localhost:3000/api/audit/sales/summary', {
  server: false,
  headers: authHeaders.value,
})
const { data: recentSalesData } = await useFetch<any[]>('http://localhost:3000/api/audit/sales/recent?limit=50', {
  server: false,
  headers: authHeaders.value,
})

const sessions = computed(() => sessionsData.value || [])
const loginCounts = computed(() => loginCountsData.value || [])
const salesSummary = computed(() => salesSummaryData.value || null)
const recentSales = computed(() => recentSalesData.value || [])

const formatDate = (d?: string | Date | null) => {
  if (!d) return '-'
  const dt = new Date(d)
  return dt.toLocaleString()
}
</script>
