import { test, expect } from '@playwright/test'

// E2E para Usuarios: cubre UsuarioForm dentro de pages/usuarios.vue y tabla de usuarios

test.describe('Usuarios - E2E', () => {
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

    // Datos simulados
    const roles: Array<{ rol_id: number; nombre_rol: string; descripcion: string }> = [
      { rol_id: 1, nombre_rol: 'Admin', descripcion: 'Control total' },
      { rol_id: 2, nombre_rol: 'Vendedor', descripcion: 'Gestiona ventas' },
    ]

    const usuarios: Array<{ usuario_id: number; nombre: string; apellido: string; email: string; telefono: string; rol_id: number }> = [
      { usuario_id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@example.com', telefono: '123456789', rol_id: 2 },
    ]

    // GET roles
    await page.route('**/api/roles', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(roles) })
        return
      }
      await route.continue()
    })

    // GET/POST /api/usuarios
    await page.route('**/api/usuarios', async (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        await route.fulfill({ status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(usuarios) })
        return
      }
      if (method === 'POST') {
        const data = JSON.parse(route.request().postData() || '{}')
        const nuevo = { usuario_id: usuarios.length + 1, ...data }
        usuarios.push(nuevo)
        await route.fulfill({ status: 201, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(nuevo) })
        return
      }
      await route.continue()
    })

    // PUT/DELETE /api/usuarios/:id
    await page.route('**/api/usuarios/*', async (route) => {
      const url = new URL(route.request().url())
      const id = Number(url.pathname.split('/').pop())
      const method = route.request().method()
      if (method === 'PUT') {
        const data = JSON.parse(route.request().postData() || '{}')
        const idx = usuarios.findIndex((u) => u.usuario_id === id)
        if (idx !== -1) usuarios[idx] = { ...usuarios[idx], ...data, usuario_id: id }
        await route.fulfill({ status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' }, body: JSON.stringify(usuarios[idx]) })
        return
      }
      if (method === 'DELETE') {
        const idx = usuarios.findIndex((u) => u.usuario_id === id)
        if (idx !== -1) usuarios.splice(idx, 1)
        await route.fulfill({ status: 204, headers: { ...corsHeaders }, body: '' })
        return
      }
      await route.continue()
    })
  })

  test('lista usuarios y crea uno nuevo con UsuarioForm', async ({ page }) => {
    await page.goto('/usuarios')
    await page.waitForLoadState('networkidle')

    // Ver lista inicial
    await expect(page.getByText('Juan Pérez')).toBeVisible()
    await expect(page.getByText('juan@example.com')).toBeVisible()

    // Abrir modal crear
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click()

    // Completar formulario
    await page.locator('#nombre').fill('María')
    await page.locator('#apellido').fill('García')
    await page.locator('#email').fill('maria@example.com')
    await page.locator('#telefono').fill('987654321')

    // Seleccionar rol (select#rol_id)
    await page.locator('select#rol_id').selectOption('1')

    // Guardar
    await page.getByRole('button', { name: 'Guardar' }).click()

    // Debe aparecer en la tabla
    await expect(page.getByText('María García')).toBeVisible()
    await expect(page.getByText('maria@example.com')).toBeVisible()
  })

  test('editar usuario oculta campo contraseña (modo edición) y guarda cambios', async ({ page }) => {
    await page.goto('/usuarios')
    await page.waitForLoadState('networkidle')

    // Abrir edición del primer usuario
    const row = page.locator('tbody tr').first()
    await row.getByRole('button', { name: 'Editar' }).click()

    // El formulario en modo edición no debe mostrar el campo contraseña
    await expect(page.locator('#contraseña')).toHaveCount(0)

    // Cambiar nombre y apellido
    await page.locator('#nombre').fill('Juanito')
    await page.locator('#apellido').fill('Pérez Gómez')

    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Juanito Pérez Gómez')).toBeVisible()
  })

  test('elimina un usuario desde la tabla', async ({ page }) => {
    await page.goto('/usuarios')
    await page.waitForLoadState('networkidle')

    // Eliminar primer usuario
    const firstRow = page.locator('tbody tr').first()
    await firstRow.getByRole('button', { name: 'Eliminar' }).click()

    // Confirmación
    await page.getByRole('button', { name: 'Eliminar' }).click()

    // Verificación: el primer usuario ya no aparece
    await expect(page.getByText('Juan Pérez')).not.toBeVisible()
  })
})
