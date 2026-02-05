import { test, expect } from '@playwright/test'

// E2E para Roles: cubre RolTable y RolForm dentro de pages/roles.vue

test.describe('Roles - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticación simulada: cookie + /api/auth/me
    await page.context().addCookies([
      { name: 'auth_token', value: 'e2e-token', url: 'http://localhost:3001' },
    ])
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    }

    // Responder preflight para cualquier endpoint del backend real (3000)
    await page.route('http://localhost:3000/api/**', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: corsHeaders, body: '' })
        return
      }
      await route.continue()
    })

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({
          usuario_id: 1,
          nombre: 'E2E',
          apellido: 'Tester',
          email: 'e2e@example.com',
          telefono: '000',
          rol_id: 1,
          nombre_rol: 'Administrador',
        }),
      })
    })

    // Estado simulado del backend
    const roles: Array<{ rol_id: number; nombre_rol: string; descripcion: string }> = [
      { rol_id: 1, nombre_rol: 'Admin', descripcion: 'Control total' },
      { rol_id: 2, nombre_rol: 'Vendedor', descripcion: 'Gestiona ventas' },
    ]

    // GET /api/roles
    await page.route('**/api/roles', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(roles) })
      } else if (route.request().method() === 'POST') {
        const data = JSON.parse(route.request().postData() || '{}')
        const newRol = { rol_id: roles.length + 1, ...data }
        roles.push(newRol)
        await route.fulfill({ status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(newRol) })
      } else {
        await route.continue()
      }
    })

    // PATCH/DELETE /api/roles/:id
    await page.route('**/api/roles/*', async (route) => {
      const url = new URL(route.request().url())
      const id = Number(url.pathname.split('/').pop())
      if (route.request().method() === 'PATCH') {
        const data = JSON.parse(route.request().postData() || '{}')
        const idx = roles.findIndex((r) => r.rol_id === id)
        if (idx !== -1) roles[idx] = { ...roles[idx], ...data, rol_id: id }
        await route.fulfill({ status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(roles[idx]) })
        return
      }
      if (route.request().method() === 'DELETE') {
        const idx = roles.findIndex((r) => r.rol_id === id)
        if (idx !== -1) roles.splice(idx, 1)
        await route.fulfill({ status: 204, headers: { ...corsHeaders }, body: '' })
        return
      }
      await route.continue()
    })
  })

  test('lista roles existentes y crea un nuevo rol', async ({ page }) => {
    await page.goto('/roles')
    await page.waitForLoadState('networkidle')

    // Ver lista inicial
    await expect(page.getByText('Admin')).toBeVisible()
    await expect(page.getByText('Vendedor')).toBeVisible()

    // Crear nuevo rol
    await page.getByRole('button', { name: 'Nuevo Rol' }).click()

    // Completar RolForm dentro del Modal
    await page.locator('input[placeholder="Ej: Administrador"]').fill('Soporte')
    await page.locator('textarea[placeholder="Describe el rol..."]').fill('Atiende incidencias')

    await page.getByRole('button', { name: 'Guardar' }).click()

    // Debe aparecer en la tabla
    await expect(page.getByText('Soporte')).toBeVisible()
    await expect(page.getByText('Atiende incidencias')).toBeVisible()
  })

  test('edita y elimina un rol', async ({ page }) => {
    await page.goto('/roles')
    await page.waitForLoadState('networkidle')

    // Editar Vendedor
    const vendedorRow = page.locator('tbody tr').filter({ hasText: 'Vendedor' })
    await vendedorRow.getByRole('button', { name: 'Editar' }).click()

    const desc = page.locator('textarea[placeholder="Describe el rol..."]')
    await desc.fill('Gestiona ventas y soporte')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Gestiona ventas y soporte')).toBeVisible()

    // Eliminar Admin
    const adminRow = page.locator('tbody tr').filter({ hasText: 'Admin' })
    await adminRow.getByRole('button', { name: 'Eliminar' }).click()

    // Confirmación
    await page.getByRole('button', { name: 'Eliminar' }).click()

    await expect(page.getByText('Admin')).not.toBeVisible()
  })
})
