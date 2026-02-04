import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UsuarioForm from '../components/UsuarioForm.vue'
import { nextTick } from 'vue'

const STORAGE_KEY = 'usuarioFormData'

const baseProps = {
  initialData: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    contraseña: '',
    telefono: '123456789',
    rol_id: 2,
  },
  roles: [
    { rol_id: 1, nombre_rol: 'Admin', descripcion: 'Control total' },
    { rol_id: 2, nombre_rol: 'Vendedor', descripcion: 'Gestiona ventas' },
  ],
}

describe('UsuarioForm.vue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza datos iniciales y opciones de roles', async () => {
    const wrapper = mount(UsuarioForm, { props: baseProps })
    
    // Asegurar que el DOM refleje v-model
    await nextTick()

    const nombre = wrapper.find('#nombre')
    const apellido = wrapper.find('#apellido')
    const email = wrapper.find('#email')
    const telefono = wrapper.find('#telefono')
    const selectRol = wrapper.find('select#rol_id')

    expect((nombre.element as HTMLInputElement).value).toBe('Juan')
    expect((apellido.element as HTMLInputElement).value).toBe('Pérez')
    expect((email.element as HTMLInputElement).value).toBe('juan@example.com')
    expect((telefono.element as HTMLInputElement).value).toBe('123456789')

    const options = selectRol.findAll('option')
    expect(options.length).toBe(2)
    expect((selectRol.element as HTMLSelectElement).value).toBe('2')
  })

  it('oculta campo contraseña en modo edición', async () => {
    const wrapper = mount(UsuarioForm, { props: { ...baseProps, isEditMode: true } })
    await nextTick()
    const password = wrapper.find('#contraseña')
    expect(password.exists()).toBe(false)
  })

  it('guarda en localStorage cuando cambia un campo', async () => {
    const wrapper = mount(UsuarioForm, { props: baseProps })
    await nextTick()
    const nombre = wrapper.find('#nombre')
    await nombre.setValue('Carlos')
    await nextTick()
    await nextTick()

    const saved = localStorage.getItem(STORAGE_KEY)
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved!)
    expect(parsed.nombre).toBe('Carlos')
  })

  it('emite submit con datos y limpia localStorage', async () => {
    const wrapper = mount(UsuarioForm, { props: baseProps })
    await nextTick()

    await wrapper.find('#nombre').setValue('María')
    await wrapper.find('#apellido').setValue('García')
    await nextTick()
    await nextTick()

    ;(wrapper.vm as any).submit()
    await nextTick()

    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({ nombre: 'María', apellido: 'García' })

    const saved = localStorage.getItem(STORAGE_KEY)
    expect(saved).toBeNull()
  })
})
